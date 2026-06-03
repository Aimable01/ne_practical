import { Response } from 'express';
import Extinguisher from '../models/Extinguisher';
import Inspection from '../models/Inspection';
import Maintenance from '../models/Maintenance';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { ExtinguisherStatus } from '../models/Extinguisher';
import { InspectionStatus } from '../models/Inspection';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalExtinguishers = await Extinguisher.countDocuments();
    const activeExtinguishers = await Extinguisher.countDocuments({ status: ExtinguisherStatus.ACTIVE });
    const expiredExtinguishers = await Extinguisher.countDocuments({ status: ExtinguisherStatus.EXPIRED });
    const maintenanceRequired = await Extinguisher.countDocuments({ status: ExtinguisherStatus.MAINTENANCE_REQUIRED });
    const outOfService = await Extinguisher.countDocuments({ status: ExtinguisherStatus.OUT_OF_SERVICE });

    const scheduledInspections = await Inspection.countDocuments({ status: InspectionStatus.SCHEDULED });
    const completedInspections = await Inspection.countDocuments({ status: InspectionStatus.COMPLETED });
    const failedInspections = await Inspection.countDocuments({ status: InspectionStatus.FAILED });

    const totalMaintenance = await Maintenance.countDocuments();

    res.json({
      extinguishers: {
        total: totalExtinguishers,
        active: activeExtinguishers,
        expired: expiredExtinguishers,
        maintenanceRequired,
        outOfService
      },
      inspections: {
        scheduled: scheduledInspections,
        completed: completedInspections,
        failed: failedInspections
      },
      maintenance: {
        total: totalMaintenance
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getExtinguisherReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period } = req.query;
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
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const extinguishers = await Extinguisher.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const expiredExtinguishers = await Extinguisher.find({
      expiryDate: { $lte: now },
      status: { $ne: ExtinguisherStatus.EXPIRED }
    });

    res.json({
      period: period || 'daily',
      newExtinguishers: extinguishers,
      expiredExtinguishers,
      summary: {
        totalNew: extinguishers.length,
        totalExpired: expiredExtinguishers.length
      }
    });
  } catch (error) {
    logger.error('Get extinguisher reports error', error);
    res.status(500).json({ error: 'Failed to fetch extinguisher reports' });
  }
};

export const getInspectionReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period } = req.query;
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
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const inspections = await Inspection.find({
      scheduledDate: { $gte: startDate }
    })
      .populate('extinguisherId', 'serialNumber location')
      .populate('inspectorId', 'firstName lastName')
      .sort({ scheduledDate: -1 });

    const completedCount = inspections.filter(i => i.status === InspectionStatus.COMPLETED).length;
    const failedCount = inspections.filter(i => i.status === InspectionStatus.FAILED).length;
    const scheduledCount = inspections.filter(i => i.status === InspectionStatus.SCHEDULED).length;

    res.json({
      period: period || 'daily',
      inspections,
      summary: {
        total: inspections.length,
        completed: completedCount,
        failed: failedCount,
        scheduled: scheduledCount
      }
    });
  } catch (error) {
    logger.error('Get inspection reports error', error);
    res.status(500).json({ error: 'Failed to fetch inspection reports' });
  }
};

export const getMaintenanceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { extinguisherId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (extinguisherId) {
      query.extinguisherId = extinguisherId;
    }

    const maintenanceRecords = await Maintenance.find(query)
      .populate('extinguisherId', 'serialNumber location type')
      .populate('inspectorId', 'firstName lastName email')
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
    const expiredExtinguishers = await Extinguisher.find({
      $or: [
        { expiryDate: { $lte: now } },
        { status: ExtinguisherStatus.EXPIRED }
      ]
    }).sort({ expiryDate: 1 });

    res.json({
      expiredExtinguishers,
      total: expiredExtinguishers.length
    });
  } catch (error) {
    logger.error('Get expired extinguishers error', error);
    res.status(500).json({ error: 'Failed to fetch expired extinguishers' });
  }
};
