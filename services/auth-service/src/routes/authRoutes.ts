import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  verifyEmail,
  resendVerificationEmail,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { authenticate, UserRole, handleValidationErrors } from "@fe-mis/shared";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validators/authValidator";
import { User } from '@fe-mis/shared';
import { Response } from "express";
import { AuthRequest } from "@fe-mis/shared";

const router = Router();

router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/login", loginValidation, handleValidationErrors, login);
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", authenticate, resendVerificationEmail);
router.put(
  "/profile",
  authenticate,
  updateProfileValidation,
  handleValidationErrors,
  updateProfile,
);
router.post(
  "/change-password",
  authenticate,
  changePasswordValidation,
  handleValidationErrors,
  changePassword,
);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword,
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword,
);

router.get("/inspectors", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const inspectors = await User.find({
      role: { $in: [UserRole.INSPECTOR, UserRole.ADMIN] },
      isEmailVerified: true,
    }).select("_id firstName lastName email role");
    res.json({ inspectors });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inspectors" });
  }
});

export default router;
