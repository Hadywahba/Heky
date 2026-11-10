import { proccessMulterUpload } from "../common/utils/multer/index.js";



export const saveMessageFiles = async (req, res, next) => {
    try {
        await proccessMulterUpload({
            customPath: 'message',
            validation: ['images'],
            req
        });

        next();
    } catch (error) {
        next(error);
    }
};
