import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { maintenanceService } from "../services/maintenanceService";
import { extinguisherService } from "../services/extinguisherService";
import { maintenanceSchema } from "../validations/maintenanceSchemas";
import type { Maintenance } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardHeader } from "../components/ui/Card";

type MaintenanceFormData = {
  extinguisherId: string;
  inspectorId: string;
  actionsTaken: string;
  dateOfAction: string;
  conditionsNoted: string;
};

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const isInspector = user?.role === "INSPECTOR";

  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [extinguishers, setExtinguishers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
  });

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchExtinguishers();
  }, [currentPage]);

  const fetchMaintenanceRecords = async () => {
    setIsLoading(true);
    try {
      // INSPECTORs see only their own logs
      const response = isInspector
        ? await maintenanceService.getMyMaintenance(currentPage, 10)
        : await maintenanceService.getAll(currentPage, 10);
      setMaintenanceRecords(response.maintenanceRecords ?? []);
      const p = response.pagination;
      setTotalPages(p.pages ?? p.totalPages ?? 1);
      setTotalItems(p.total ?? 0);
    } catch (error) {
      toast.error("Failed to fetch maintenance records");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExtinguishers = async () => {
    try {
      const response = await extinguisherService.getAll(1, 200);
      setExtinguishers(response.extinguishers || response.data || []);
    } catch (error) {
      console.error("Failed to fetch extinguishers:", error);
    }
  };

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      await maintenanceService.create({
        ...data,
        inspectorId: user?.id || "",
      });
      toast.success("Maintenance logged successfully. Notifications sent.");
      closeModal();
      fetchMaintenanceRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const openModal = () => {
    reset({
      inspectorId: user?.id ?? "",
      dateOfAction: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const filteredRecords = maintenanceRecords.filter((m) => {
    const extObj: any = m.extinguisher ?? (m as any).extinguisherId;
    const serial =
      typeof extObj === "object" && extObj !== null
        ? extObj.serialNumber ?? ""
        : "";
    const location =
      typeof extObj === "object" && extObj !== null
        ? extObj.location ?? ""
        : "";
    return (
      serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const extinguisherOptions = extinguishers.map((e) => ({
    value: e.id ?? e._id,
    label: `${e.serialNumber} – ${e.location}`,
  }));

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
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Maintenance Logs</h1>
          {isInspector && (
            <p className="text-sm text-text-secondary mt-1">
              Showing only your maintenance records.
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-placeholder w-4 h-4" />
            <Input
              placeholder="Search by serial / location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={openModal}>
            <div className="flex gap-1 items-center">
              <Plus className="w-4 h-4" />
              Log Maintenance
            </div>
          </Button>
        </div>
      </div>

      <Card>
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
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-text-secondary">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  // Mongoose may return extinguisherId / inspectorId as a populated object
                  const extObj: any =
                    record.extinguisher ?? (record as any).extinguisherId;
                  const inspObj: any =
                    record.inspector ?? (record as any).inspectorId;
                  const recordId: string =
                    record.id ?? (record as any)._id ?? Math.random().toString();

                  const extSerial =
                    typeof extObj === "object" && extObj !== null
                      ? extObj.serialNumber
                      : extObj ?? "—";
                  const extLocation =
                    typeof extObj === "object" && extObj !== null
                      ? extObj.location
                      : null;
                  const inspName =
                    typeof inspObj === "object" && inspObj !== null
                      ? `${inspObj.firstName ?? ""} ${inspObj.lastName ?? ""}`.trim()
                      : null;

                  return (
                    <tr key={recordId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-text-primary">
                        <span className="font-mono">{extSerial}</span>
                        {extLocation && (
                          <span className="text-text-secondary"> – {extLocation}</span>
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
                        {inspName || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4 pb-2">
            <p className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages} &nbsp;·&nbsp; {totalItems} total
            </p>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Log Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader
              title="Log Maintenance"
              subtitle="Record a maintenance activity for a fire extinguisher"
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Extinguisher"
                options={[{ value: "", label: "-- Select extinguisher --" }, ...extinguisherOptions]}
                error={errors.extinguisherId?.message}
                {...register("extinguisherId")}
              />
              {/* inspectorId is hidden — auto-filled with logged-in user */}
              <input type="hidden" value={user?.id} {...register("inspectorId")} />
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-text-secondary">
                Logged by: <span className="font-medium text-text-primary">{user?.firstName} {user?.lastName}</span>
              </div>
              <Textarea
                label="Actions Taken"
                placeholder="Describe the maintenance actions performed (min 10 characters)"
                error={errors.actionsTaken?.message}
                rows={4}
                {...register("actionsTaken")}
              />
              <Input
                label="Date of Action"
                type="date"
                error={errors.dateOfAction?.message}
                {...register("dateOfAction")}
              />
              <Textarea
                label="Conditions Noted"
                placeholder="Describe any conditions observed (min 10 characters)"
                error={errors.conditionsNoted?.message}
                rows={3}
                {...register("conditionsNoted")}
              />
              <p className="text-xs text-text-secondary">
                An email notification will be sent to all admins when this record is saved.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Log Maintenance
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
