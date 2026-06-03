import { Response } from 'express';
import Inspection from '../models/Inspection';
import Extinguisher from '../models/Extinguisher';
import User, { UserRole } from '../models/User';
import { transporter } from '../config/mailer';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const createInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { extinguisherId, scheduledDate, scheduledTime, inspectorId } = req.body;

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
      res.status(400).json({ error: 'Assigned user must be an inspector or admin' });
      return;
    }

    const inspection = new Inspection({
      extinguisherId,
      scheduledDate,
      scheduledTime,
      inspectorId,
      notified: false
    });

    await inspection.save();

    // Fetch all admins to notify them as well
    const admins = await User.find({ role: UserRole.ADMIN }).select('email firstName lastName');

    // Build recipient list: inspector + all admins (deduplicated)
    const recipientEmails = new Set<string>([inspector.email]);
    admins.forEach(a => recipientEmails.add(a.email));

    const emailBody = `A new inspection has been scheduled.\n\nExtinguisher: ${extinguisher.serialNumber}\nLocation: ${extinguisher.location}\nType: ${extinguisher.type}\n\nAssigned Inspector: ${inspector.firstName} ${inspector.lastName} (${inspector.email})\nScheduled Date: ${new Date(scheduledDate).toDateString()}\nScheduled Time: ${scheduledTime}\n\nPlease ensure the inspection is completed on time.`;

    // Send notification emails
    try {
      for (const email of recipientEmails) {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: `Inspection Scheduled – ${extinguisher.serialNumber}`,
          text: emailBody
        });
        logger.info(`Inspection notification sent to ${email}`);
      }

      inspection.notified = true;
      await inspection.save();
    } catch (emailError) {
      logger.warn('Failed to send inspection notification email', emailError);
    }

    logger.info(`Inspection created for extinguisher ${extinguisher.serialNumber}`);

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
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const inspections = await Inspection.find(query)
      .populate('extinguisherId', 'serialNumber location type size status')
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

export const getInspectionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('extinguisherId')
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
    const { status, result, notes } = req.body;

    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      { status, result, notes },
      { new: true, runValidators: true }
    ).populate('extinguisherId', 'serialNumber');

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

export const getMyInspections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const inspections = await Inspection.find({ inspectorId: req.user?.id })
      .populate('extinguisherId', 'serialNumber location type size status')
      .populate('inspectorId', 'firstName lastName email')
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
