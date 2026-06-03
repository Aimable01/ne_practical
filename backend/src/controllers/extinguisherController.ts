import { Response } from 'express';
import Extinguisher from '../models/Extinguisher';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const createExtinguisher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const extinguisher = new Extinguisher(req.body);
    await extinguisher.save();

    logger.info(`Extinguisher created: ${extinguisher.serialNumber}`);

    res.status(201).json({
      message: 'Extinguisher created successfully',
      extinguisher
    });
  } catch (error) {
    logger.error('Create extinguisher error', error);
    res.status(500).json({ error: 'Failed to create extinguisher' });
  }
};

export const getAllExtinguishers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const extinguishers = await Extinguisher.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Extinguisher.countDocuments();

    res.json({
      extinguishers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get all extinguishers error', error);
    res.status(500).json({ error: 'Failed to fetch extinguishers' });
  }
};

export const getExtinguisherById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const extinguisher = await Extinguisher.findById(req.params.id);

    if (!extinguisher) {
      res.status(404).json({ error: 'Extinguisher not found' });
      return;
    }

    res.json({ extinguisher });
  } catch (error) {
    logger.error('Get extinguisher by ID error', error);
    res.status(500).json({ error: 'Failed to fetch extinguisher' });
  }
};

export const updateExtinguisher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const extinguisher = await Extinguisher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!extinguisher) {
      res.status(404).json({ error: 'Extinguisher not found' });
      return;
    }

    logger.info(`Extinguisher updated: ${extinguisher.serialNumber}`);

    res.json({
      message: 'Extinguisher updated successfully',
      extinguisher
    });
  } catch (error) {
    logger.error('Update extinguisher error', error);
    res.status(500).json({ error: 'Failed to update extinguisher' });
  }
};

export const deleteExtinguisher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const extinguisher = await Extinguisher.findByIdAndDelete(req.params.id);

    if (!extinguisher) {
      res.status(404).json({ error: 'Extinguisher not found' });
      return;
    }

    logger.info(`Extinguisher deleted: ${extinguisher.serialNumber}`);

    res.json({
      message: 'Extinguisher deleted successfully'
    });
  } catch (error) {
    logger.error('Delete extinguisher error', error);
    res.status(500).json({ error: 'Failed to delete extinguisher' });
  }
};
