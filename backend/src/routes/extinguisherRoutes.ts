import { Router } from 'express';
import {
  createExtinguisher,
  getAllExtinguishers,
  getExtinguisherById,
  updateExtinguisher,
  deleteExtinguisher
} from '../controllers/extinguisherController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createExtinguisherValidation,
  updateExtinguisherValidation,
  extinguisherIdValidation
} from '../validators/extinguisherValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @swagger
 * /api/extinguishers:
 *   get:
 *     summary: Get all extinguishers with pagination
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Extinguishers retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticate, getAllExtinguishers);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   get:
 *     summary: Get extinguisher by ID
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Extinguisher retrieved successfully
 *       404:
 *         description: Extinguisher not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id', authenticate, extinguisherIdValidation, handleValidationErrors, getExtinguisherById);

/**
 * @swagger
 * /api/extinguishers:
 *   post:
 *     summary: Create a new extinguisher
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serialNumber
 *               - location
 *               - type
 *               - size
 *               - installationDate
 *               - expiryDate
 *             properties:
 *               serialNumber:
 *                 type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [WATER, CO2, FOAM, DRY_CHEMICAL]
 *               size:
 *                 type: string
 *                 enum: [2.5lbs, 5lbs, 9lbs, 12lbs]
 *               installationDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, MAINTENANCE_REQUIRED, OUT_OF_SERVICE]
 *     responses:
 *       201:
 *         description: Extinguisher created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createExtinguisherValidation,
  handleValidationErrors,
  createExtinguisher
);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   put:
 *     summary: Update extinguisher
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serialNumber:
 *                 type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [WATER, CO2, FOAM, DRY_CHEMICAL]
 *               size:
 *                 type: string
 *                 enum: [2.5lbs, 5lbs, 9lbs, 12lbs]
 *               installationDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, MAINTENANCE_REQUIRED, OUT_OF_SERVICE]
 *     responses:
 *       200:
 *         description: Extinguisher updated successfully
 *       404:
 *         description: Extinguisher not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateExtinguisherValidation,
  handleValidationErrors,
  updateExtinguisher
);

/**
 * @swagger
 * /api/extinguishers/{id}:
 *   delete:
 *     summary: Delete extinguisher
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Extinguisher deleted successfully
 *       404:
 *         description: Extinguisher not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  extinguisherIdValidation,
  handleValidationErrors,
  deleteExtinguisher
);

export default router;
