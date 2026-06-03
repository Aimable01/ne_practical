import { Router } from 'express';
import {
  createExtinguisher,
  getAllExtinguishers,
  getExtinguisherById,
  updateExtinguisher,
  deleteExtinguisher
} from '../controllers/extinguisherController';
import { authenticate, authorize, UserRole, handleValidationErrors } from '@fe-mis/shared';
import {
  createExtinguisherValidation,
  updateExtinguisherValidation,
  extinguisherIdValidation
} from '../validators/extinguisherValidator';

const router = Router();

router.get('/', authenticate, getAllExtinguishers);
router.get('/:id', authenticate, extinguisherIdValidation, handleValidationErrors, getExtinguisherById);
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createExtinguisherValidation,
  handleValidationErrors,
  createExtinguisher
);
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateExtinguisherValidation,
  handleValidationErrors,
  updateExtinguisher
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  extinguisherIdValidation,
  handleValidationErrors,
  deleteExtinguisher
);

export default router;
