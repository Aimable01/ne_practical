import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { inspectionService } from "../services/inspectionService";
import { extinguisherService } from "../services/extinguisherService";
import { inspectionSchema } from "../validations/inspectionSchemas";
import type { Inspection, InspectionStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardHeader } from "../components/ui/Card";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

type InspectionFormData = {
  extinguisherId: string;
  scheduledDate: string;
  scheduledTime: string;
  inspectorId: string;
  status: InspectionStatus;
  result?: string;
  notes?: string;
};

const statusOptions = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
];

export const InspectionsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [extinguishers, setExtinguishers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
  });

  useEffect(() => {
    fetchInspections();
    fetchExtinguishers();
  }, [currentPage]);

  const fetchInspections = async () => {
    try {
      const response = hasRole(["INSPECTOR"])
        ? await inspectionService.getMyInspections(currentPage, 10)
        : await inspectionService.getAll(currentPage, 10);
      setInspections(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to fetch inspections");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExtinguishers = async () => {
    try {
      const response = await extinguisherService.getAll(1, 100);
      setExtinguishers(response.data);
    } catch (error) {
      console.error("Failed to fetch extinguishers:", error);
    }
  };

  const onSubmit = async (data: InspectionFormData) => {
    try {
      if (editingInspection) {
        await inspectionService.update(editingInspection.id, data);
        toast.success("Inspection updated successfully");
      } else {
        await inspectionService.create({
          ...data,
          inspectorId: user?.id || "",
        });
        toast.success("Inspection scheduled successfully");
      }
      setIsModalOpen(false);
      setEditingInspection(null);
      reset();
      fetchInspections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (inspection: Inspection) => {
    setEditingInspection(inspection);
    reset({
      extinguisherId: inspection.extinguisherId,
      scheduledDate: inspection.scheduledDate,
      scheduledTime: inspection.scheduledTime,
      inspectorId: inspection.inspectorId,
      status: inspection.status,
      result: inspection.result,
      notes: inspection.notes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await inspectionService.delete(deleteId);
      toast.success("Inspection deleted successfully");
      fetchInspections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete inspection");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const openModal = () => {
    setEditingInspection(null);
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInspection(null);
    reset();
  };

  const filteredInspections = (inspections || []).filter(
    (i) =>
      i.extinguisher?.serialNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      i.extinguisher?.location
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
        <h1 className="text-2xl font-bold text-text-primary">Inspections</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-placeholder w-4 h-4" />
            <Input
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
            <Button onClick={openModal}>
              <div className="flex gap-1 items-center">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Inspection
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
                  Scheduled Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                  Result
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((inspection) => (
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
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {inspection.scheduledTime}
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
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <ProtectedRoute allowedRoles={["ADMIN", "INSPECTOR"]}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(inspection)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </ProtectedRoute>
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(inspection.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </ProtectedRoute>
                    </div>
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
              title={
                editingInspection ? "Edit Inspection" : "Schedule Inspection"
              }
              subtitle={
                editingInspection
                  ? "Update inspection details"
                  : "Book a new inspection"
              }
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Extinguisher"
                options={extinguisherOptions}
                error={errors.extinguisherId?.message}
                {...register("extinguisherId")}
              />
              <Input
                label="Scheduled Date"
                type="date"
                error={errors.scheduledDate?.message}
                {...register("scheduledDate")}
              />
              <Input
                label="Scheduled Time"
                type="time"
                error={errors.scheduledTime?.message}
                {...register("scheduledTime")}
              />
              <Input
                label="Inspector ID"
                value={user?.id}
                disabled
                className="bg-gray-100"
              />
              <Select
                label="Status"
                options={statusOptions}
                error={errors.status?.message}
                {...register("status")}
              />
              <Textarea
                label="Result"
                placeholder="Enter inspection result"
                error={errors.result?.message}
                {...register("result")}
              />
              <Textarea
                label="Notes"
                placeholder="Enter additional notes"
                error={errors.notes?.message}
                {...register("notes")}
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingInspection ? "Update" : "Schedule"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this inspection? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};
