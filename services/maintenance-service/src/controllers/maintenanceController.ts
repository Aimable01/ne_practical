import { Response } from 'express';
import { Maintenance, User, logger, AuthRequest, transporter } from '@fe-mis/shared';
import axios from 'axios';

export const createMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { extinguisherId, inspectorId, actionsTaken, dateOfAction, conditionsNoted } = req.body;

    // Verify extinguisher exists
    const extinguisherUrl = process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:3002';
    try {
      await axios.get(`${extinguisherUrl}/${extinguisherId}`, {
        headers: { Authorization: req.header('Authorization') }
      });
    } catch (error) {
      res.status(404).json({ error: 'Extinguisher not found' });
      return;
    }

    // Verify inspector exists
    const inspector = await User.findById(inspectorId);
    if (!inspector) {
      res.status(404).json({ error: 'Inspector not found' });
      return;
    }

    const maintenance = new Maintenance({
      extinguisherId,
      inspectorId,
      actionsTaken,
      dateOfAction,
      conditionsNoted,
    });

    await maintenance.save();

    // Send email notifications
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const maintenanceUrl = `${frontendUrl}/maintenance/${maintenance._id}`;

      // Notify inspector
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: inspector.email,
        subject: 'Maintenance Logged',
        text: `A maintenance activity has been logged.\n\nActions: ${actionsTaken}\nDate: ${dateOfAction}\n\nView details: ${maintenanceUrl}`,
      });

      // Notify admins
      const admins = await User.find({ role: 'ADMIN' as any });
      for (const admin of admins) {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: admin.email,
          subject: 'Maintenance Logged',
          text: `A maintenance activity has been logged.\n\nActions: ${actionsTaken}\nDate: ${dateOfAction}\nInspector: ${inspector.firstName} ${inspector.lastName}\n\nView details: ${maintenanceUrl}`,
        });
      }
    } catch (emailError) {
      logger.warn('Failed to send maintenance notification email', emailError);
    }

    logger.info(`Maintenance created: ${maintenance._id}`);

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
    const extinguisherId = req.query.extinguisherId as string;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (extinguisherId) query.extinguisherId = extinguisherId;

    const maintenanceRecords = await Maintenance.find(query)
      .populate('extinguisherId', 'serialNumber location type status')
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

export const getMyMaintenanceLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const maintenanceRecords = await Maintenance.find({ inspectorId: req.user?.id })
      .populate('extinguisherId', 'serialNumber location type status')
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

export const getMaintenanceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('extinguisherId', 'serialNumber location type status')
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
