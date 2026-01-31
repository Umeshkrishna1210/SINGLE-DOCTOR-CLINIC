// Centralized Error Handling Middleware

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error for debugging (in production, use proper logging service)
    console.error('ERROR:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        // Development: Send detailed error
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: Send user-friendly error
        if (err.isOperational) {
            // Operational, trusted error: send message to client
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or unknown error: don't leak details
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong. Please try again later.'
            });
        }
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

module.exports = { errorHandler, AppError };
