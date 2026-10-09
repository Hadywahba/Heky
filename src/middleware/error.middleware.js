export const globalErrorHandling = (error, req, res, next) => {
    const Status = error.cause?.status || 500;
    return res.status(Status).json({
        error_message: error.message || 'Server Error',
        Status,
        errors: error.cause?.errors || undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        error: process.env.NODE_ENV === 'development' ? error : undefined,

    })
}