import { Response } from 'express';
import { Extinguisher, Inspection, Maintenance, logger, AuthRequest } from '@fe-mis/shared';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

export const exportReport = async (req: AuthRequest, res: Response): Promise<void> => {
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

    let data: any[] = [];
    let filename = '';

    switch (report) {
      case 'extinguishers':
        data = await Extinguisher.find().lean();
        filename = `extinguishers-${period || 'all'}`;
        break;
      case 'inspections':
        data = await Inspection.find()
          .populate('extinguisherId', 'serialNumber location')
          .populate('inspectorId', 'firstName lastName')
          .lean();
        filename = `inspections-${period || 'all'}`;
        break;
      case 'maintenance':
        data = await Maintenance.find()
          .populate('extinguisherId', 'serialNumber location')
          .populate('inspectorId', 'firstName lastName')
          .lean();
        filename = `maintenance-${period || 'all'}`;
        break;
      case 'expired':
        const now = new Date();
        data = await Extinguisher.find({ expiryDate: { $lte: now } }).lean();
        filename = `expired-extinguishers`;
        break;
      default:
        res.status(400).json({ error: 'Invalid report type' });
        return;
    }

    if (format === 'csv') {
      const csv = stringify(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      res.send(csv);
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

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

      data.forEach((item: any, index: number) => {
        doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(item)}`);
        doc.moveDown(0.5);
      });

      doc.end();
    }
  } catch (error) {
    logger.error('Export report error', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
};
