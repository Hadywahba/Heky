import { EmailSubjectEnum, LogOutTypeEnum, ProviderEnum, SecuirtyHashEnum } from "../../common/enum/index.js";
import { emailEvent } from "../../common/events/index.js";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../../common/exceptions/index.js";
import { createOne, findOne, findOneAndUpdate, updateOne } from "../../common/repository/index.js"
import { compare, encrypt, hash } from "../../common/security/index.js";
import { del, keys } from "../../common/services/index.js";
import { createCredintials, CreateRevokeToken, userBaserevokeTokenKey } from "../../common/token/index.js";
import { cteateOTP, getValidationMessage } from "../../common/utils/index.js";
import { ACCESS_EXPIRES_IN, WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/model/index.js"
import { OAuth2Client } from 'google-auth-library';


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


// Signup
export const signUp = async ({ email, password, phone, DOB, userName, gender, role, provider }, lang) => {

    const otp = cteateOTP();
    const hashedOTP = await hash({
        approach: SecuirtyHashEnum.ARGON2,
        plaintext: JSON.stringify(otp)
    })

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
            confirmEmailOTP: hashedOTP
        }
    })

    emailEvent.emit('confirmEmail', {
        recipient: { to: email },
        subject: EmailSubjectEnum.CONFIRM_EMAIL,
        data: { code: otp, userName }
    })
    return Account

}

// Confirm Email
export const confirmEmail = async ({ email, otp }) => {

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: false },
            confirmEmailOTP: { $exists: true },
            provider: ProviderEnum.SYSTEM
        },
    })

    if (!user) {
        BadRequestException({
            message: "invalid account"
        })
    }

    const isOTPValid = await compare(
        String(otp),
        user.confirmEmailOTP,
        SecuirtyHashEnum.ARGON2,
    )

    if (!isOTPValid) {
        BadRequestException({
            message: "invalid OTP"
        })
    }

    await updateOne({
        model: UserModel,
        update: {
            confirmEmail: Date.now(),
            $unset: { confirmEmailOTP: true }
        },
        filter: {
            email,
        },
    })

    return


}

// Forgot Password
export const forgotPassword = async ({ email }) => {
    const otp = cteateOTP();
    const hashedOTP = await hash({
        approach: SecuirtyHashEnum.ARGON2,
        plaintext: JSON.stringify(otp)
    })

    const user = await findOneAndUpdate({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            provider: ProviderEnum.SYSTEM
        },
        update: {
            forgotpasswordOTP: hashedOTP
        }
    })

    if (!user) {
        BadRequestException({
            message: "invalid account"
        })
    }


    emailEvent.emit('forgotPassword', {
        recipient: { to: email },
        subject: EmailSubjectEnum.FORGOT_PASSWORD,
        data: { code: otp, userName: user.userName }
    })

    return


}

// Reset Password
export const resetPassword = async ({ email, otp, newPassword }) => {

    const user = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            forgotpasswordOTP: { $exists: true },
            provider: ProviderEnum.SYSTEM
        },
    })

    if (!user) {
        BadRequestException({
            message: "invalid account"
        })
    }

    const isOTPValid = await compare(
        String(otp),
        user.forgotpasswordOTP,
        SecuirtyHashEnum.ARGON2,
    )

    if (!isOTPValid) {
        BadRequestException({
            message: "invalid OTP"
        })
    }

    const hashPassword = await hash
        ({ plaintext: newPassword })


    await updateOne({
        model: UserModel,
        update: {
            password: hashPassword,
            $unset: { forgotpasswordOTP: true }
        },
        filter: {
            email,
        },
    })

    return


}


// Login
export const login = async ({ email, password }, issuer) => {
    const account = await findOneAndUpdate({
        model: UserModel,
        filter: {
            email,
            provider: ProviderEnum.SYSTEM,
        },
        update: {
            $unset: { ChangeAllCredintialTime: true }
        }
    })

    if (!account) {
        NotFoundException({
            message: 'Account not found',
        });
    }

    if (!account.confirmEmail) {
        UnauthorizedException({
            message: 'Your Email is not Confirmed',
        });
    }

    const match = await compare(password, account.password)
    if (!match) {
        UnauthorizedException({
            message: 'Invalid password',
        });
    }

    return await createCredintials(account, issuer)


}

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