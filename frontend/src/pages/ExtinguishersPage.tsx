import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { extinguisherService } from "../services/extinguisherService";
import { extinguisherSchema } from "../validations/extinguisherSchemas";
import type {
  Extinguisher,
  ExtinguisherType,
  ExtinguisherSize,
  ExtinguisherStatus,
} from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card, CardHeader } from "../components/ui/Card";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

type ExtinguisherFormData = {
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
};

const typeOptions = [
  { value: "WATER", label: "Water" },
  { value: "CO2", label: "CO2" },
  { value: "FOAM", label: "Foam" },
  { value: "DRY_CHEMICAL", label: "Dry Chemical" },
];

const sizeOptions = [
  { value: "2.5lbs", label: "2.5 lbs" },
  { value: "5lbs", label: "5 lbs" },
  { value: "9lbs", label: "9 lbs" },
  { value: "12lbs", label: "12 lbs" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "MAINTENANCE_REQUIRED", label: "Maintenance Required" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
];

export const ExtinguishersPage: React.FC = () => {
  const [extinguishers, setExtinguishers] = useState<Extinguisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtinguisher, setEditingExtinguisher] =
    useState<Extinguisher | null>(null);
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
  } = useForm<ExtinguisherFormData>({
    resolver: zodResolver(extinguisherSchema),
  });

  useEffect(() => {
    fetchExtinguishers();
  }, [currentPage]);

  const fetchExtinguishers = async () => {
    try {
      const response = await extinguisherService.getAll(currentPage, 10);
      setExtinguishers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to fetch extinguishers");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExtinguisherFormData) => {
    try {
      if (editingExtinguisher) {
        await extinguisherService.update(editingExtinguisher.id, data);
        toast.success("Extinguisher updated successfully");
      } else {
        await extinguisherService.create(data);
        toast.success("Extinguisher created successfully");
      }
      setIsModalOpen(false);
      setEditingExtinguisher(null);
      reset();
      fetchExtinguishers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (extinguisher: Extinguisher) => {
    setEditingExtinguisher(extinguisher);
    reset({
      serialNumber: extinguisher.serialNumber,
      location: extinguisher.location,
      type: extinguisher.type,
      size: extinguisher.size,
      installationDate: extinguisher.installationDate,
      expiryDate: extinguisher.expiryDate,
      status: extinguisher.status,
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
      await extinguisherService.delete(deleteId);
      toast.success("Extinguisher deleted successfully");
      fetchExtinguishers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to delete extinguisher",
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const openModal = () => {
    setEditingExtinguisher(null);
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExtinguisher(null);
    reset();
  };

  const filteredExtinguishers = (extinguishers || []).filter(
    (e) =>
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <h1 className="text-2xl font-bold text-text-primary">Extinguishers</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-placeholder w-4 h-4" />
            <Input
              placeholder="Search extinguishers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <ProtectedRoute allowedRoles={["ADMIN", "INSPECTOR"]}>
            <Button onClick={openModal}>
              <div className="flex gap-1 items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Extinguisher
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExtinguishers.map((extinguisher) => (
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
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <ProtectedRoute allowedRoles={["ADMIN", "INSPECTOR"]}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(extinguisher)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </ProtectedRoute>
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(extinguisher.id)}
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
                editingExtinguisher ? "Edit Extinguisher" : "Add Extinguisher"
              }
              subtitle={
                editingExtinguisher
                  ? "Update extinguisher details"
                  : "Register a new fire extinguisher"
              }
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Serial Number"
                placeholder="Enter serial number"
                error={errors.serialNumber?.message}
                {...register("serialNumber")}
              />
              <Input
                label="Location"
                placeholder="Enter location"
                error={errors.location?.message}
                {...register("location")}
              />
              <Select
                label="Type"
                options={typeOptions}
                error={errors.type?.message}
                {...register("type")}
              />
              <Select
                label="Size"
                options={sizeOptions}
                error={errors.size?.message}
                {...register("size")}
              />
              <Input
                label="Installation Date"
                type="date"
                error={errors.installationDate?.message}
                {...register("installationDate")}
              />
              <Input
                label="Expiry Date"
                type="date"
                error={errors.expiryDate?.message}
                {...register("expiryDate")}
              />
              <Select
                label="Status"
                options={statusOptions}
                error={errors.status?.message}
                {...register("status")}
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingExtinguisher ? "Update" : "Create"}
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
        message="Are you sure you want to delete this extinguisher? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};
