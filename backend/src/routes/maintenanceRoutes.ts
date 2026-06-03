import { Router } from 'express';
import {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  getMaintenanceByExtinguisher,
  getMyMaintenanceLogs
} from '../controllers/maintenanceController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { createMaintenanceValidation } from '../validators/maintenanceValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get all maintenance records with pagination
 *     tags: [Maintenance]
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
 *         name: extinguisherId
 *         schema:
 *           type: string
 *         description: Filter by extinguisher ID
 *     responses:
 *       200:
 *         description: Maintenance records retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticate, getAllMaintenance);

/**
 * @swagger
 * /api/maintenance/my:
 *   get:
 *     summary: Get my maintenance logs
 *     tags: [Maintenance]
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
 *         description: Maintenance logs retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/my', authenticate, getMyMaintenanceLogs);

/**
 * @swagger
 * /api/maintenance/extinguisher/{extinguisherId}:
 *   get:
 *     summary: Get maintenance records for a specific extinguisher
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: extinguisherId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Maintenance records retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/extinguisher/:extinguisherId', authenticate, getMaintenanceByExtinguisher);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   get:
 *     summary: Get maintenance record by ID
 *     tags: [Maintenance]
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
 *         description: Maintenance record retrieved successfully
 *       404:
 *         description: Maintenance record not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id', authenticate, getMaintenanceById);

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Log a maintenance activity
 *     tags: [Maintenance]
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
 *               - inspectorId
 *               - actionsTaken
 *               - dateOfAction
 *               - conditionsNoted
 *             properties:
 *               extinguisherId:
 *                 type: string
 *               inspectorId:
 *                 type: string
 *               actionsTaken:
 *                 type: string
 *               dateOfAction:
 *                 type: string
 *                 format: date
 *               conditionsNoted:
 *                 type: string
 *     responses:
 *       201:
 *         description: Maintenance logged successfully
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
  createMaintenanceValidation,
  handleValidationErrors,
  createMaintenance
);

export default router;
