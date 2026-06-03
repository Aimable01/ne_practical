"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extinguisherIdValidation = exports.updateExtinguisherValidation = exports.createExtinguisherValidation = void 0;
const express_validator_1 = require("express-validator");
const shared_1 = require("@fe-mis/shared");
exports.createExtinguisherValidation = [
    (0, express_validator_1.body)('serialNumber')
        .trim()
        .notEmpty()
        .withMessage('Serial number is required')
        .toUpperCase(),
    (0, express_validator_1.body)('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required'),
    (0, express_validator_1.body)('type')
        .trim()
        .notEmpty()
        .withMessage('Type is required')
        .isIn(Object.values(shared_1.ExtinguisherType))
        .withMessage('Invalid extinguisher type'),
    (0, express_validator_1.body)('size')
        .trim()
        .notEmpty()
        .withMessage('Size is required')
        .isIn(Object.values(shared_1.ExtinguisherSize))
        .withMessage('Invalid extinguisher size'),
    (0, express_validator_1.body)('installationDate')
        .trim()
        .notEmpty()
        .withMessage('Installation date is required')
        .isISO8601()
        .withMessage('Invalid installation date format'),
    (0, express_validator_1.body)('expiryDate')
        .trim()
        .notEmpty()
        .withMessage('Expiry date is required')
        .isISO8601()
        .withMessage('Invalid expiry date format')
];
exports.updateExtinguisherValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .notEmpty()
        .withMessage('Extinguisher ID is required')
        .isMongoId()
        .withMessage('Invalid extinguisher ID'),
    (0, express_validator_1.body)('serialNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Serial number cannot be empty')
        .toUpperCase(),
    (0, express_validator_1.body)('location')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Location cannot be empty'),
    (0, express_validator_1.body)('type')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Type cannot be empty')
        .isIn(Object.values(shared_1.ExtinguisherType))
        .withMessage('Invalid extinguisher type'),
    (0, express_validator_1.body)('size')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Size cannot be empty')
        .isIn(Object.values(shared_1.ExtinguisherSize))
        .withMessage('Invalid extinguisher size'),
    (0, express_validator_1.body)('installationDate')
        .optional()
        .trim()
        .isISO8601()
        .withMessage('Invalid installation date format'),
    (0, express_validator_1.body)('expiryDate')
        .optional()
        .trim()
        .isISO8601()
        .withMessage('Invalid expiry date format'),
    (0, express_validator_1.body)('status')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Status cannot be empty')
        .isIn(Object.values(shared_1.ExtinguisherStatus))
        .withMessage('Invalid extinguisher status')
];
exports.extinguisherIdValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .notEmpty()
        .withMessage('Extinguisher ID is required')
        .isMongoId()
        .withMessage('Invalid extinguisher ID')
];
