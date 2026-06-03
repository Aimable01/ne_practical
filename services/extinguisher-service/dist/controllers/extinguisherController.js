"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExtinguisher = exports.updateExtinguisher = exports.getExtinguisherById = exports.getAllExtinguishers = exports.createExtinguisher = void 0;
const shared_1 = require("@fe-mis/shared");
const axios_1 = __importDefault(require("axios"));
const createExtinguisher = async (req, res) => {
    try {
        const extinguisher = new shared_1.Extinguisher(req.body);
        await extinguisher.save();
        shared_1.logger.info(`Extinguisher created: ${extinguisher.serialNumber}`);
        res.status(201).json({
            message: 'Extinguisher created successfully',
            extinguisher
        });
    }
    catch (error) {
        shared_1.logger.error('Create extinguisher error', error);
        res.status(500).json({ error: 'Failed to create extinguisher' });
    }
};
exports.createExtinguisher = createExtinguisher;
const getAllExtinguishers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const extinguishers = await shared_1.Extinguisher.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await shared_1.Extinguisher.countDocuments();
        res.json({
            extinguishers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        shared_1.logger.error('Get all extinguishers error', error);
        res.status(500).json({ error: 'Failed to fetch extinguishers' });
    }
};
exports.getAllExtinguishers = getAllExtinguishers;
const getExtinguisherById = async (req, res) => {
    try {
        const extinguisher = await shared_1.Extinguisher.findById(req.params.id);
        if (!extinguisher) {
            res.status(404).json({ error: 'Extinguisher not found' });
            return;
        }
        res.json({ extinguisher });
    }
    catch (error) {
        shared_1.logger.error('Get extinguisher by ID error', error);
        res.status(500).json({ error: 'Failed to fetch extinguisher' });
    }
};
exports.getExtinguisherById = getExtinguisherById;
const updateExtinguisher = async (req, res) => {
    try {
        const extinguisher = await shared_1.Extinguisher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!extinguisher) {
            res.status(404).json({ error: 'Extinguisher not found' });
            return;
        }
        shared_1.logger.info(`Extinguisher updated: ${extinguisher.serialNumber}`);
        res.json({
            message: 'Extinguisher updated successfully',
            extinguisher
        });
    }
    catch (error) {
        shared_1.logger.error('Update extinguisher error', error);
        res.status(500).json({ error: 'Failed to update extinguisher' });
    }
};
exports.updateExtinguisher = updateExtinguisher;
const deleteExtinguisher = async (req, res) => {
    try {
        const extinguisher = await shared_1.Extinguisher.findByIdAndDelete(req.params.id);
        if (!extinguisher) {
            res.status(404).json({ error: 'Extinguisher not found' });
            return;
        }
        // Cascade delete — remove all inspections and maintenance records for this extinguisher
        const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
        // Delete inspections via Inspection Service
        try {
            await axios_1.default.delete(`${authUrl}/inspections/extinguisher/${req.params.id}`, {
                headers: { Authorization: req.header('Authorization') }
            });
        }
        catch (error) {
            shared_1.logger.warn('Failed to delete related inspections', error);
        }
        // Delete maintenance via Maintenance Service
        try {
            await axios_1.default.delete(`${authUrl}/maintenance/extinguisher/${req.params.id}`, {
                headers: { Authorization: req.header('Authorization') }
            });
        }
        catch (error) {
            shared_1.logger.warn('Failed to delete related maintenance records', error);
        }
        shared_1.logger.info(`Extinguisher deleted: ${extinguisher.serialNumber}`);
        res.json({
            message: 'Extinguisher deleted successfully'
        });
    }
    catch (error) {
        shared_1.logger.error('Delete extinguisher error', error);
        res.status(500).json({ error: 'Failed to delete extinguisher' });
    }
};
exports.deleteExtinguisher = deleteExtinguisher;
