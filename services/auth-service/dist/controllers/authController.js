"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.resendVerificationEmail = exports.verifyEmail = exports.getProfile = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const shared_1 = require("@fe-mis/shared");
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        // Check if user already exists
        const existingUser = await shared_1.User.findOne({ email });
        if (existingUser) {
            shared_1.logger.warn(`Registration failed: Email ${email} already exists`);
            res.status(409).json({ error: "Email already registered" });
            return;
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Generate email verification token
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Create user
        const user = new shared_1.User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || shared_1.UserRole.USER,
            emailVerificationToken,
            emailVerificationExpires,
        });
        await user.save();
        // Send verification email
        try {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;
            shared_1.logger.info(`Verification URL: ${verificationUrl}`);
            await shared_1.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: email,
                subject: "Email Verification",
                text: `Please verify your email by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
            });
            shared_1.logger.info(`Verification email sent to ${email}`);
        }
        catch (emailError) {
            shared_1.logger.warn("Failed to send verification email", emailError);
        }
        shared_1.logger.info(`User registered successfully: ${email}`);
        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Registration error", error);
        res.status(500).json({ error: "Registration failed" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await shared_1.User.findOne({ email });
        if (!user) {
            shared_1.logger.warn(`Login failed: User ${email} not found`);
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            shared_1.logger.warn(`Login failed: Invalid password for ${email}`);
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            shared_1.logger.warn(`Login failed: Email not verified for ${email}`);
            res
                .status(403)
                .json({ error: "Please verify your email before logging in" });
            return;
        }
        // Generate JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            shared_1.logger.error("JWT_SECRET is not defined");
            res.status(500).json({ error: "Server configuration error" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
        }, secret, { expiresIn: "24h" });
        shared_1.logger.info(`User logged in successfully: ${email}`);
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Login error", error);
        res.status(500).json({ error: "Login failed" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        shared_1.logger.info(`User logged out: ${req.user?.email}`);
        res.json({ message: "Logout successful" });
    }
    catch (error) {
        shared_1.logger.error("Logout error", error);
        res.status(500).json({ error: "Logout failed" });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        const user = await shared_1.User.findById(req.user?.id).select("-password");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        shared_1.logger.error("Get profile error", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};
exports.getProfile = getProfile;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            res.status(400).json({ error: "Verification token is required" });
            return;
        }
        const user = await shared_1.User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({ error: "Invalid or expired verification token" });
            return;
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        shared_1.logger.info(`Email verified successfully: ${user.email}`);
        res.json({ message: "Email verified successfully" });
    }
    catch (error) {
        shared_1.logger.error("Email verification error", error);
        res.status(500).json({ error: "Email verification failed" });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = async (req, res) => {
    try {
        const user = await shared_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.isEmailVerified) {
            res.status(400).json({ error: "Email is already verified" });
            return;
        }
        // Generate new verification token
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;
        await user.save();
        // Send verification email
        try {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;
            shared_1.logger.info(`Verification URL: ${verificationUrl}`);
            await shared_1.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: user.email,
                subject: "Email Verification",
                text: `Please verify your email by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
            });
            shared_1.logger.info(`Verification email resent to ${user.email}`);
        }
        catch (emailError) {
            shared_1.logger.warn("Failed to send verification email", emailError);
        }
        res.json({ message: "Verification email sent successfully" });
    }
    catch (error) {
        shared_1.logger.error("Resend verification email error", error);
        res.status(500).json({ error: "Failed to resend verification email" });
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await shared_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        await user.save();
        shared_1.logger.info(`Profile updated for user: ${user.email}`);
        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Update profile error", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await shared_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Verify current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Current password is incorrect" });
            return;
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        shared_1.logger.info(`Password changed for user: ${user.email}`);
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        shared_1.logger.error("Change password error", error);
        res.status(500).json({ error: "Failed to change password" });
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await shared_1.User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not
            res.json({
                message: "If an account with that email exists, a password reset link has been sent.",
            });
            return;
        }
        // Generate reset token
        const resetPasswordToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();
        // Send reset email
        try {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const resetUrl = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;
            shared_1.logger.info(`Password reset URL: ${resetUrl}`);
            await shared_1.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: user.email,
                subject: "Password Reset",
                text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`,
            });
            shared_1.logger.info(`Password reset email sent to ${user.email}`);
        }
        catch (emailError) {
            shared_1.logger.warn("Failed to send password reset email", emailError);
        }
        res.json({
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    }
    catch (error) {
        shared_1.logger.error("Forgot password error", error);
        res.status(500).json({ error: "Failed to process password reset request" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token) {
            res.status(400).json({ error: "Reset token is required" });
            return;
        }
        const user = await shared_1.User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({ error: "Invalid or expired reset token" });
            return;
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        shared_1.logger.info(`Password reset successfully for user: ${user.email}`);
        res.json({ message: "Password reset successfully" });
    }
    catch (error) {
        shared_1.logger.error("Reset password error", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};
exports.resetPassword = resetPassword;
