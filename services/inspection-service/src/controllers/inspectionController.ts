import { Response } from 'express';
import { Inspection, User, logger, AuthRequest, transporter } from '@fe-mis/shared';
import axios from 'axios';

export const createInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { extinguisherId, scheduledDate, scheduledTime, inspectorId } = req.body;

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

    const inspection = new Inspection({
      extinguisherId,
      scheduledDate,
      scheduledTime,
      inspectorId,
      status: 'SCHEDULED',
    });

    await inspection.save();

    // Send email notifications
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const inspectionUrl = `${frontendUrl}/inspections/${inspection._id}`;

      // Notify inspector
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: inspector.email,
        subject: 'New Inspection Scheduled',
        text: `You have been assigned a new inspection.\n\nDate: ${scheduledDate}\nTime: ${scheduledTime}\n\nView details: ${inspectionUrl}`,
      });

      // Notify admins
      const admins = await User.find({ role: 'ADMIN' as any });
      for (const admin of admins) {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: admin.email,
          subject: 'New Inspection Scheduled',
          text: `A new inspection has been scheduled.\n\nDate: ${scheduledDate}\nTime: ${scheduledTime}\nInspector: ${inspector.firstName} ${inspector.lastName}\n\nView details: ${inspectionUrl}`,
        });
      }

      inspection.notified = true;
      await inspection.save();
    } catch (emailError) {
      logger.warn('Failed to send inspection notification email', emailError);
    }

    logger.info(`Inspection created: ${inspection._id}`);

    res.status(201).json({
      message: 'Inspection scheduled successfully',
      inspection
    });
  } catch (error) {
    logger.error('Create inspection error', error);
    res.status(500).json({ error: 'Failed to schedule inspection' });
  }
};

export const getAllInspections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const inspections = await Inspection.find(query)
      .populate('extinguisherId', 'serialNumber location type status')
      .populate('inspectorId', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledDate: 1 });

    const total = await Inspection.countDocuments(query);

    res.json({
      inspections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get all inspections error', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
};

export const getMyInspections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const inspections = await Inspection.find({ inspectorId: req.user?.id })
      .populate('extinguisherId', 'serialNumber location type status')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledDate: 1 });

    const total = await Inspection.countDocuments({ inspectorId: req.user?.id });

    res.json({
      inspections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get my inspections error', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
};

export const getInspectionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('extinguisherId', 'serialNumber location type status')
      .populate('inspectorId', 'firstName lastName email');

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    res.json({ inspection });
  } catch (error) {
    logger.error('Get inspection by ID error', error);
    res.status(500).json({ error: 'Failed to fetch inspection' });
  }
};

export const updateInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    logger.info(`Inspection updated: ${inspection._id}`);

    res.json({
      message: 'Inspection updated successfully',
      inspection
    });
  } catch (error) {
    logger.error('Update inspection error', error);
    res.status(500).json({ error: 'Failed to update inspection' });
  }
};

export const deleteInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id);

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    logger.info(`Inspection deleted: ${inspection._id}`);

    res.json({
      message: 'Inspection deleted successfully'
    });
  } catch (error) {
    logger.error('Delete inspection error', error);
    res.status(500).json({ error: 'Failed to delete inspection' });
  }
};
