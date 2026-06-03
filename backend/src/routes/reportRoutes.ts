import { Router } from 'express';
import {
  getDashboardStats,
  getExtinguisherReports,
  getInspectionReports,
  getMaintenanceHistory,
  getExpiredExtinguishers
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/dashboard', authenticate, getDashboardStats);

/**
 * @swagger
 * /api/reports/extinguishers:
 *   get:
 *     summary: Get extinguisher reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *         description: Report period
 *     responses:
 *       200:
 *         description: Extinguisher reports retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/extinguishers', authenticate, getExtinguisherReports);

/**
 * @swagger
 * /api/reports/inspections:
 *   get:
 *     summary: Get inspection reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *         description: Report period
 *     responses:
 *       200:
 *         description: Inspection reports retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/inspections', authenticate, getInspectionReports);

/**
 * @swagger
 * /api/reports/maintenance:
 *   get:
 *     summary: Get maintenance history
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: extinguisherId
 *         schema:
 *           type: string
 *         description: Filter by extinguisher ID
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
 *         description: Maintenance history retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/maintenance', authenticate, getMaintenanceHistory);

/**
 * @swagger
 * /api/reports/expired:
 *   get:
 *     summary: Get expired extinguishers
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired extinguishers retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/expired', authenticate, getExpiredExtinguishers);

export default router;
