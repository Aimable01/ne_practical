"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiredExtinguishers = exports.getMaintenanceHistory = exports.getInspectionReports = exports.getExtinguisherReports = exports.getDashboardStats = void 0;
const shared_1 = require("@fe-mis/shared");
const getDashboardStats = async (req, res) => {
    try {
        const extinguishers = await shared_1.Extinguisher.find();
        const inspections = await shared_1.Inspection.find();
        const maintenance = await shared_1.Maintenance.find();
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
    }
    catch (error) {
        shared_1.logger.error('Get dashboard stats error', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getExtinguisherReports = async (req, res) => {
    try {
        const period = req.query.period || 'monthly';
        const extinguishers = await shared_1.Extinguisher.find();
        const now = new Date();
        let startDate;
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
    }
    catch (error) {
        shared_1.logger.error('Get extinguisher reports error', error);
        res.status(500).json({ error: 'Failed to fetch extinguisher reports' });
    }
};
exports.getExtinguisherReports = getExtinguisherReports;
const getInspectionReports = async (req, res) => {
    try {
        const period = req.query.period || 'monthly';
        const inspections = await shared_1.Inspection.find();
        const now = new Date();
        let startDate;
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
    }
    catch (error) {
        shared_1.logger.error('Get inspection reports error', error);
        res.status(500).json({ error: 'Failed to fetch inspection reports' });
    }
};
exports.getInspectionReports = getInspectionReports;
const getMaintenanceHistory = async (req, res) => {
    try {
        const extinguisherId = req.query.extinguisherId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (extinguisherId)
            query.extinguisherId = extinguisherId;
        const maintenanceRecords = await shared_1.Maintenance.find(query)
            .populate('extinguisherId', 'serialNumber location')
            .populate('inspectorId', 'firstName lastName')
            .skip(skip)
            .limit(limit)
            .sort({ dateOfAction: -1 });
        const total = await shared_1.Maintenance.countDocuments(query);
        res.json({
            maintenanceRecords,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        shared_1.logger.error('Get maintenance history error', error);
        res.status(500).json({ error: 'Failed to fetch maintenance history' });
    }
};
exports.getMaintenanceHistory = getMaintenanceHistory;
const getExpiredExtinguishers = async (req, res) => {
    try {
        const now = new Date();
        const expired = await shared_1.Extinguisher.find({
            expiryDate: { $lte: now },
            status: { $ne: 'EXPIRED' }
        });
        res.json({
            expired,
            count: expired.length,
        });
    }
    catch (error) {
        shared_1.logger.error('Get expired extinguishers error', error);
        res.status(500).json({ error: 'Failed to fetch expired extinguishers' });
    }
};
exports.getExpiredExtinguishers = getExpiredExtinguishers;
