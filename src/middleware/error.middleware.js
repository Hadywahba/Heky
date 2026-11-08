
import multer from 'multer';


export const globalErrorHandling = (error, req, res, next) => {

    if (error instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: 'File size exceeded the allowed limit',
            LIMIT_FILE_COUNT: 'Too many files uploaded',
            LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
            LIMIT_PART_COUNT: 'Too many multipart parts',
            LIMIT_FIELD_COUNT: 'Too many fields',
            LIMIT_FIELD_KEY: 'Field name is too long',
            LIMIT_FIELD_VALUE: 'Field value is too long',
        };

        error = new Error(
            messages[error.code] || 'File upload failed',
            { cause: { status: 400 } }
        );
    }

    const Status = error.cause?.status || 500;

    return res.status(Status).json({
        error_message: error.message || 'Server Error',
        Status,
        errors: error.cause?.errors || undefined,
        stack: process.env.NODE_ENV === 'development'
            ? error.stack
            : undefined,
        error: process.env.NODE_ENV === 'development'
            ? error
            : undefined,
    });
};
