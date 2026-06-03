"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionIdValidation = exports.updateInspectionValidation = exports.createInspectionValidation = void 0;
const express_validator_1 = require("express-validator");
const shared_1 = require("@fe-mis/shared");
exports.createInspectionValidation = [
    (0, express_validator_1.body)('extinguisherId')
        .trim()
        .notEmpty()
        .withMessage('Extinguisher ID is required')
        .isMongoId()
        .withMessage('Invalid extinguisher ID'),
    (0, express_validator_1.body)('scheduledDate')
        .trim()
        .notEmpty()
        .withMessage('Scheduled date is required')
        .isISO8601()
        .withMessage('Invalid scheduled date format'),
    (0, express_validator_1.body)('scheduledTime')
        .trim()
        .notEmpty()
        .withMessage('Scheduled time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format (HH:MM)'),
    (0, express_validator_1.body)('inspectorId')
        .trim()
        .notEmpty()
        .withMessage('Inspector ID is required')
        .isMongoId()
        .withMessage('Invalid inspector ID')
];
exports.updateInspectionValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .notEmpty()
        .withMessage('Inspection ID is required')
        .isMongoId()
        .withMessage('Invalid inspection ID'),
    (0, express_validator_1.body)('status')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Status cannot be empty')
        .isIn(Object.values(shared_1.InspectionStatus))
        .withMessage('Invalid inspection status'),
    (0, express_validator_1.body)('result')
        .optional()
        .trim(),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
];
exports.inspectionIdValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .notEmpty()
        .withMessage('Inspection ID is required')
        .isMongoId()
        .withMessage('Invalid inspection ID')
];
