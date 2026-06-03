import { body, ValidationChain } from 'express-validator';

export const createMaintenanceValidation: ValidationChain[] = [
  body('extinguisherId')
    .trim()
    .notEmpty()
    .withMessage('Extinguisher ID is required')
    .isMongoId()
    .withMessage('Invalid extinguisher ID'),
  body('inspectorId')
    .trim()
    .notEmpty()
    .withMessage('Inspector ID is required')
    .isMongoId()
    .withMessage('Invalid inspector ID'),
  body('actionsTaken')
    .trim()
    .notEmpty()
    .withMessage('Actions taken is required')
    .isLength({ min: 10 })
    .withMessage('Actions taken must be at least 10 characters'),
  body('dateOfAction')
    .trim()
    .notEmpty()
    .withMessage('Date of action is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('conditionsNoted')
    .trim()
    .notEmpty()
    .withMessage('Conditions noted is required')
    .isLength({ min: 10 })
    .withMessage('Conditions noted must be at least 10 characters')
];
