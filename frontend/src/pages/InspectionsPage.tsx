import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { inspectionService } from "../services/inspectionService";
import { extinguisherService } from "../services/extinguisherService";
import { authService } from "../services/authService";
import { inspectionSchema } from "../validations/inspectionSchemas";
import { getExtinguisherDisplay, getInspectorName, getRecordId } from "../utils/mongoose";
import type { Inspection, InspectionStatus, User } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardHeader } from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

// Derive the form type directly from the Zod schema so it always stays in sync
type InspectionFormData = z.infer<typeof inspectionSchema>;

// For editing an existing inspection (INSPECTOR / ADMIN only)
type UpdateFormData = {
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

const statusBadge = (status: InspectionStatus) => {
  const map: Record<InspectionStatus, string> = {
    SCHEDULED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    FAILED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
};

export const InspectionsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isInspector = user?.role === "INSPECTOR";
  const isAdminOrInspector = isAdmin || isInspector;

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [extinguishers, setExtinguishers] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Full scheduling form (ADMIN / USER)
  const {
    register: regCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { status: "SCHEDULED" },
  });

  // Update-only form (INSPECTOR / ADMIN editing)
  const {
    register: regUpdate,
    handleSubmit: handleUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
  } = useForm<UpdateFormData>();

  useEffect(() => {
    fetchInspections();
    fetchExtinguishers();
    fetchInspectors();
  }, [currentPage]);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      // INSPECTORs see only their own
      const response = isInspector
        ? await inspectionService.getMyInspections(currentPage, 10)
        : await inspectionService.getAll(currentPage, 10);
      setInspections(response.inspections || response.data || []);
      const p = response.pagination;
      setTotalPages(p.pages ?? p.totalPages ?? 1);
      setTotalItems(p.total ?? 0);
    } catch (error) {
      toast.error("Failed to fetch inspections");
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

  const fetchInspectors = async () => {
    try {
      const response = await authService.getInspectors();
      setInspectors(response.inspectors || []);
    } catch (error) {
      console.error("Failed to fetch inspectors:", error);
    }
  };

  // ── Submit new inspection (ADMIN / USER) ─────────────────────────
  const onCreateSubmit = async (data: InspectionFormData) => {
    try {
      await inspectionService.create(data);
      toast.success("Inspection scheduled successfully. Notifications sent.");
      closeModal();
      fetchInspections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to schedule inspection");
    }
  };

  // ── Submit update (ADMIN / INSPECTOR) ────────────────────────────
  const onUpdateSubmit = async (data: UpdateFormData) => {
    if (!editingInspection) return;
    try {
      await inspectionService.update(editingInspection.id, data);
      toast.success("Inspection updated successfully");
      closeModal();
      fetchInspections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update inspection");
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingInspection(null);
    resetCreate({ status: "SCHEDULED" });
    // Pre-fill inspectorId for USER (they pick who inspects)
    // for ADMIN leave it blank so they choose from dropdown
    setIsModalOpen(true);
  };

  const openEditModal = (inspection: Inspection) => {
    setIsEditMode(true);
    setEditingInspection(inspection);
    resetUpdate({
      status: inspection.status,
      result: inspection.result ?? "",
      notes: inspection.notes ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingInspection(null);
    resetCreate({ status: "SCHEDULED" });
    resetUpdate();
  };

  const handleDelete = (id: string) => {
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

  const filteredInspections = inspections.filter((i) => {
    const { serial, location } = getExtinguisherDisplay(i);
    const term = searchTerm.toLowerCase();
    return serial.toLowerCase().includes(term) || (location ?? "").toLowerCase().includes(term);
  });

  const extinguisherOptions = extinguishers.map((e) => ({
    value: e.id ?? e._id,
    label: `${e.serialNumber} – ${e.location}`,
  }));

  const inspectorOptions = inspectors.map((i) => ({
    value: i.id ?? (i as any)._id,
    label: `${i.firstName} ${i.lastName} (${i.role})`,
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
          <h1 className="text-2xl font-bold text-text-primary">Inspections</h1>
          {isInspector && (
            <p className="text-sm text-text-secondary mt-1">
              Showing only your assigned inspections.
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-placeholder w-4 h-4" />
            <Input
              placeholder="Search inspections…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {/* Only ADMIN and USER can schedule new inspections */}
          {(isAdmin || user?.role === "USER") && (
            <Button onClick={openCreateModal}>
              <div className="flex gap-1 items-center">
                <Plus className="w-4 h-4" />
                Schedule Inspection
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Extinguisher</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Scheduled Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Inspector</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Result</th>
                {isAdminOrInspector && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrInspector ? 7 : 6} className="text-center py-8 text-text-secondary">
                    No inspections found.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((inspection) => {
                  const rowId = getRecordId(inspection);
                  const { serial, location } = getExtinguisherDisplay(inspection);
                  const inspName = getInspectorName(inspection);

                  return (
                    <tr key={rowId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-text-primary">
                        <span className="font-mono">{serial}</span>
                        {location && (
                          <span className="text-text-secondary"> – {location}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-primary">
                        {inspection.scheduledDate?.slice(0, 10)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-primary">
                        {inspection.scheduledTime}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-primary">
                        {inspName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(inspection.status)}`}>
                          {inspection.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-primary">
                        {inspection.result || "—"}
                      </td>
                      {isAdminOrInspector && (
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal({ ...inspection, id: rowId })}
                              title="Update result / status"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(rowId)}
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

      {/* ── CREATE INSPECTION modal (ADMIN / USER) ── */}
      {isModalOpen && !isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader
              title="Schedule Inspection"
              subtitle="Select an extinguisher and assign an inspector"
            />
            <form onSubmit={handleCreate(onCreateSubmit)} className="space-y-4">
              <Select
                label="Extinguisher"
                options={[{ value: "", label: "-- Select extinguisher --" }, ...extinguisherOptions]}
                error={createErrors.extinguisherId?.message}
                {...regCreate("extinguisherId")}
              />
              <Input
                label="Scheduled Date"
                type="date"
                error={createErrors.scheduledDate?.message}
                {...regCreate("scheduledDate")}
              />
              <Input
                label="Scheduled Time"
                type="time"
                error={createErrors.scheduledTime?.message}
                {...regCreate("scheduledTime")}
              />
              <Select
                label="Assign Inspector"
                options={[{ value: "", label: "-- Select inspector --" }, ...inspectorOptions]}
                error={createErrors.inspectorId?.message}
                {...regCreate("inspectorId")}
              />
              {/* Hidden status default */}
              <input type="hidden" value="SCHEDULED" {...regCreate("status")} />
              <Textarea
                label="Notes (optional)"
                placeholder="Any additional notes for the inspector"
                error={createErrors.notes?.message}
                {...regCreate("notes")}
              />
              <p className="text-xs text-text-secondary">
                An email notification will be sent to the assigned inspector and all admins upon scheduling.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isCreating}>
                  Schedule
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── EDIT INSPECTION modal (ADMIN / INSPECTOR) ── */}
      {isModalOpen && isEditMode && isAdminOrInspector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader
              title="Update Inspection"
              subtitle="Log the result and update status"
            />
            <form onSubmit={handleUpdate(onUpdateSubmit)} className="space-y-4">
              <Select
                label="Status"
                options={statusOptions}
                error={updateErrors.status?.message}
                {...regUpdate("status")}
              />
              <Textarea
                label="Result"
                placeholder="Describe the inspection outcome"
                error={updateErrors.result?.message}
                {...regUpdate("result")}
              />
              <Textarea
                label="Notes"
                placeholder="Any additional observations"
                error={updateErrors.notes?.message}
                {...regUpdate("notes")}
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isUpdating}>
                  Update
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
