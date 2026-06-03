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
import { ProtectedRoute } from "../components/ProtectedRoute";

type MaintenanceFormData = {
  extinguisherId: string;
  inspectorId: string;
  actionsTaken: string;
  dateOfAction: string;
  conditionsNoted?: string;
};

export const MaintenancePage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>(
    [],
  );
  const [extinguishers, setExtinguishers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    try {
      const response = hasRole(["INSPECTOR"])
        ? await maintenanceService.getMyMaintenance(currentPage, 10)
        : await maintenanceService.getAll(currentPage, 10);
      setMaintenanceRecords(response.maintenance || response.data || []);
      setTotalPages(
        response.pagination.pages || response.pagination.totalPages || 1,
      );
    } catch (error) {
      toast.error("Failed to fetch maintenance records");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExtinguishers = async () => {
    try {
      const response = await extinguisherService.getAll(1, 100);
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
      toast.success("Maintenance record created successfully");
      setIsModalOpen(false);
      reset();
      fetchMaintenanceRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const openModal = () => {
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const filteredRecords = (maintenanceRecords || []).filter(
    (m) =>
      m.extinguisher?.serialNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      m.extinguisher?.location
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const extinguisherOptions = (extinguishers || []).map((e) => ({
    value: e.id,
    label: `${e.serialNumber} - ${e.location}`,
  }));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary">
          Maintenance Logs
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-placeholder w-4 h-4" />
            <Input
              placeholder="Search maintenance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <ProtectedRoute allowedRoles={["ADMIN", "INSPECTOR"]}>
            <Button onClick={openModal}>
              <div className="flex gap-1 items-center">
                <Plus className="w-4 h-4 mr-2" />
                Log Maintenance
              </div>
            </Button>
          </ProtectedRoute>
        </div>
      </div>

      <Card>
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
              {filteredRecords.map((record) => (
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4">
            <p className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader
              title="Log Maintenance"
              subtitle="Record maintenance activity for an extinguisher"
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Extinguisher"
                options={extinguisherOptions}
                error={errors.extinguisherId?.message}
                {...register("extinguisherId")}
              />
              <Input
                label="Inspector ID"
                value={user?.id}
                disabled
                className="bg-gray-100"
              />
              <Textarea
                label="Actions Taken"
                placeholder="Describe the maintenance actions performed"
                error={errors.actionsTaken?.message}
                {...register("actionsTaken")}
                rows={4}
              />
              <Input
                label="Date of Action"
                type="date"
                error={errors.dateOfAction?.message}
                {...register("dateOfAction")}
              />
              <Textarea
                label="Conditions Noted"
                placeholder="Describe any conditions observed during maintenance"
                error={errors.conditionsNoted?.message}
                {...register("conditionsNoted")}
                rows={3}
              />
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
