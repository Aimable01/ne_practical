"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const shared_1 = require("@fe-mis/shared");
const authValidator_1 = require("../validators/authValidator");
const shared_2 = require("@fe-mis/shared");
const router = (0, express_1.Router)();
router.post("/register", authValidator_1.registerValidation, shared_1.handleValidationErrors, authController_1.register);
router.post("/login", authValidator_1.loginValidation, shared_1.handleValidationErrors, authController_1.login);
router.post("/logout", shared_1.authenticate, authController_1.logout);
router.get("/profile", shared_1.authenticate, authController_1.getProfile);
router.get("/verify-email", authController_1.verifyEmail);
router.post("/resend-verification", shared_1.authenticate, authController_1.resendVerificationEmail);
router.put("/profile", shared_1.authenticate, authValidator_1.updateProfileValidation, shared_1.handleValidationErrors, authController_1.updateProfile);
router.post("/change-password", shared_1.authenticate, authValidator_1.changePasswordValidation, shared_1.handleValidationErrors, authController_1.changePassword);
router.post("/forgot-password", authValidator_1.forgotPasswordValidation, shared_1.handleValidationErrors, authController_1.forgotPassword);
router.post("/reset-password", authValidator_1.resetPasswordValidation, shared_1.handleValidationErrors, authController_1.resetPassword);
router.get("/inspectors", shared_1.authenticate, async (req, res) => {
    try {
        const inspectors = await shared_2.User.find({
            role: { $in: [shared_1.UserRole.INSPECTOR, shared_1.UserRole.ADMIN] },
            isEmailVerified: true,
        }).select("_id firstName lastName email role");
        res.json({ inspectors });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch inspectors" });
    }
});
exports.default = router;
