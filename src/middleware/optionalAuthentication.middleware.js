
import { TokenTypeEnum } from "../common/enum/index.js";
import { decodeToken } from "../common/token/index.js";

export const optionalAuthenticationMiddleware = () => {
    return async (req, res, next) => {
        const { authorization } = req.headers;

        if (!authorization) {
            return next();
        }

        const { payload, user } = await decodeToken({
            authorization,
            tokenType: TokenTypeEnum.ACCESS,
            issuer: `${req.protocol}://${req.host}`
        });

        req.user = user;
        req.payload = payload;

        next();
    };
};
