import { SystemLanguageEnum } from "../common/enum/index.js";
import { BadRequestException } from "../common/exceptions/index.js";

export const validation = (schema) => {

    return async (req, res, next) => {
        const lang = Number(req.headers['accept-language'] ?? SystemLanguageEnum.EN);
        req.language = lang;
        const validationResult = schema(lang).safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!validationResult.success) {
            BadRequestException({
                message: 'Validation failed',
                options: {
                    cause: {
                        status: 400,
                        errors: validationResult.error.issues,
                    },
                },
            });
        }

        req.validate = validationResult.data;
        next()
    }
}