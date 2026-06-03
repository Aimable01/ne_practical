"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = void 0;
const shared_1 = require("@fe-mis/shared");
const pdfkit_1 = __importDefault(require("pdfkit"));
const sync_1 = require("csv-stringify/sync");
const exportReport = async (req, res) => {
    try {
        const { report, format, period } = req.query;
        if (!report || !format) {
            res.status(400).json({ error: 'Report and format parameters are required' });
            return;
        }
        if (format !== 'pdf' && format !== 'csv') {
            res.status(400).json({ error: 'Format must be pdf or csv' });
            return;
        }
        let data = [];
        let filename = '';
        switch (report) {
            case 'extinguishers':
                data = await shared_1.Extinguisher.find().lean();
                filename = `extinguishers-${period || 'all'}`;
                break;
            case 'inspections':
                data = await shared_1.Inspection.find()
                    .populate('extinguisherId', 'serialNumber location')
                    .populate('inspectorId', 'firstName lastName')
                    .lean();
                filename = `inspections-${period || 'all'}`;
                break;
            case 'maintenance':
                data = await shared_1.Maintenance.find()
                    .populate('extinguisherId', 'serialNumber location')
                    .populate('inspectorId', 'firstName lastName')
                    .lean();
                filename = `maintenance-${period || 'all'}`;
                break;
            case 'expired':
                const now = new Date();
                data = await shared_1.Extinguisher.find({ expiryDate: { $lte: now } }).lean();
                filename = `expired-extinguishers`;
                break;
            default:
                res.status(400).json({ error: 'Invalid report type' });
                return;
        }
        if (format === 'csv') {
            const csv = (0, sync_1.stringify)(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            res.send(csv);
        }
        else if (format === 'pdf') {
            const doc = new pdfkit_1.default();
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
                res.send(pdfBuffer);
            });
            doc.fontSize(20).text(`${report.charAt(0).toUpperCase() + report.slice(1)} Report`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
            doc.moveDown();
            data.forEach((item, index) => {
                doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(item)}`);
                doc.moveDown(0.5);
            });
            doc.end();
        }
    }
    catch (error) {
        shared_1.logger.error('Export report error', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
};
exports.exportReport = exportReport;
