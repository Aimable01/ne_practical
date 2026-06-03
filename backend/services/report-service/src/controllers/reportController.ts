import { Response } from 'express';
import { Extinguisher, Inspection, Maintenance, logger, AuthRequest } from '@fe-mis/shared';
import axios from 'axios';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const extinguishers = await Extinguisher.find();
    const inspections = await Inspection.find();
    const maintenance = await Maintenance.find();

    const stats = {
      extinguishers: {
        total: extinguishers.length,
        active: extinguishers.filter(e => e.status === 'ACTIVE').length,
        expired: extinguishers.filter(e => e.status === 'EXPIRED').length,
        maintenanceRequired: extinguishers.filter(e => e.status === 'MAINTENANCE_REQUIRED').length,
      },
      inspections: {
        total: inspections.length,
        completed: inspections.filter(i => i.status === 'COMPLETED').length,
        scheduled: inspections.filter(i => i.status === 'SCHEDULED').length,
        failed: inspections.filter(i => i.status === 'FAILED').length,
      },
      maintenance: {
        total: maintenance.length,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error('Get dashboard stats error', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getExtinguisherReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || 'monthly';
    const extinguishers = await Extinguisher.find();

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const newExtinguishers = extinguishers.filter(e => e.createdAt && new Date(e.createdAt) >= startDate);
    const expiredExtinguishers = extinguishers.filter(e => e.expiryDate && new Date(e.expiryDate) <= now);

    res.json({
      period,
      newExtinguishers: newExtinguishers.length,
      expiredExtinguishers: expiredExtinguishers.length,
      totalExtinguishers: extinguishers.length,
    });
  } catch (error) {
    logger.error('Get extinguisher reports error', error);
    res.status(500).json({ error: 'Failed to fetch extinguisher reports' });
  }
};

export const getInspectionReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || 'monthly';
    const inspections = await Inspection.find();

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodInspections = inspections.filter(i => i.scheduledDate && new Date(i.scheduledDate) >= startDate);

    res.json({
      period,
      completed: periodInspections.filter(i => i.status === 'COMPLETED').length,
      failed: periodInspections.filter(i => i.status === 'FAILED').length,
      scheduled: periodInspections.filter(i => i.status === 'SCHEDULED').length,
      total: periodInspections.length,
    });
  } catch (error) {
    logger.error('Get inspection reports error', error);
    res.status(500).json({ error: 'Failed to fetch inspection reports' });
  }
};

export const getMaintenanceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const extinguisherId = req.query.extinguisherId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (extinguisherId) query.extinguisherId = extinguisherId;

    const maintenanceRecords = await Maintenance.find(query)
      .populate('extinguisherId', 'serialNumber location')
      .populate('inspectorId', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ dateOfAction: -1 });

    const total = await Maintenance.countDocuments(query);

    res.json({
      maintenanceRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get maintenance history error', error);
    res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
};

export const getExpiredExtinguishers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const expired = await Extinguisher.find({
      expiryDate: { $lte: now },
      status: { $ne: 'EXPIRED' }
    });

    res.json({
      expired,
      count: expired.length,
    });
  } catch (error) {
    logger.error('Get expired extinguishers error', error);
    res.status(500).json({ error: 'Failed to fetch expired extinguishers' });
  }
};
