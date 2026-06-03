import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BarChart3, AlertTriangle, Download, ChevronDown, FileText, Table } from "lucide-react";
import { reportService } from "../services/reportService";
import type { Extinguisher, Inspection, Maintenance } from "../types";
import { Card, CardHeader } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { getExtinguisherDisplay, getInspectorName, getRecordId } from "../utils/mongoose";
import api from "../services/api";

type Period = "daily" | "monthly" | "yearly";
type Tab = "extinguishers" | "inspections" | "maintenance" | "expired";

// ── status badge helpers ──────────────────────────────────────────────────────
const statusBadgeExt = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-red-100 text-red-800",
    MAINTENANCE_REQUIRED: "bg-yellow-100 text-yellow-800",
    OUT_OF_SERVICE: "bg-gray-100 text-gray-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
};

const statusBadgeInsp = (status: string) => {
  const map: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    FAILED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
};

// ── ExportDropdown component ──────────────────────────────────────────────────
interface ExportDropdownProps {
  onExport: (format: "pdf" | "csv") => void;
  isExporting: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExport, isExporting }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !isExporting && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { onExport("pdf"); setOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-text-primary hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500" />
            Export as PDF
          </button>
          <button
            onClick={() => { onExport("csv"); setOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-text-primary hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <Table className="w-4 h-4 text-green-600" />
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────
export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [activeTab, setActiveTab] = useState<Tab>("extinguishers");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [extinguisherReports, setExtinguisherReports] = useState<Extinguisher[]>([]);
  const [inspectionReports, setInspectionReports]     = useState<Inspection[]>([]);
  const [maintenanceHistory, setMaintenanceHistory]   = useState<Maintenance[]>([]);
  const [expiredExtinguishers, setExpiredExtinguishers] = useState<Extinguisher[]>([]);

  const [inspSummary, setInspSummary] = useState<{
    total: number; completed: number; failed: number; scheduled: number;
  } | null>(null);
  const [extSummary, setExtSummary] = useState<{
    totalNew: number; totalExpired: number;
  } | null>(null);

  const periodOptions = [
    { value: "daily",   label: "Daily"   },
    { value: "monthly", label: "Monthly" },
    { value: "yearly",  label: "Yearly"  },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "extinguishers", label: "Extinguishers" },
    { id: "inspections",   label: "Inspections"   },
    { id: "maintenance",   label: "Maintenance"   },
    { id: "expired",       label: "Expired"       },
  ];

  useEffect(() => { fetchReports(); }, [period]);

  // ── data fetching ───────────────────────────────────────────────────────────
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [extRes, inspRes, maintRes, expRes] = await Promise.all([
        reportService.getExtinguisherReports(period),
        reportService.getInspectionReports(period),
        reportService.getMaintenanceHistory(),
        reportService.getExpiredExtinguishers(),
      ]);

      const extData = extRes as any;
      setExtinguisherReports(extData.newExtinguishers ?? extData.extinguishers ?? []);
      setExtSummary(extData.summary ?? null);

      const inspData = inspRes as any;
      setInspectionReports(inspData.inspections ?? []);
      setInspSummary(inspData.summary ?? null);

      const maintData = maintRes as any;
      setMaintenanceHistory(
        maintData.maintenanceRecords ?? maintData.maintenance ?? maintData.data ?? [],
      );

      const expData = expRes as any;
      setExpiredExtinguishers(expData.expiredExtinguishers ?? expData.extinguishers ?? []);
    } catch {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  // ── export ──────────────────────────────────────────────────────────────────
  // maintenance and expired don't use period — omit it for cleaner filenames
  const periodDependent = activeTab === "extinguishers" || activeTab === "inspections";

  const handleExport = async (format: "pdf" | "csv") => {
    setIsExporting(true);
    try {
      const params: Record<string, string> = {
        report: activeTab,
        format,
      };
      if (periodDependent) params.period = period;

      // Use axios with responseType blob so binary PDF comes through correctly
      const response = await api.get("/reports/export", {
        params,
        responseType: "blob",
      });

      // Determine filename from Content-Disposition header or build a fallback
      const disposition: string = response.headers["content-disposition"] ?? "";
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
      const filename =
        filenameMatch?.[1] ??
        `${activeTab}${periodDependent ? `_${period}` : ""}_${new Date()
          .toISOString()
          .slice(0, 10)}.${format}`;

      // Trigger browser download
      const blob = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} downloaded successfully`);
    } catch (err: any) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <div className="flex items-center gap-3">
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="w-40"
          />
          <ExportDropdown onExport={handleExport} isExporting={isExporting} />
        </div>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "New Extinguishers", value: extSummary?.totalNew ?? extinguisherReports.length, color: "text-text-primary" },
          { label: "Expired",           value: expiredExtinguishers.length,                         color: "text-red-600"      },
          { label: "Inspections",       value: inspSummary?.total ?? inspectionReports.length,      color: "text-text-primary" },
          { label: "Maintenance",       value: maintenanceHistory.length,                           color: "text-text-primary" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-text-secondary uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
              {tab.id === "expired" && expiredExtinguishers.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                  {expiredExtinguishers.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── EXTINGUISHERS TAB ──────────────────────────────────────────────── */}
      {activeTab === "extinguishers" && (
        <Card>
          <CardHeader
            title="Extinguisher Report"
            subtitle={`New extinguishers added during the ${period} period`}
          />
          {extinguisherReports.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No extinguisher data for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Serial Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Size</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Expiry Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Added On</th>
                  </tr>
                </thead>
                <tbody>
                  {extinguisherReports.map((ext) => {
                    const rowId = getRecordId(ext);
                    return (
                      <tr key={rowId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-text-primary">{ext.serialNumber}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.location}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.type}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.size}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeExt(ext.status)}`}>
                            {ext.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.expiryDate?.slice(0, 10)}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.createdAt?.slice(0, 10)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── INSPECTIONS TAB ────────────────────────────────────────────────── */}
      {activeTab === "inspections" && (
        <Card>
          <CardHeader
            title="Inspection Report"
            subtitle={`Inspections scheduled during the ${period} period`}
          />
          {inspSummary && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Completed", value: inspSummary.completed, color: "text-green-600" },
                { label: "Scheduled", value: inspSummary.scheduled, color: "text-blue-600"  },
                { label: "Failed",    value: inspSummary.failed,    color: "text-red-600"   },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
          {inspectionReports.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No inspection data for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Extinguisher</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Scheduled Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Inspector</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionReports.map((insp) => {
                    const rowId = getRecordId(insp);
                    const { serial, location } = getExtinguisherDisplay(insp);
                    const inspectorName = getInspectorName(insp);
                    return (
                      <tr key={rowId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-text-primary">{serial}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{location ?? "—"}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{insp.scheduledDate?.slice(0, 10)}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{insp.scheduledTime}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeInsp(insp.status)}`}>
                            {insp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{insp.result || "—"}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{inspectorName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── MAINTENANCE TAB ────────────────────────────────────────────────── */}
      {activeTab === "maintenance" && (
        <Card>
          <CardHeader
            title="Maintenance History"
            subtitle="All maintenance records"
          />
          {maintenanceHistory.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No maintenance records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Extinguisher</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Actions Taken</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Conditions Noted</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Inspector</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHistory.map((record) => {
                    const rowId = getRecordId(record);
                    const { serial, location } = getExtinguisherDisplay(record);
                    const inspectorName = getInspectorName(record);
                    return (
                      <tr key={rowId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-text-primary">{serial}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{location ?? "—"}</td>
                        <td className="py-3 px-4 text-sm text-text-primary max-w-xs">
                          <span className="line-clamp-2">{record.actionsTaken}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary whitespace-nowrap">
                          {record.dateOfAction?.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary max-w-xs">
                          <span className="line-clamp-2">{record.conditionsNoted || "—"}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary whitespace-nowrap">
                          {inspectorName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── EXPIRED TAB ────────────────────────────────────────────────────── */}
      {activeTab === "expired" && (
        <Card>
          <CardHeader
            title="Expired Extinguishers"
            subtitle="Extinguishers that have passed their expiry date"
          />
          {expiredExtinguishers.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No expired extinguishers — all good!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Serial Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Expiry Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredExtinguishers.map((ext) => {
                    const rowId = getRecordId(ext);
                    const daysExpired = Math.max(
                      0,
                      Math.floor(
                        (Date.now() - new Date(ext.expiryDate).getTime()) / 86_400_000,
                      ),
                    );
                    return (
                      <tr key={rowId} className="border-b border-gray-100 hover:bg-red-50">
                        <td className="py-3 px-4 text-sm font-mono text-text-primary">{ext.serialNumber}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.location}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{ext.type}</td>
                        <td className="py-3 px-4 text-sm text-red-600 font-medium">{ext.expiryDate?.slice(0, 10)}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-red-600 font-medium text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {daysExpired} day{daysExpired !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
