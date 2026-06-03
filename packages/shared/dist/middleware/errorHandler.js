"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = [];
        Object.values(err).forEach((error) => {
            if (error.message) {
                errors.push(error.message);
            }
        });
        res.status(400).json({
            error: 'Validation Error',
            details: errors
        });
        return;
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        res.status(409).json({
            error: `${field} already exists`
        });
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({
            error: 'Invalid ID format'
        });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Invalid token'
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: 'Token expired'
        });
        return;
    }
    // Default error
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Route not found'
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map