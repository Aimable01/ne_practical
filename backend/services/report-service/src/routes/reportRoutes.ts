import { Router } from 'express';
import {
  getDashboardStats,
  getExtinguisherReports,
  getInspectionReports,
  getMaintenanceHistory,
  getExpiredExtinguishers
} from '../controllers/reportController';
import { exportReport } from '../controllers/exportController';
import { authenticate, authorize, UserRole } from '@fe-mis/shared';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/extinguishers', authenticate, getExtinguisherReports);
router.get('/inspections', authenticate, getInspectionReports);
router.get('/maintenance', authenticate, getMaintenanceHistory);
router.get('/expired', authenticate, getExpiredExtinguishers);
router.get('/export', authenticate, authorize(UserRole.ADMIN, UserRole.INSPECTOR), exportReport);

export default router;
