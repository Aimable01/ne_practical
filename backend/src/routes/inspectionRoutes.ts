import { Router } from 'express';
import {
  createInspection,
  getAllInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
  getMyInspections
} from '../controllers/inspectionController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createInspectionValidation,
  updateInspectionValidation,
  inspectionIdValidation
} from '../validators/inspectionValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @swagger
 * /api/inspections:
 *   get:
 *     summary: Get all inspections with pagination
 *     tags: [Inspections]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Inspections retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticate, getAllInspections);

/**
 * @swagger
 * /api/inspections/my:
 *   get:
 *     summary: Get my assigned inspections
 *     tags: [Inspections]
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
 *         description: Inspections retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/my', authenticate, getMyInspections);

/**
 * @swagger
 * /api/inspections/{id}:
 *   get:
 *     summary: Get inspection by ID
 *     tags: [Inspections]
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
 *         description: Inspection retrieved successfully
 *       404:
 *         description: Inspection not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id', authenticate, inspectionIdValidation, handleValidationErrors, getInspectionById);

/**
 * @swagger
 * /api/inspections:
 *   post:
 *     summary: Schedule a new inspection
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - extinguisherId
 *               - scheduledDate
 *               - scheduledTime
 *               - inspectorId
 *             properties:
 *               extinguisherId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 *                 pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *               inspectorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inspection scheduled successfully
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
  authorize(UserRole.ADMIN, UserRole.USER, UserRole.INSPECTOR),
  createInspectionValidation,
  handleValidationErrors,
  createInspection
);

/**
 * @swagger
 * /api/inspections/{id}:
 *   put:
 *     summary: Update inspection
 *     tags: [Inspections]
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
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, COMPLETED, CANCELLED, FAILED]
 *               result:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inspection updated successfully
 *       404:
 *         description: Inspection not found
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
  updateInspectionValidation,
  handleValidationErrors,
  updateInspection
);

/**
 * @swagger
 * /api/inspections/{id}:
 *   delete:
 *     summary: Delete inspection
 *     tags: [Inspections]
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
 *         description: Inspection deleted successfully
 *       404:
 *         description: Inspection not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  inspectionIdValidation,
  handleValidationErrors,
  deleteInspection
);

export default router;
