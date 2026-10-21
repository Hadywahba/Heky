import { TokenTypeEnum } from "../common/enum/index.js";
import { UnauthorizedException } from "../common/exceptions/index.js";
import { decodeToken } from "../common/token/index.js";


export const authenticationMiddleware = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;

        // Check Authenticated
        if (!authorization) {
            UnauthorizedException({
                message: 'You are not authenticated.',
            })
        }

        const { payload, user } = await decodeToken({
            authorization,
            tokenType,
            issuer: `${req.protocol}://${req.host}`
        })

        req.user = user;
        req.payload = payload;

        next()

    }
}

