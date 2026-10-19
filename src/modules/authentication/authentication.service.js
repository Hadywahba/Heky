import { ProviderEnum } from "../../common/enum/index.js";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../../common/exceptions/index.js";
import { createOne, findOne } from "../../common/repository/index.js"
import { compare, encrypt, hash } from "../../common/security/index.js";
import { createCredintials } from "../../common/token/index.js";
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
export const signUp = async ({ email, password, phone, DOB, userName, gender, role, provider }) => {
    const dublicateAccount = await findOne({
        model: UserModel,
        filter: { email },
        select: 'email'
    })
    if (dublicateAccount) {
        ConflictException({
            message: 'Email already exists',
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
            provider
        }
    })
    return Account

}

// Login
export const login = async ({ email, password, provider }, issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM },
    })
    if (!account) {
        NotFoundException({
            message: 'Account not found',
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


    return await createCredintials(user, issuer)
}