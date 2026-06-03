"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.changePasswordValidation = exports.updateProfileValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    (0, express_validator_1.body)("password").trim().notEmpty().withMessage("Password is required"),
];
exports.updateProfileValidation = [
    (0, express_validator_1.body)("firstName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("First name cannot be empty")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Last name cannot be empty")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),
];
exports.changePasswordValidation = [
    (0, express_validator_1.body)("currentPassword")
        .trim()
        .notEmpty()
        .withMessage("Current password is required"),
    (0, express_validator_1.body)("newPassword")
        .trim()
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters"),
];
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)("token").trim().notEmpty().withMessage("Reset token is required"),
    (0, express_validator_1.body)("newPassword")
        .trim()
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters"),
];
