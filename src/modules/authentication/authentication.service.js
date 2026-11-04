import { EmailSubjectEnum, LogOutTypeEnum, ProviderEnum } from "../../common/enum/index.js";
import { emailEvent } from "../../common/events/index.js";
import { BadRequestException, ConflictException, TooManyRequestsException, UnauthorizedException } from "../../common/exceptions/index.js";
import { resetPasswordKey, UserEmailKey, UserEmailLoginTrialsKey, UserEmailTrialsKey } from "../../common/keys/index.js";
import { createOne, findOne, updateOne } from "../../common/repository/index.js"
import { compare, encrypt, hash } from "../../common/security/index.js";
import { del, expire, get, incrBY, keys, set, ttl } from "../../common/services/index.js";
import { createCredintials, CreateRevokeToken, userBaserevokeTokenKey } from "../../common/token/index.js";
import { checkEmailBlock, recordFailedAttempt } from "../../common/utils/index.js";
import { cteateOTP, getValidationMessage } from "../../common/utils/index.js";
import { ACCESS_EXPIRES_IN, WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/model/index.js"
import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';

const client = new OAuth2Client();

// VerifyGoogle Account
const verifyGoogle = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDS,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
        BadRequestException({
            message: 'email is not verified'
        })
    }

    return payload
}

const getVerifiedGithubEmail = async (accessToken) => {
    const response = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve GitHub email");
    }

    const emails = await response.json();

    const primaryEmail = emails.find(
        (item) => item.primary && item.verified
    );

    if (!primaryEmail) {
        BadRequestException({
            message: "A verified primary GitHub email is required",
        });
    }

    return primaryEmail.email;
};

// Signup / Login with GitHub
export const signUpWithGithub = async ({ accessToken, profile }, issuer) => {
    const email = await getVerifiedGithubEmail(accessToken);

    const accountExist = await findOne({
        model: UserModel,
        filter: { email },
    });

    // Login if account exists
    if (accountExist) {
        if (accountExist.provider !== ProviderEnum.GITHUB) {
            ConflictException({
                message: "Invalid Account Provider",
            });
        }

        return {
            status: 200,
            data: await createCredintials(accountExist, issuer),
        };
    }

    // Prepare user name
    const fullName = (
        profile.displayName ||
        profile.username ||
        "GitHub User"
    ).trim();

    const [firstName, ...remainingNames] = fullName.split(/\s+/);

    const user = await createOne({
        model: UserModel,
        data: {
            firstName: firstName.length >= 2 ? firstName.slice(0, 20) : "GitHub",
            lastName: remainingNames.join(" ").length >= 2
                ? remainingNames.join(" ").slice(0, 20)
                : "User",
            email,
            confirmEmail: new Date(),
            image: profile.photos?.[0]?.value,
            provider: ProviderEnum.GITHUB,
        },
    });
    console.log(user)
    return {
        status: 201,
        data: await createCredintials(user, issuer),
    };
};


// SignupWithGamil
export const signUpWithGamail = async ({ idToken }, issuer) => {
    const { name, email, picture } = await verifyGoogle(idToken);
    console.log({ name, email, picture });

    const accountExist = await findOne({
        model: UserModel,
        filter: { email },
    })

    if (accountExist) {

        if (accountExist.provider != ProviderEnum.GOOGLE) {
            ConflictException({
                message: ' Invalid Account Provider'
            })
        }

        return { status: 200, data: await createCredintials(accountExist, issuer) }
    }

    // Create new Account
    const user = await createOne({
        model: UserModel,
        data: {
            userName: name,
            email,
            confirmEmail: new Date(),
            image: picture,
            provider: ProviderEnum.GOOGLE
        }
    })

    return { status: 201, data: await createCredintials(user, issuer) }

}


// send Email Otp
const sendEmailOtp = async ({
    email,
    userName,
    subject,
    expires = 120,
    maxtries = 3,
    blockInSecond = 300,
    eventName = 'confirmEmail',
}) => {
    const existOtp_TTL = await ttl({ key: UserEmailKey({ email, subject }), })

    if (existOtp_TTL > 0) {
        ConflictException({
            message: `You can request a new OTP after ${existOtp_TTL} seconds`
        })
    }

    const oldTrials = await get({ key: UserEmailTrialsKey({ email, subject }) }) ?? 0
    const remainingTime = await ttl({ key: UserEmailTrialsKey({ email, subject }) });

    if (oldTrials >= maxtries) {
        TooManyRequestsException({
            message: `Maximum OTP attempts reached. Please try again after ${remainingTime} minute(s).`,
        });
    }
    const otp = cteateOTP();
    await set({
        key: UserEmailKey({ email, subject }),
        value: await hash({
            plaintext: otp.toString()
        }),
        ttl: expires
    })

    const currentTrials = await incrBY({
        key: UserEmailTrialsKey({ email, subject }),
    })

    if (currentTrials == maxtries) {
        await expire({ key: UserEmailTrialsKey({ email, subject }), ttl: blockInSecond })
    }
    emailEvent.emit(eventName, {
        recipient: { to: email },
        subject,
        data: { code: otp, userName }
    })

}


// Signup
export const signUp = async ({ email, password, phone, DOB, userName, gender, role, provider }, lang) => {

    const dublicateAccount = await findOne({
        model: UserModel,
        filter: { email },
        select: 'email'
    })
    if (dublicateAccount) {
        ConflictException({
            message: getValidationMessage(lang, 120),
        });
    }

    const Account = await createOne({
        model: UserModel,
        data: {
            email,
            password: await hash({ plaintext: password }),
            phone: await encrypt(phone),
            DOB,
            userName,
            gender,
            role,
            provider,
        }
    })

    await sendEmailOtp({ email, userName, subject: EmailSubjectEnum.CONFIRM_EMAIL })

    return Account

}

// Confirm Email
export const confirmEmail = async ({ email, otp }) => {

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: false },
            provider: ProviderEnum.SYSTEM
        },
    })

    if (!user) {
        BadRequestException({
            message: "invalid account"
        })
    }

    const isOTPValid = await get({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
    })

    if (!isOTPValid || !(await compare(otp, isOTPValid))) {
        ConflictException({
            message: "invalid OTP"
        })
    }

    await updateOne({
        model: UserModel,
        update: {
            confirmEmail: Date.now(),
        },
        filter: {
            email,
        },
    })

    await del({
        key: await keys({
            prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
        }),
    })

    return


}

// ResendConfirmEmail
export const resendConfirmEmail = async ({ email }) => {

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: false },
            provider: ProviderEnum.SYSTEM
        },
    })

    if (!user) {
        ConflictException({
            message: "Your email is already confirmed or invalid account"
        })
    }

    await sendEmailOtp({ email, userName: user.userName, subject: EmailSubjectEnum.CONFIRM_EMAIL })

    return


}

// Forgot Password
export const forgotPassword = async ({ email }) => {

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            provider: ProviderEnum.SYSTEM
        },
    })

    if (!user) {
        BadRequestException({
            message: "invalid account"
        })
    }


    await sendEmailOtp({
        email,
        userName: user.userName,
        subject: EmailSubjectEnum.FORGOT_PASSWORD,
        eventName: 'forgotPassword',
    });

    return


}

// verify Password
export const verifyPassword = async ({ email, otp }) => {

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            provider: ProviderEnum.SYSTEM
        },
    })

    if (!user) {
        BadRequestException({
            message: "invalid account"
        })
    }

    const isOTPValid = await get({
        key: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }),
    })

    if (!isOTPValid || !(await compare(otp, isOTPValid))) {
        ConflictException({
            message: "invalid OTP"
        })
    }

    await del({
        key: await keys({
            prefix: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD })
        }),
    })

    const resetToken = crypto.randomUUID();

    await set({
        key: resetPasswordKey(resetToken),
        value: email,
        ttl: 300,
    });

    return resetToken


}

// Reset Password
export const resetPassword = async ({ email, newPassword, resetToken }) => {
    const key = resetPasswordKey(resetToken);

    const tokenEmail = await get({ key });

    if (!tokenEmail || tokenEmail !== email) {
        BadRequestException({
            message: 'Invalid or expired reset token',
        });
    }

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            provider: ProviderEnum.SYSTEM,
        },
    });

    if (!user) {
        BadRequestException({
            message: 'Invalid account',
        });
    }

    const hashPassword = await hash({
        plaintext: newPassword,
    });

    await updateOne({
        model: UserModel,
        filter: { _id: user._id },
        update: {
            $set: {
                password: hashPassword,
                ChangeAllCredintialTime: new Date(),
            },
        },
    });

    const revokeKeys = await keys({
        prefix: userBaserevokeTokenKey({ userId: user._id }),
    });

    if (revokeKeys.length) {
        await Promise.all(
            revokeKeys.map((revokeKey) => del({ key: revokeKey }))
        );
    }

    await del({ key });

    return;
};


// Login
export const login = async ({ email, password }, issuer) => {

    const subject = 'login';

    // Check Block
    await checkEmailBlock({ email, subject });

    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderEnum.SYSTEM,
            confirmEmail: { $exists: true },
        },
    });

    if (!account) {
        await recordFailedAttempt({ email, subject });

        UnauthorizedException({
            message: 'Invalid email or password',
        });
    }

    const match = await compare(password, account.password);

    if (!match) {
        await recordFailedAttempt({ email, subject });

        UnauthorizedException({
            message: 'Invalid email or password',
        });
    }

    if (!account.confirmEmail) {
        UnauthorizedException({
            message: 'Your Email is not Confirmed',
        });
    }

    // Reset Trials After Successful Login
    await del({
        key: UserEmailLoginTrialsKey({ email, subject }),
    });

    // await updateOne({
    //     model: UserModel,
    //     filter: { _id: account._id },
    //     update: {
    //         $unset: {
    //             ChangeAllCredintialTime: true,
    //         },
    //     },
    // });

    return await createCredintials(account, issuer);
};

// Rotate Token
export const rotateToken = async (payload, user, issuer) => {
    const accessExpiredAtMs = (payload.iat + ACCESS_EXPIRES_IN) * 1000   // to convert it to MS

    // Check Time of Access expired
    if (Date.now() < accessExpiredAtMs) {
        BadRequestException({
            message: 'Access token is still valid'
        })
    }

    const data = await createCredintials(user, issuer)
    await CreateRevokeToken({ payload })
    return data

}

// Logout
export const logOut = async (payload, user, { action = LogOutTypeEnum.LOGOUT_FROM_ONE_DEVICE }) => {

    switch (action) {
        case LogOutTypeEnum.LOGOUT_FROM_ALL_DEVICES:
            user.ChangeAllCredintialTime = new Date();
            await user.save();
            await del({
                key: await keys({
                    prefix: userBaserevokeTokenKey({ userId: payload.sub })
                })
            })
            break;

        default:
            return await CreateRevokeToken({ payload })

            break;
    }

}