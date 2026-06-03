"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaintenanceById = exports.getMaintenanceByExtinguisher = exports.getMyMaintenanceLogs = exports.getAllMaintenance = exports.createMaintenance = void 0;
const shared_1 = require("@fe-mis/shared");
const axios_1 = __importDefault(require("axios"));
const createMaintenance = async (req, res) => {
    try {
        const { extinguisherId, inspectorId, actionsTaken, dateOfAction, conditionsNoted, } = req.body;
        // Verify extinguisher exists
        const extinguisherUrl = process.env.EXTINGUISHER_SERVICE_URL || "http://localhost:3002";
        try {
            await axios_1.default.get(`${extinguisherUrl}/${extinguisherId}`, {
                headers: { Authorization: req.header("Authorization") },
            });
        }
        catch (error) {
            res.status(404).json({ error: "Extinguisher not found" });
            return;
        }
        // Verify inspector exists
        const inspector = await shared_1.User.findById(inspectorId);
        if (!inspector) {
            res.status(404).json({ error: "Inspector not found" });
            return;
        }
        const maintenance = new shared_1.Maintenance({
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
            await shared_1.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: inspector.email,
                subject: "Maintenance Logged",
                text: `A maintenance activity has been logged.\n\nActions: ${actionsTaken}\nDate: ${dateOfAction}\n\nView details: ${maintenanceUrl}`,
            });
            // Notify admins
            const admins = await shared_1.User.find({ role: "ADMIN" });
            for (const admin of admins) {
                await shared_1.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: admin.email,
                    subject: "Maintenance Logged",
                    text: `A maintenance activity has been logged.\n\nActions: ${actionsTaken}\nDate: ${dateOfAction}\nInspector: ${inspector.firstName} ${inspector.lastName}\n\nView details: ${maintenanceUrl}`,
                });
            }
        }
        catch (emailError) {
            shared_1.logger.warn("Failed to send maintenance notification email", emailError);
        }
        shared_1.logger.info(`Maintenance created: ${maintenance._id}`);
        res.status(201).json({
            message: "Maintenance logged successfully",
            maintenance,
        });
    }
    catch (error) {
        shared_1.logger.error("Create maintenance error", error);
        res.status(500).json({ error: "Failed to log maintenance" });
    }
};
exports.createMaintenance = createMaintenance;
const getAllMaintenance = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const extinguisherId = req.query.extinguisherId;
        const skip = (page - 1) * limit;
        const query = {};
        if (extinguisherId)
            query.extinguisherId = extinguisherId;
        const maintenanceRecords = await shared_1.Maintenance.find(query)
            .populate("extinguisherId", "serialNumber location type status")
            .populate("inspectorId", "firstName lastName email")
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
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Get all maintenance error", error);
        res.status(500).json({ error: "Failed to fetch maintenance records" });
    }
};
exports.getAllMaintenance = getAllMaintenance;
const getMyMaintenanceLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const maintenanceRecords = await shared_1.Maintenance.find({
            inspectorId: req.user?.id,
        })
            .populate("extinguisherId", "serialNumber location type status")
            .skip(skip)
            .limit(limit)
            .sort({ dateOfAction: -1 });
        const total = await shared_1.Maintenance.countDocuments({
            inspectorId: req.user?.id,
        });
        res.json({
            maintenanceRecords,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Get my maintenance logs error", error);
        res.status(500).json({ error: "Failed to fetch maintenance logs" });
    }
};
exports.getMyMaintenanceLogs = getMyMaintenanceLogs;
const getMaintenanceByExtinguisher = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const maintenanceRecords = await shared_1.Maintenance.find({
            extinguisherId: req.params.extinguisherId,
        })
            .populate("inspectorId", "firstName lastName email")
            .skip(skip)
            .limit(limit)
            .sort({ dateOfAction: -1 });
        const total = await shared_1.Maintenance.countDocuments({
            extinguisherId: req.params.extinguisherId,
        });
        res.json({
            maintenanceRecords,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Get maintenance by extinguisher error", error);
        res.status(500).json({ error: "Failed to fetch maintenance records" });
    }
};
exports.getMaintenanceByExtinguisher = getMaintenanceByExtinguisher;
const getMaintenanceById = async (req, res) => {
    try {
        const maintenance = await shared_1.Maintenance.findById(req.params.id)
            .populate("extinguisherId", "serialNumber location type status")
            .populate("inspectorId", "firstName lastName email");
        if (!maintenance) {
            res.status(404).json({ error: "Maintenance record not found" });
            return;
        }
        res.json({ maintenance });
    }
    catch (error) {
        shared_1.logger.error("Get maintenance by ID error", error);
        res.status(500).json({ error: "Failed to fetch maintenance record" });
    }
};
exports.getMaintenanceById = getMaintenanceById;
