import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
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

const statusBadge = (status: ExtinguisherStatus) => {
  const map: Record<ExtinguisherStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-red-100 text-red-800",
    MAINTENANCE_REQUIRED: "bg-yellow-100 text-yellow-800",
    OUT_OF_SERVICE: "bg-gray-100 text-gray-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
};

export const ExtinguishersPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrInspector = hasRole(["ADMIN", "INSPECTOR"]);
  const today = new Date().toISOString().slice(0, 10);

  const [extinguishers, setExtinguishers] = useState<Extinguisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtinguisher, setEditingExtinguisher] =
    useState<Extinguisher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
    setIsLoading(true);
    try {
      const response = await extinguisherService.getAll(currentPage, 10);
      setExtinguishers(response.extinguishers || response.data || []);
      const pagination = response.pagination;
      setTotalPages(pagination.pages ?? pagination.totalPages ?? 1);
      setTotalItems(pagination.total ?? 0);
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
      closeModal();
      fetchExtinguishers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (extinguisher: Extinguisher) => {
    setEditingExtinguisher(extinguisher);
    // Format dates to yyyy-MM-dd for <input type="date">
    const fmt = (d: string) => d?.slice(0, 10) ?? "";
    reset({
      serialNumber: extinguisher.serialNumber,
      location: extinguisher.location,
      type: extinguisher.type,
      size: extinguisher.size,
      installationDate: fmt(extinguisher.installationDate),
      expiryDate: fmt(extinguisher.expiryDate),
      status: extinguisher.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
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
      toast.error(error.response?.data?.error || "Failed to delete extinguisher");
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

  const filteredExtinguishers = extinguishers.filter(
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
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Extinguishers</h1>
          {user?.role === "USER" && (
            <p className="text-sm text-text-secondary mt-1">
              Browse the extinguisher inventory and check status.
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
          {isAdminOrInspector && (
            <Button onClick={openModal}>
              <div className="flex gap-1 items-center">
                <Plus className="w-4 h-4" />
                Add Extinguisher
              </div>
            </Button>
          )}
        </div>
      </div>

      <Card>
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
                {isAdminOrInspector && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredExtinguishers.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrInspector ? 7 : 6} className="text-center py-8 text-text-secondary">
                    No extinguishers found.
                  </td>
                </tr>
              ) : (
                filteredExtinguishers.map((extinguisher) => {
                  const rowId = extinguisher.id ?? (extinguisher as any)._id ?? extinguisher.serialNumber;
                  const editId = extinguisher.id ?? (extinguisher as any)._id ?? "";
                  return (
                  <tr key={rowId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-text-primary">{extinguisher.serialNumber}</td>
                    <td className="py-3 px-4 text-sm text-text-primary">{extinguisher.location}</td>
                    <td className="py-3 px-4 text-sm text-text-primary">{extinguisher.type}</td>
                    <td className="py-3 px-4 text-sm text-text-primary">{extinguisher.size}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(extinguisher.status)}`}>
                        {extinguisher.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {extinguisher.expiryDate?.slice(0, 10)}
                    </td>
                    {isAdminOrInspector && (
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(extinguisher)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {user?.role === "ADMIN" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(editId)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Create / Edit Modal */}
      {isModalOpen && isAdminOrInspector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader
              title={editingExtinguisher ? "Edit Extinguisher" : "Add Extinguisher"}
              subtitle={
                editingExtinguisher
                  ? "Update extinguisher details"
                  : "Register a new fire extinguisher"
              }
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Serial Number"
                placeholder="e.g. EXT-001"
                error={errors.serialNumber?.message}
                {...register("serialNumber")}
              />
              <Input
                label="Location"
                placeholder="e.g. Building A – Floor 2"
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
                min={today}
                error={errors.installationDate?.message}
                {...register("installationDate")}
              />
              <Input
                label="Expiry Date"
                type="date"
                min={today}
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
