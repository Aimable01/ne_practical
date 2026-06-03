import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify';
import Extinguisher from '../models/Extinguisher';
import Inspection from '../models/Inspection';
import Maintenance from '../models/Maintenance';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { ExtinguisherStatus } from '../models/Extinguisher';
import { InspectionStatus } from '../models/Inspection';

// ── helpers ─────────────────────────────────────────────────────────────────

function fmt(d: any): string {
  if (!d) return '—';
  try { return new Date(d).toISOString().slice(0, 10); } catch { return String(d); }
}

function safe(v: any): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

function extSerial(raw: any): string {
  if (raw && typeof raw === 'object') return raw.serialNumber ?? '—';
  return raw ? String(raw) : '—';
}

function extLocation(raw: any): string {
  if (raw && typeof raw === 'object') return raw.location ?? '—';
  return '—';
}

function inspName(raw: any): string {
  if (raw && typeof raw === 'object')
    return `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() || '—';
  return '—';
}

function periodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'yearly':  return new Date(now.getFullYear(), 0, 1);
    case 'monthly': return new Date(now.getFullYear(), now.getMonth(), 1);
    default:        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}

// ── data fetchers (no pagination — export everything) ────────────────────────

async function fetchExtinguishers(period: string) {
  const start = periodStart(period);
  return Extinguisher.find({ createdAt: { $gte: start } }).sort({ createdAt: -1 });
}

async function fetchInspections(period: string) {
  const start = periodStart(period);
  return Inspection.find({ scheduledDate: { $gte: start } })
    .populate('extinguisherId', 'serialNumber location')
    .populate('inspectorId', 'firstName lastName email')
    .sort({ scheduledDate: -1 });
}

async function fetchMaintenance() {
  return Maintenance.find()
    .populate('extinguisherId', 'serialNumber location type')
    .populate('inspectorId', 'firstName lastName email')
    .sort({ dateOfAction: -1 });
}

async function fetchExpired() {
  const now = new Date();
  return Extinguisher.find({
    $or: [{ expiryDate: { $lte: now } }, { status: ExtinguisherStatus.EXPIRED }],
  }).sort({ expiryDate: 1 });
}

// ── PDF helpers ──────────────────────────────────────────────────────────────

const BRAND = '#DC2626'; // red-600
const COL_GRAY = '#6B7280';
const PAGE_MARGIN = 50;

function pdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  doc
    .rect(0, 0, doc.page.width, 70)
    .fill(BRAND);

  doc
    .fillColor('white')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('FE MIS', PAGE_MARGIN, 20);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Fire Extinguisher Management Information System', PAGE_MARGIN, 44);

  doc.fillColor('black').moveDown(3);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(BRAND)
    .text(title, PAGE_MARGIN);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COL_GRAY)
    .text(`${subtitle}   •   Generated: ${new Date().toLocaleString()}`, PAGE_MARGIN);

  doc.moveDown(1.5);
  doc.fillColor('black');
}

function pdfTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  colWidths: number[],
) {
  const rowH = 22;
  const x0 = PAGE_MARGIN;
  let y = doc.y;

  // header row background
  doc.rect(x0, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill('#F3F4F6');

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827');
  let cx = x0;
  headers.forEach((h, i) => {
    doc.text(h, cx + 4, y + 6, { width: colWidths[i] - 8, lineBreak: false });
    cx += colWidths[i];
  });

  y += rowH;

  doc.font('Helvetica').fontSize(8.5).fillColor('#374151');

  rows.forEach((row, ri) => {
    // check if new page needed
    if (y + rowH > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }

    if (ri % 2 === 1) {
      doc
        .rect(x0, y, colWidths.reduce((a, b) => a + b, 0), rowH)
        .fill('#F9FAFB');
    }

    cx = x0;
    row.forEach((cell, i) => {
      doc
        .fillColor('#374151')
        .text(cell, cx + 4, y + 5, { width: colWidths[i] - 8, lineBreak: false });
      cx += colWidths[i];
    });

    // bottom border
    doc
      .moveTo(x0, y + rowH)
      .lineTo(x0 + colWidths.reduce((a, b) => a + b, 0), y + rowH)
      .strokeColor('#E5E7EB')
      .lineWidth(0.5)
      .stroke();

    y += rowH;
  });

  doc.y = y + 10;
}

function pdfSummaryBox(doc: PDFKit.PDFDocument, items: { label: string; value: string | number }[]) {
  const boxW = (doc.page.width - PAGE_MARGIN * 2) / items.length;
  const y = doc.y;
  items.forEach((item, i) => {
    const bx = PAGE_MARGIN + i * boxW;
    doc.rect(bx + 2, y, boxW - 4, 44).fill('#FEF2F2').stroke('#FECACA');
    doc
      .fillColor(BRAND)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(String(item.value), bx + 2, y + 4, { width: boxW - 4, align: 'center', lineBreak: false });
    doc
      .fillColor(COL_GRAY)
      .font('Helvetica')
      .fontSize(8)
      .text(item.label, bx + 2, y + 26, { width: boxW - 4, align: 'center', lineBreak: false });
  });
  doc.moveDown(4);
}

// ── CSV writer ───────────────────────────────────────────────────────────────

function csvStream(res: Response, filename: string, headers: string[], rows: string[][]): void {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  const stringifier = stringify({ header: true, columns: headers });
  stringifier.pipe(res);
  rows.forEach(r => stringifier.write(r));
  stringifier.end();
}

// ── main export controller ───────────────────────────────────────────────────

export const exportReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = (req.query.report as string) || 'extinguishers';
    const format = (req.query.format as string) || 'pdf';
    const period = (req.query.period as string) || 'monthly';

    const periodLabel = `${period.charAt(0).toUpperCase()}${period.slice(1)}`;
    const now = new Date().toISOString().slice(0, 10);

    // ── EXTINGUISHERS ────────────────────────────────────────────────────────
    if (report === 'extinguishers') {
      const items = await fetchExtinguishers(period);
      const headers = ['Serial Number', 'Location', 'Type', 'Size', 'Status', 'Installation Date', 'Expiry Date', 'Added On'];
      const rows: string[][] = items.map(e => [
        safe(e.serialNumber),
        safe(e.location),
        safe(e.type),
        safe(e.size),
        safe(e.status),
        fmt(e.installationDate),
        fmt(e.expiryDate),
        fmt((e as any).createdAt),
      ]);

      if (format === 'csv') {
        return csvStream(res, `extinguishers_${period}_${now}.csv`, headers, rows);
      }

      const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="extinguishers_${period}_${now}.pdf"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      doc.pipe(res);

      pdfHeader(doc, 'Extinguisher Report', `${periodLabel} period · ${items.length} records`);
      pdfSummaryBox(doc, [
        { label: 'Total', value: items.length },
        { label: 'Active', value: items.filter(e => e.status === ExtinguisherStatus.ACTIVE).length },
        { label: 'Expired', value: items.filter(e => e.status === ExtinguisherStatus.EXPIRED).length },
        { label: 'Maintenance Required', value: items.filter(e => e.status === ExtinguisherStatus.MAINTENANCE_REQUIRED).length },
      ]);

      if (rows.length === 0) {
        doc.fontSize(11).fillColor(COL_GRAY).text('No records for the selected period.', PAGE_MARGIN);
      } else {
        pdfTable(doc, headers, rows, [80, 100, 70, 55, 110, 90, 80, 75]);
      }

      doc.end();
      return;
    }

    // ── INSPECTIONS ──────────────────────────────────────────────────────────
    if (report === 'inspections') {
      const items = await fetchInspections(period);
      const headers = ['Extinguisher', 'Location', 'Scheduled Date', 'Time', 'Inspector', 'Status', 'Result', 'Notes'];
      const rows: string[][] = items.map(i => [
        extSerial((i as any).extinguisherId),
        extLocation((i as any).extinguisherId),
        fmt(i.scheduledDate),
        safe(i.scheduledTime),
        inspName((i as any).inspectorId),
        safe(i.status),
        safe(i.result),
        safe(i.notes),
      ]);

      const completed = items.filter(i => i.status === InspectionStatus.COMPLETED).length;
      const failed = items.filter(i => i.status === InspectionStatus.FAILED).length;
      const scheduled = items.filter(i => i.status === InspectionStatus.SCHEDULED).length;

      if (format === 'csv') {
        return csvStream(res, `inspections_${period}_${now}.csv`, headers, rows);
      }

      const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="inspections_${period}_${now}.pdf"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      doc.pipe(res);

      pdfHeader(doc, 'Inspection Report', `${periodLabel} period · ${items.length} records`);
      pdfSummaryBox(doc, [
        { label: 'Total', value: items.length },
        { label: 'Completed', value: completed },
        { label: 'Scheduled', value: scheduled },
        { label: 'Failed', value: failed },
      ]);

      if (rows.length === 0) {
        doc.fontSize(11).fillColor(COL_GRAY).text('No records for the selected period.', PAGE_MARGIN);
      } else {
        pdfTable(doc, headers, rows, [80, 80, 75, 45, 90, 75, 100, 105]);
      }

      doc.end();
      return;
    }

    // ── MAINTENANCE ──────────────────────────────────────────────────────────
    if (report === 'maintenance') {
      const items = await fetchMaintenance();
      const headers = ['Extinguisher', 'Location', 'Actions Taken', 'Date of Action', 'Conditions Noted', 'Inspector'];
      const rows: string[][] = items.map(m => [
        extSerial((m as any).extinguisherId),
        extLocation((m as any).extinguisherId),
        safe(m.actionsTaken),
        fmt(m.dateOfAction),
        safe(m.conditionsNoted),
        inspName((m as any).inspectorId),
      ]);

      if (format === 'csv') {
        return csvStream(res, `maintenance_${now}.csv`, headers, rows);
      }

      const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="maintenance_${now}.pdf"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      doc.pipe(res);

      pdfHeader(doc, 'Maintenance History', `All records · ${items.length} entries`);
      pdfSummaryBox(doc, [
        { label: 'Total Records', value: items.length },
      ]);

      if (rows.length === 0) {
        doc.fontSize(11).fillColor(COL_GRAY).text('No maintenance records found.', PAGE_MARGIN);
      } else {
        pdfTable(doc, headers, rows, [80, 90, 175, 75, 160, 90]);
      }

      doc.end();
      return;
    }

    // ── EXPIRED ──────────────────────────────────────────────────────────────
    if (report === 'expired') {
      const items = await fetchExpired();
      const today = new Date();
      const headers = ['Serial Number', 'Location', 'Type', 'Size', 'Status', 'Expiry Date', 'Days Overdue'];
      const rows: string[][] = items.map(e => {
        const days = Math.max(0, Math.floor((today.getTime() - new Date(e.expiryDate).getTime()) / 86400000));
        return [
          safe(e.serialNumber),
          safe(e.location),
          safe(e.type),
          safe(e.size),
          safe(e.status),
          fmt(e.expiryDate),
          `${days} day${days !== 1 ? 's' : ''}`,
        ];
      });

      if (format === 'csv') {
        return csvStream(res, `expired_extinguishers_${now}.csv`, headers, rows);
      }

      const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="expired_extinguishers_${now}.pdf"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      doc.pipe(res);

      pdfHeader(doc, 'Expired Extinguishers', `As of ${now} · ${items.length} records`);
      pdfSummaryBox(doc, [
        { label: 'Expired Extinguishers', value: items.length },
      ]);

      if (rows.length === 0) {
        doc.fontSize(11).fillColor(COL_GRAY).text('No expired extinguishers found.', PAGE_MARGIN);
      } else {
        pdfTable(doc, headers, rows, [80, 100, 70, 55, 110, 80, 75]);
      }

      doc.end();
      return;
    }

    res.status(400).json({ error: 'Invalid report type. Use: extinguishers | inspections | maintenance | expired' });
  } catch (error) {
    logger.error('Export report error', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
};
