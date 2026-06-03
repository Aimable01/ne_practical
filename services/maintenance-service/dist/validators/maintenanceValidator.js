"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMaintenanceValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createMaintenanceValidation = [
    (0, express_validator_1.body)('extinguisherId')
        .trim()
        .notEmpty()
        .withMessage('Extinguisher ID is required')
        .isMongoId()
        .withMessage('Invalid extinguisher ID'),
    (0, express_validator_1.body)('inspectorId')
        .trim()
        .notEmpty()
        .withMessage('Inspector ID is required')
        .isMongoId()
        .withMessage('Invalid inspector ID'),
    (0, express_validator_1.body)('actionsTaken')
        .trim()
        .notEmpty()
        .withMessage('Actions taken is required')
        .isLength({ min: 10 })
        .withMessage('Actions taken must be at least 10 characters'),
    (0, express_validator_1.body)('dateOfAction')
        .trim()
        .notEmpty()
        .withMessage('Date of action is required')
        .isISO8601()
        .withMessage('Invalid date format'),
    (0, express_validator_1.body)('conditionsNoted')
        .trim()
        .notEmpty()
        .withMessage('Conditions noted is required')
        .isLength({ min: 10 })
        .withMessage('Conditions noted must be at least 10 characters')
];
