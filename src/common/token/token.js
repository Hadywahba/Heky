import jwt from "jsonwebtoken"
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from "../../config.js"
import { RoleEnum, TokenTypeEnum } from "../enum/index.js"
import { findById, findOne } from "../repository/index.js"
import { BadRequestException, NotFoundException } from "../exceptions/index.js"
import { TokenModel, UserModel } from "../../DB/model/index.js"
import { v4 as uuid } from 'uuid'
// *************************** Generate Token *********************************
export const generateToken = async ({
    payload = {},
    signature = ACCESS_USER_TOKEN_SIGNATURE,
    options = {},
}) => {

    return jwt.sign(payload, signature, options)

}


// **************************** Verify Token *********************************

export const verifyToken = async ({
    token = '',
    signature = TokenTypeEnum.ACCESS,
    options = {},
}) => {

    return jwt.verify(token, signature, options)

}

// *************************** decode Token ***********************************

export const decodeToken = async ({ authorization, tokenType, issuer }) => {
    // decode
    const decode = jwt.decode(authorization)
    if (!decode?.aud?.length) {
        BadRequestException({
            message: 'audience is missing'
        })
    }
    const role = decode.aud[0];

    // Verify TOKEN
    const payload = await verifyToken({
        token: authorization,
        signature: await getSignature({
            tokenType,
            role
        }),
        options: { issuer }

    })

    // Check Token
    if (!payload) {
        BadRequestException({
            message: 'Invalid or expired authentication token.'
        })
    }

    const isRevoked = await findOne({
        model: TokenModel,
        filter: {
            jti: payload.jti
        }
    })

    if (isRevoked) {
        BadRequestException({
            message: 'Token is revoked , please login again'
        })
    }

    const user = await findById({
        model: UserModel,
        id: payload.sub,
        options: {
            select: "-password",

        }
    })

    if (user.ChangeAllCredintialTime?.getTime() || 0 > payload.iat * 1000) {
        BadRequestException({
            message: ' please login again'
        })
    }



    // Check User
    if (!user) {
        NotFoundException({ message: "User not found. Please log in again.", })
    }

    return { user, payload }
}

// **************************** Get Signature *********************************

export const getSignature = async ({
    tokenType = TokenTypeEnum.ACCESS,
    role = RoleEnum.User
} = {}) => {
    const signatures = await getSignatureByRole(role);
    return tokenType === TokenTypeEnum.ACCESS
        ? signatures.access
        : signatures.refresh;
}


// **************************** Get Token Signature *********************************

export const getSignatureByRole = async (
    role = RoleEnum.User,
) => {
    let signature = {};

    switch (role) {
        case RoleEnum.Admin:
            signature = {
                access: ACCESS_ADMIN_TOKEN_SIGNATURE,
                refresh: REFRESH_ADMIN_TOKEN_SIGNATURE,
            };
            break;

        default:
            signature = {
                access: ACCESS_USER_TOKEN_SIGNATURE,
                refresh: REFRESH_USER_TOKEN_SIGNATURE,
            };
            break;
    }

    return signature;
};


// ****************************  Token Credintials *********************************

export const createCredintials = async (account, issuer) => {
    const signature = await getSignatureByRole(account.role);
    const jwtid = uuid()
    const access_Token = await generateToken({
        payload: {
            sub: account._id,
            name: account.firstName
        },
        options: {
            expiresIn: ACCESS_EXPIRES_IN,
            issuer,
            audience: [account.role],
            jwtid
        },

        signature: signature.access
    })

    const refresh_Token = await generateToken({
        payload: {
            sub: account._id,
            name: account.firstName
        },
        options: {
            expiresIn: REFRESH_EXPIRES_IN,
            issuer,
            audience: [account.role],
            jwtid
        },

        signature: signature.refresh
    })

    return { access_Token, refresh_Token }
}