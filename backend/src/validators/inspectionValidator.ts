import { body, param, ValidationChain } from 'express-validator';
import { InspectionStatus } from '../models/Inspection';

export const createInspectionValidation: ValidationChain[] = [
  body('extinguisherId')
    .trim()
    .notEmpty()
    .withMessage('Extinguisher ID is required')
    .isMongoId()
    .withMessage('Invalid extinguisher ID'),
  body('scheduledDate')
    .trim()
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  body('scheduledTime')
    .trim()
    .notEmpty()
    .withMessage('Scheduled time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM format'),
  body('inspectorId')
    .trim()
    .notEmpty()
    .withMessage('Inspector ID is required')
    .isMongoId()
    .withMessage('Invalid inspector ID')
];

export const updateInspectionValidation: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Inspection ID is required')
    .isMongoId()
    .withMessage('Invalid inspection ID'),
  body('status')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Status cannot be empty')
    .isIn(Object.values(InspectionStatus))
    .withMessage('Invalid inspection status'),
  body('result')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Result cannot be empty'),
  body('notes')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Notes cannot be empty')
];

export const inspectionIdValidation: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Inspection ID is required')
    .isMongoId()
    .withMessage('Invalid inspection ID')
];
