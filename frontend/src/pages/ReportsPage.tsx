import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, AlertTriangle } from "lucide-react";
import { reportService } from "../services/reportService";
import type { Extinguisher, Inspection, Maintenance } from "../types";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";

type Period = "daily" | "monthly" | "yearly";
type Tab = "extinguishers" | "inspections" | "maintenance" | "expired";

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

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [activeTab, setActiveTab] = useState<Tab>("extinguishers");
  const [isLoading, setIsLoading] = useState(true);

  // Raw report data
  const [extinguisherReports, setExtinguisherReports] = useState<Extinguisher[]>([]);
  const [inspectionReports, setInspectionReports] = useState<Inspection[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<Maintenance[]>([]);
  const [expiredExtinguishers, setExpiredExtinguishers] = useState<Extinguisher[]>([]);

  // Summary stats
  const [inspSummary, setInspSummary] = useState<{
    total: number;
    completed: number;
    failed: number;
    scheduled: number;
  } | null>(null);
  const [extSummary, setExtSummary] = useState<{
    totalNew: number;
    totalExpired: number;
  } | null>(null);

  const periodOptions = [
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "extinguishers", label: "Extinguishers" },
    { id: "inspections", label: "Inspections" },
    { id: "maintenance", label: "Maintenance" },
    { id: "expired", label: "Expired" },
  ];

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [extRes, inspRes, maintRes, expRes] = await Promise.all([
        reportService.getExtinguisherReports(period),
        reportService.getInspectionReports(period),
        reportService.getMaintenanceHistory(),
        reportService.getExpiredExtinguishers(),
      ]);

      // Extinguisher report — API returns { newExtinguishers, expiredExtinguishers, summary }
      const extData = extRes as any;
      setExtinguisherReports(extData.newExtinguishers ?? extData.extinguishers ?? []);
      setExtSummary(extData.summary ?? null);

      // Inspection report — API returns { inspections, summary }
      const inspData = inspRes as any;
      setInspectionReports(inspData.inspections ?? []);
      setInspSummary(inspData.summary ?? null);

      // Maintenance history — API returns { maintenanceRecords, pagination }
      const maintData = maintRes as any;
      setMaintenanceHistory(
        maintData.maintenanceRecords ?? maintData.maintenance ?? maintData.data ?? [],
      );

      // Expired — API returns { expiredExtinguishers, total }
      const expData = expRes as any;
      setExpiredExtinguishers(
        expData.expiredExtinguishers ?? expData.extinguishers ?? [],
      );
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <div className="flex items-center space-x-4">
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="w-40"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-text-secondary uppercase tracking-wide">New Extinguishers</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{extSummary?.totalNew ?? extinguisherReports.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Expired</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{expiredExtinguishers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Inspections</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{inspSummary?.total ?? inspectionReports.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Maintenance Records</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{maintenanceHistory.length}</p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* ── EXTINGUISHERS TAB ── */}
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
                  {extinguisherReports.map((ext) => (
                    <tr key={ext.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── INSPECTIONS TAB ── */}
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
                { label: "Scheduled", value: inspSummary.scheduled, color: "text-blue-600" },
                { label: "Failed", value: inspSummary.failed, color: "text-red-600" },
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Scheduled Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Inspector</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionReports.map((insp) => {
                    const extObj = insp.extinguisher ?? (insp as any).extinguisherId;
                    const inspObj = insp.inspector ?? (insp as any).inspectorId;
                    return (
                      <tr key={insp.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-text-primary">
                          <span className="font-mono">{typeof extObj === "object" ? extObj?.serialNumber : extObj}</span>
                          {typeof extObj === "object" && extObj?.location && (
                            <span className="text-text-secondary"> – {extObj.location}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{insp.scheduledDate?.slice(0, 10)}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{insp.scheduledTime}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeInsp(insp.status)}`}>
                            {insp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{insp.result || "—"}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {typeof inspObj === "object" && inspObj
                            ? `${inspObj.firstName} ${inspObj.lastName}`
                            : "—"}
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

      {/* ── MAINTENANCE TAB ── */}
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Actions Taken</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Conditions Noted</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Inspector</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHistory.map((record) => {
                    const extObj = record.extinguisher ?? (record as any).extinguisherId;
                    const inspObj = record.inspector ?? (record as any).inspectorId;
                    return (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-text-primary">
                          <span className="font-mono">{typeof extObj === "object" ? extObj?.serialNumber : extObj}</span>
                          {typeof extObj === "object" && extObj?.location && (
                            <span className="text-text-secondary"> – {extObj.location}</span>
                          )}
                        </td>
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
                          {typeof inspObj === "object" && inspObj
                            ? `${inspObj.firstName} ${inspObj.lastName}`
                            : "—"}
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

      {/* ── EXPIRED TAB ── */}
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
                    const daysExpired = Math.max(
                      0,
                      Math.floor(
                        (Date.now() - new Date(ext.expiryDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    );
                    return (
                      <tr key={ext.id} className="border-b border-gray-100 hover:bg-red-50">
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
