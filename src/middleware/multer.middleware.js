
import { BadRequestException } from "../common/exceptions/index.js";
import { proccessMulterUpload } from "../common/utils/multer/index.js";

export const UploadMiddleware = ({
    isRequired = true,
    multerFn,
    customPath = 'assets',
    validation = [],
    saveFiles = true
}) => {
    return async (req, res, next) => {
        multerFn(req, res, async (error) => {
            if (error) {
                return next(BadRequestException({
                    message: error.message
                }));
            }

            if (
                isRequired &&
                !req.file &&
                !(Array.isArray(req.files) && req.files.length) &&
                !(typeof req.files === 'object' &&
                    req.files !== null &&
                    Object.keys(req.files).length)
            ) {
                return next(BadRequestException({
                    message: 'File is required'
                }));
            }

            try {
                if (saveFiles) {
                    await proccessMulterUpload({
                        customPath,
                        validation,
                        req
                    });
                }

                next();
            } catch (error) {
                next(new Error(error.message, {
                    cause: { status: 400 }
                }));
            }
        });
    };
};
