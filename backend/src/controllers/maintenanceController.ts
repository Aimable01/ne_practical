import { Response } from 'express';
import Maintenance from '../models/Maintenance';
import Extinguisher from '../models/Extinguisher';
import User from '../models/User';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const createMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { extinguisherId, inspectorId, actionsTaken, dateOfAction, conditionsNoted } = req.body;

    // Verify extinguisher exists
    const extinguisher = await Extinguisher.findById(extinguisherId);
    if (!extinguisher) {
      res.status(404).json({ error: 'Extinguisher not found' });
      return;
    }

    // Verify inspector exists and has INSPECTOR or ADMIN role
    const inspector = await User.findById(inspectorId);
    if (!inspector) {
      res.status(404).json({ error: 'Inspector not found' });
      return;
    }

    if (inspector.role !== 'INSPECTOR' && inspector.role !== 'ADMIN') {
      res.status(400).json({ error: 'User must be an inspector or admin to log maintenance' });
      return;
    }

    const maintenance = new Maintenance({
      extinguisherId,
      inspectorId,
      actionsTaken,
      dateOfAction,
      conditionsNoted
    });

    await maintenance.save();

    logger.info(`Maintenance logged for extinguisher ${extinguisher.serialNumber}`);

    res.status(201).json({
      message: 'Maintenance logged successfully',
      maintenance
    });
  } catch (error) {
    logger.error('Create maintenance error', error);
    res.status(500).json({ error: 'Failed to log maintenance' });
  }
};

export const getAllMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const extinguisherId = req.query.extinguisherId as string;

    const query: any = {};
    if (extinguisherId) {
      query.extinguisherId = extinguisherId;
    }

    const maintenanceRecords = await Maintenance.find(query)
      .populate('extinguisherId', 'serialNumber location type size')
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
    logger.error('Get all maintenance error', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

export const getMaintenanceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('extinguisherId')
      .populate('inspectorId', 'firstName lastName email');

    if (!maintenance) {
      res.status(404).json({ error: 'Maintenance record not found' });
      return;
    }

    res.json({ maintenance });
  } catch (error) {
    logger.error('Get maintenance by ID error', error);
    res.status(500).json({ error: 'Failed to fetch maintenance record' });
  }
};

export const getMaintenanceByExtinguisher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const maintenanceRecords = await Maintenance.find({ extinguisherId: req.params.extinguisherId })
      .populate('inspectorId', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ dateOfAction: -1 });

    const total = await Maintenance.countDocuments({ extinguisherId: req.params.extinguisherId });

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
    logger.error('Get maintenance by extinguisher error', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

export const getMyMaintenanceLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const maintenanceRecords = await Maintenance.find({ inspectorId: req.user?.id })
      .populate('extinguisherId', 'serialNumber location type size')
      .skip(skip)
      .limit(limit)
      .sort({ dateOfAction: -1 });

    const total = await Maintenance.countDocuments({ inspectorId: req.user?.id });

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
    logger.error('Get my maintenance logs error', error);
    res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
};
