import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Authentication failed: No token provided');
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: UserRole };
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('Authorization failed: No user in request');
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Authorization failed: User ${req.user.email} with role ${req.user.role} attempted to access restricted resource`);
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
