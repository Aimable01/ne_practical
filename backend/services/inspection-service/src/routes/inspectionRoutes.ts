import { Router } from 'express';
import {
  createInspection,
  getAllInspections,
  getMyInspections,
  getInspectionById,
  updateInspection,
  deleteInspection
} from '../controllers/inspectionController';
import { authenticate, authorize, UserRole, handleValidationErrors } from '@fe-mis/shared';
import {
  createInspectionValidation,
  updateInspectionValidation,
  inspectionIdValidation
} from '../validators/inspectionValidator';

const router = Router();

router.get('/', authenticate, getAllInspections);
router.get('/my', authenticate, getMyInspections);
router.get('/:id', authenticate, inspectionIdValidation, handleValidationErrors, getInspectionById);
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.USER, UserRole.INSPECTOR),
  createInspectionValidation,
  handleValidationErrors,
  createInspection
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateInspectionValidation,
  handleValidationErrors,
  updateInspection
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  inspectionIdValidation,
  handleValidationErrors,
  deleteInspection
);

export default router;
