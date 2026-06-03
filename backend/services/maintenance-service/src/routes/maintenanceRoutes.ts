import { Router } from 'express';
import {
  createMaintenance,
  getAllMaintenance,
  getMyMaintenanceLogs,
  getMaintenanceByExtinguisher,
  getMaintenanceById
} from '../controllers/maintenanceController';
import { authenticate, authorize, UserRole, handleValidationErrors } from '@fe-mis/shared';
import { createMaintenanceValidation } from '../validators/maintenanceValidator';

const router = Router();

router.get('/', authenticate, getAllMaintenance);
router.get('/my', authenticate, getMyMaintenanceLogs);
router.get('/extinguisher/:extinguisherId', authenticate, getMaintenanceByExtinguisher);
router.get('/:id', authenticate, getMaintenanceById);
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createMaintenanceValidation,
  handleValidationErrors,
  createMaintenance
);

export default router;
