import multer from "multer"
import { randomUUID } from "node:crypto"
import { BadRequestException } from "../../exceptions/index.js"
import { resolve } from "node:path";
import { readFile } from "fs/promises"
import { fileTypeFromBuffer } from "file-type"
import { mkdir, unlink, writeFile } from "node:fs/promises";

const fileValidation = {
    images: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
        'image/avif',
    ],

    videos: [
        'video/mp4',
        'video/mpeg',
        'video/webm',
        'video/quicktime',
        'video/ogg',
    ],

    files: [
        'application/pdf',
        'application/json',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
    ],
};

const removeBuffer = (file) => {
    const { buffer, ...fileData } = file;
    return fileData;
};

// File Filter (validation)
const createFileFilter = (validation) => {

    const allowedTypes = validation.flatMap(
        (type) => fileValidation[type] || []
    );

    return (req, file, cb) => {

        if (allowedTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        const error = BadRequestException({
            message: 'Invalid file format'
        })

        return cb(error);
    };
};

const validateFile = async ({ file, validation }) => {
    const result = await fileTypeFromBuffer(file.buffer);

    const allowedTypes = validation.flatMap(
        (type) => fileValidation[type] || []
    );

    if (!result || !allowedTypes.includes(result.mime)) {
        throw BadRequestException({
            message: 'Invalid file format'
        });
    }

    return result;
};


export const localFileUpload = ({ maxFileSize = 5, validation = ['images', 'videos', 'files'] } = {}) => {
    // const storage = multer.diskStorage({
    //     destination: (req, file, cb) => {
    //         cb(null, './public')
    //     },

    //     filename: (req, file, cb) => {
    //         console.log(file);
    //         cb(null, randomUUID() + file.originalname)


    //     }
    // })

    const storage = multer.memoryStorage()
    return multer({
        fileFilter: createFileFilter(validation),
        storage,
        limits: { fileSize: maxFileSize * 1024 * 1024 }           // 5 MByte
    })
}

export const proccessFile = async ({ customPath = 'assets', file, validation = [] }) => {
    const result = await validateFile({ file, validation });

    await mkdir(resolve(`./public/${customPath}`), { recursive: true })
    const uniquePath = `public/${customPath}/${randomUUID()}.${result.ext}`
    await writeFile(resolve(`./${uniquePath}`), file.buffer);
    file.finalPath = uniquePath
    return file

}

export const proccessFiles = async ({ customPath, files = [], validation = [] }) => {
    // Validate all files first
    for (const file of files) {
        await validateFile({ file, validation });
    }

    // Save only if all files are valid
    const assets = [];

    for (const file of files) {
        assets.push(await proccessFile({ customPath, file, validation }));
    }

    return assets;
}

export const proccessFields = async ({ customPath, fields = {}, validation = [] }) => {
    const assets = {};

    // Validate all files first
    for (const value of Object.values(fields)) {
        for (const file of value) {
            await validateFile({ file, validation });
        }
    }

    // Save only if all files are valid
    for (const [fieldName, files] of Object.entries(fields)) {
        assets[fieldName] = await proccessFiles({
            customPath,
            files,
            validation
        });
    }

    return assets;
};


export const proccessMulterUpload = ({ customPath = 'assets', validation = [] }) => {
    return async (req, res, next) => {

        if (req.file) {
            req.file = await proccessFile({ customPath, file: req.file, validation });
            req.file = removeBuffer(req.file);
        } else if (Array.isArray(req.files) && req.files.length) {
            req.files = await proccessFiles({ customPath, files: req.files, validation });
            req.files = req.files.map(removeBuffer);
        } else if (typeof req.files == "object" && Object.keys(req.files ?? {})?.length) {
            req.files = await proccessFields({ customPath, fields: req.files, validation });
            for (const field of Object.keys(req.files)) {
                req.files[field] = req.files[field].map(removeBuffer);
            }
        }

        next();

    }
}

//****************************** save success files from wrong files */
// export const proccessFiles = async ({ files = [], validation = [] }) => {
//     const asstes = [];
//     for (const file of files) {
//         const uploadFile = await proccessFile({ file, validation });
//         asstes.push(uploadFile)
//     }

//     return asstes
// }

// export const proccessFile = ({ validation = [] }) => {
//     return async (req, res, next) => {

//         if (!req.file) {
//             return next();
//         }

//         const filePath = resolve(`./${req.file.path}`);

//         const fileBuffer = await readFile(filePath);

//         const result = await fileTypeFromBuffer(fileBuffer);

//         const allowedTypes = validation.flatMap(
//             (type) => fileValidation[type] || []
//         );

//         if (!result || !allowedTypes.includes(result.mime)) {

//             await unlink(filePath);

//             throw BadRequestException({
//                 message: 'Invalid file format'
//             });
//         }

//         req.file.mimetype = result.mime;

//         return next();
//     }
// }







