import { body, param, ValidationChain } from 'express-validator';
import { ExtinguisherType, ExtinguisherSize, ExtinguisherStatus } from '@fe-mis/shared';

export const createExtinguisherValidation: ValidationChain[] = [
  body('serialNumber')
    .trim()
    .notEmpty()
    .withMessage('Serial number is required')
    .toUpperCase(),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required')
    .isIn(Object.values(ExtinguisherType))
    .withMessage('Invalid extinguisher type'),
  body('size')
    .trim()
    .notEmpty()
    .withMessage('Size is required')
    .isIn(Object.values(ExtinguisherSize))
    .withMessage('Invalid extinguisher size'),
  body('installationDate')
    .trim()
    .notEmpty()
    .withMessage('Installation date is required')
    .isISO8601()
    .withMessage('Invalid installation date format'),
  body('expiryDate')
    .trim()
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Invalid expiry date format')
];

export const updateExtinguisherValidation: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Extinguisher ID is required')
    .isMongoId()
    .withMessage('Invalid extinguisher ID'),
  body('serialNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Serial number cannot be empty')
    .toUpperCase(),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Type cannot be empty')
    .isIn(Object.values(ExtinguisherType))
    .withMessage('Invalid extinguisher type'),
  body('size')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Size cannot be empty')
    .isIn(Object.values(ExtinguisherSize))
    .withMessage('Invalid extinguisher size'),
  body('installationDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Invalid installation date format'),
  body('expiryDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  body('status')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Status cannot be empty')
    .isIn(Object.values(ExtinguisherStatus))
    .withMessage('Invalid extinguisher status')
];

export const extinguisherIdValidation: ValidationChain[] = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Extinguisher ID is required')
    .isMongoId()
    .withMessage('Invalid extinguisher ID')
];
