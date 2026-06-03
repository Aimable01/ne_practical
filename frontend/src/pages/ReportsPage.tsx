import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Download, AlertTriangle } from "lucide-react";
import { reportService } from "../services/reportService";
import type { Extinguisher, Inspection, Maintenance } from "../types";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">(
    "monthly",
  );
  const [extinguisherReports, setExtinguisherReports] = useState<
    Extinguisher[]
  >([]);
  const [inspectionReports, setInspectionReports] = useState<Inspection[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<Maintenance[]>(
    [],
  );
  const [expiredExtinguishers, setExpiredExtinguishers] = useState<
    Extinguisher[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "extinguishers" | "inspections" | "maintenance" | "expired"
  >("extinguishers");

  const periodOptions = [
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const [extinguishers, inspections, maintenance, expired] =
        await Promise.all([
          reportService.getExtinguisherReports(period),
          reportService.getInspectionReports(period),
          reportService.getMaintenanceHistory(),
          reportService.getExpiredExtinguishers(),
        ]);
      setExtinguisherReports(extinguishers.extinguishers);
      setInspectionReports(inspections.inspections);
      setMaintenanceHistory(maintenance.maintenance);
      setExpiredExtinguishers(expired?.extinguishers || []);
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast.success("Export functionality coming soon");
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <div className="flex items-center space-x-4">
          <Select
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-40"
          />
          <Button onClick={handleExport}>
            <div className="flex gap-1 items-center">
              {" "}
              <Download className="w-4 h-4 mr-2" />
              Export
            </div>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          {[
            { id: "extinguishers", label: "Extinguishers" },
            { id: "inspections", label: "Inspections" },
            { id: "maintenance", label: "Maintenance" },
            { id: "expired", label: "Expired" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 font-medium ${
                activeTab === tab.id
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "extinguishers" && (
        <Card>
          <CardHeader
            title="Extinguisher Reports"
            subtitle={`Extinguisher data for ${period} period`}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Serial Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Size
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {(extinguisherReports || []).map((extinguisher) => (
                  <tr
                    key={extinguisher.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {extinguisher.serialNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {extinguisher.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {extinguisher.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {extinguisher.size}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          extinguisher.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : extinguisher.status === "EXPIRED"
                              ? "bg-red-100 text-red-800"
                              : extinguisher.status === "MAINTENANCE_REQUIRED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {extinguisher.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {extinguisher.expiryDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "inspections" && (
        <Card>
          <CardHeader
            title="Inspection Reports"
            subtitle={`Inspection data for ${period} period`}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Extinguisher
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Scheduled Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Result
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Inspector
                  </th>
                </tr>
              </thead>
              <tbody>
                {(inspectionReports || []).map((inspection) => (
                  <tr
                    key={inspection.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {inspection.extinguisher?.serialNumber} -{" "}
                      {inspection.extinguisher?.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {inspection.scheduledDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inspection.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : inspection.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-800"
                              : inspection.status === "CANCELLED"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inspection.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {inspection.result || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {inspection.inspector?.firstName}{" "}
                      {inspection.inspector?.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "maintenance" && (
        <Card>
          <CardHeader
            title="Maintenance History"
            subtitle="Complete maintenance records"
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Extinguisher
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Actions Taken
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Conditions
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Inspector
                  </th>
                </tr>
              </thead>
              <tbody>
                {(maintenanceHistory || []).map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {record.extinguisher?.serialNumber} -{" "}
                      {record.extinguisher?.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary max-w-xs truncate">
                      {record.actionsTaken}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {record.dateOfAction}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary max-w-xs truncate">
                      {record.conditionsNoted || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {record.inspector?.firstName} {record.inspector?.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "expired" && (
        <Card>
          <CardHeader
            title="Expired Extinguishers"
            subtitle="Extinguishers that have passed their expiry date"
          />
          {expiredExtinguishers.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No expired extinguishers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Serial Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Expiry Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Days Expired
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(expiredExtinguishers || []).map((extinguisher) => {
                    const expiryDate = new Date(extinguisher.expiryDate);
                    const today = new Date();
                    const daysExpired = Math.floor(
                      (today.getTime() - expiryDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <tr
                        key={extinguisher.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {extinguisher.serialNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {extinguisher.location}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {extinguisher.type}
                        </td>
                        <td className="py-3 px-4 text-sm text-red-600">
                          {extinguisher.expiryDate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {daysExpired} days
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
