import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { UserRole } from "../models/User";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middleware/auth";
import { transporter } from "../config/mailer";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed: Email ${email} already exists`);
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || UserRole.USER,
      emailVerificationToken,
      emailVerificationExpires,
    });

    await user.save();

    // Send verification email
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;
      logger.info(`Verification URL: ${verificationUrl}`);
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Email Verification",
        text: `Please verify your email by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
      });
      logger.info(`Verification email sent to ${email}`);
    } catch (emailError) {
      logger.warn("Failed to send verification email", emailError);
    }

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    logger.error("Registration error", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User ${email} not found`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for ${email}`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      logger.warn(`Login failed: Email not verified for ${email}`);
      res
        .status(403)
        .json({ error: "Please verify your email before logging in" });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT_SECRET is not defined");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "24h" },
    );

    logger.info(`User logged in successfully: ${email}`);

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
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    logger.info(`User logged out: ${req.user?.email}`);
    res.json({ message: "Logout successful" });
  } catch (error) {
    logger.error("Logout error", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error("Get profile error", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    const user = await User.findOne({
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

    logger.info(`Email verified successfully: ${user.email}`);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    logger.error("Email verification error", error);
    res.status(500).json({ error: "Email verification failed" });
  }
};

export const resendVerificationEmail = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;
      logger.info(`Verification URL: ${verificationUrl}`);
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Email Verification",
        text: `Please verify your email by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
      });
      logger.info(`Verification email resent to ${user.email}`);
    } catch (emailError) {
      logger.warn("Failed to send verification email", emailError);
    }

    res.json({ message: "Verification email sent successfully" });
  } catch (error) {
    logger.error("Resend verification email error", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

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
  } catch (error) {
    logger.error("Update profile error", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    logger.error("Change password error", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send reset email
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;
      logger.info(`Password reset URL: ${resetUrl}`);
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Password Reset",
        text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`,
      });
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      logger.warn("Failed to send password reset email", emailError);
    }

    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    logger.error("Forgot password error", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      res.status(400).json({ error: "Reset token is required" });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password reset successfully for user: ${user.email}`);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    logger.error("Reset password error", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
