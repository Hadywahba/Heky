
import { ForbiddenException } from "../common/exceptions/index.js";

export const authorizationMiddleware = (accessRoles = []) => {
    return async (req, res, next) => {
        if (!accessRoles.includes(req.user.role)) {
            ForbiddenException({
                message: "You are not authorized to access this resource",
            })
        }

        next()
    }
}

