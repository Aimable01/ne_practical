"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInspection = exports.updateInspection = exports.getInspectionById = exports.getMyInspections = exports.getAllInspections = exports.createInspection = void 0;
const shared_1 = require("@fe-mis/shared");
const axios_1 = __importDefault(require("axios"));
const createInspection = async (req, res) => {
    try {
        const { extinguisherId, scheduledDate, scheduledTime, inspectorId } = req.body;
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
        const inspection = new shared_1.Inspection({
            extinguisherId,
            scheduledDate,
            scheduledTime,
            inspectorId,
            status: "SCHEDULED",
        });
        await inspection.save();
        // Send email notifications
        try {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const inspectionUrl = `${frontendUrl}/inspections/${inspection._id}`;
            // Notify inspector
            await shared_1.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: inspector.email,
                subject: "New Inspection Scheduled",
                text: `You have been assigned a new inspection.\n\nDate: ${scheduledDate}\nTime: ${scheduledTime}\n\nView details: ${inspectionUrl}`,
            });
            // Notify admins
            const admins = await shared_1.User.find({ role: "ADMIN" });
            for (const admin of admins) {
                await shared_1.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: admin.email,
                    subject: "New Inspection Scheduled",
                    text: `A new inspection has been scheduled.\n\nDate: ${scheduledDate}\nTime: ${scheduledTime}\nInspector: ${inspector.firstName} ${inspector.lastName}\n\nView details: ${inspectionUrl}`,
                });
            }
            inspection.notified = true;
            await inspection.save();
        }
        catch (emailError) {
            shared_1.logger.warn("Failed to send inspection notification email", emailError);
        }
        shared_1.logger.info(`Inspection created: ${inspection._id}`);
        res.status(201).json({
            message: "Inspection scheduled successfully",
            inspection,
        });
    }
    catch (error) {
        shared_1.logger.error("Create inspection error", error);
        res.status(500).json({ error: "Failed to schedule inspection" });
    }
};
exports.createInspection = createInspection;
const getAllInspections = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        const query = {};
        if (status)
            query.status = status;
        const inspections = await shared_1.Inspection.find(query)
            .populate("extinguisherId", "serialNumber location type status")
            .populate("inspectorId", "firstName lastName email")
            .skip(skip)
            .limit(limit)
            .sort({ scheduledDate: 1 });
        const total = await shared_1.Inspection.countDocuments(query);
        res.json({
            inspections,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Get all inspections error", error);
        res.status(500).json({ error: "Failed to fetch inspections" });
    }
};
exports.getAllInspections = getAllInspections;
const getMyInspections = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const inspections = await shared_1.Inspection.find({ inspectorId: req.user?.id })
            .populate("extinguisherId", "serialNumber location type status")
            .skip(skip)
            .limit(limit)
            .sort({ scheduledDate: 1 });
        const total = await shared_1.Inspection.countDocuments({
            inspectorId: req.user?.id,
        });
        res.json({
            inspections,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        shared_1.logger.error("Get my inspections error", error);
        res.status(500).json({ error: "Failed to fetch inspections" });
    }
};
exports.getMyInspections = getMyInspections;
const getInspectionById = async (req, res) => {
    try {
        const inspection = await shared_1.Inspection.findById(req.params.id)
            .populate("extinguisherId", "serialNumber location type status")
            .populate("inspectorId", "firstName lastName email");
        if (!inspection) {
            res.status(404).json({ error: "Inspection not found" });
            return;
        }
        res.json({ inspection });
    }
    catch (error) {
        shared_1.logger.error("Get inspection by ID error", error);
        res.status(500).json({ error: "Failed to fetch inspection" });
    }
};
exports.getInspectionById = getInspectionById;
const updateInspection = async (req, res) => {
    try {
        const inspection = await shared_1.Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!inspection) {
            res.status(404).json({ error: "Inspection not found" });
            return;
        }
        shared_1.logger.info(`Inspection updated: ${inspection._id}`);
        res.json({
            message: "Inspection updated successfully",
            inspection,
        });
    }
    catch (error) {
        shared_1.logger.error("Update inspection error", error);
        res.status(500).json({ error: "Failed to update inspection" });
    }
};
exports.updateInspection = updateInspection;
const deleteInspection = async (req, res) => {
    try {
        const inspection = await shared_1.Inspection.findByIdAndDelete(req.params.id);
        if (!inspection) {
            res.status(404).json({ error: "Inspection not found" });
            return;
        }
        shared_1.logger.info(`Inspection deleted: ${inspection._id}`);
        res.json({
            message: "Inspection deleted successfully",
        });
    }
    catch (error) {
        shared_1.logger.error("Delete inspection error", error);
        res.status(500).json({ error: "Failed to delete inspection" });
    }
};
exports.deleteInspection = deleteInspection;
