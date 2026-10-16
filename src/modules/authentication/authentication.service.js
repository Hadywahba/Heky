import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../../common/exceptions/index.js";
import { createOne, findOne } from "../../common/repository/index.js"
import { compare, encrypt, hash } from "../../common/security/index.js";
import { createCredintials } from "../../common/token/index.js";
import { ACCESS_EXPIRES_IN } from "../../config.js";
import { UserModel } from "../../DB/model/index.js"

// Signup
export const signUp = async ({ email, password, phone, DOB, userName, gender, role }) => {
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
            role
        }
    })
    return Account

}

// Login
export const login = async ({ email, password }, issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: { email },
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