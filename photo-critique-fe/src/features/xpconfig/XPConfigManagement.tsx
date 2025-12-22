import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Table, type TableColumn } from "../../components/common/Table";
import { FormModal } from "../../components/common/FormModal";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Dropdown } from "../../components/common/Dropdown";
import { xpConfigService, type XPConfigResponse, type XPConfigRequest } from "../../services/xpConfigService";
import { ToastType } from "../../components";
import { showToast } from "../../utils";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type XPConfigStatus = "PENDING_DEVELOPMENT" | "IN_DEVELOPMENT" | "PENDING_APPROVAL" | "ACTIVE";

const StatusBadge: React.FC<{ status?: XPConfigStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
  
  switch (status) {
    case "ACTIVE":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          Active
        </span>
      );
    case "PENDING_APPROVAL":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>
          Pending Approval
        </span>
      );
    case "IN_DEVELOPMENT":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          In Development
        </span>
      );
    case "PENDING_DEVELOPMENT":
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          Pending Development
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          Unknown
        </span>
      );
  }
};

// Helper function to convert name to event_type
const generateEventTypeFromName = (name: string): string => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

export const XPConfigManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<XPConfigResponse | null>(null);
  const [formData, setFormData] = useState<XPConfigRequest>({
    eventType: "",
    name: "",
    points: 0,
    description: "",
    category: "",
    status: "PENDING_DEVELOPMENT" as XPConfigStatus,
  });
  
  // Auto-generate event_type from name when creating (not editing)
  useEffect(() => {
    if (!selectedConfig && formData.name) {
      const generatedEventType = generateEventTypeFromName(formData.name);
      setFormData(prev => ({ ...prev, eventType: generatedEventType }));
    }
  }, [formData.name, selectedConfig]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force refresh table

  const refreshTable = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreate = () => {
    setSelectedConfig(null);
    setFormData({
      eventType: "",
      name: "",
      points: 0,
      description: "",
      category: "",
      status: "PENDING_DEVELOPMENT" as XPConfigStatus,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (config: XPConfigResponse) => {
    setSelectedConfig(config);
    setFormData({
      eventType: config.eventType,
      name: config.name,
      points: config.points,
      description: config.description || "",
      category: config.category || "",
      status: (config.status as XPConfigStatus) || "PENDING_DEVELOPMENT",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (config: XPConfigResponse) => {
    setSelectedConfig(config);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedConfig) {
        await xpConfigService.createOrUpdate(formData);
        showToast(ToastType.SUCCESS, "XP Config updated successfully");
      } else {
        await xpConfigService.createOrUpdate(formData);
        showToast(ToastType.SUCCESS, "XP Config created successfully");
      }
      setIsModalOpen(false);
      refreshTable();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save XP Config";
      showToast(ToastType.ERROR, message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConfig) return;
    try {
      await xpConfigService.delete(selectedConfig.eventType);
      showToast(ToastType.SUCCESS, "XP Config deleted successfully");
      setIsDeleteModalOpen(false);
      refreshTable();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete XP Config";
      showToast(ToastType.ERROR, message);
    }
  };

  const columns: TableColumn<XPConfigResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#15B8A6] rounded-lg flex items-center justify-center text-white font-semibold">
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-xs text-gray-500">
              Created: {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Activity",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.updatedAt)}
        </div>
      ),
    },
    {
      key: "eventType",
      header: "Event Type",
      render: (item) => (
        <div className="text-sm text-gray-900">{item.eventType}</div>
      ),
    },
    {
      key: "points",
      header: "Points",
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">{item.points}</div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <div className="text-sm text-gray-600">{item.category || "-"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status as XPConfigStatus} />,
    },
  ];

  return (
    <div className="space-y-4">

      {/* Table */}
      <Table
        columns={columns}
        keyExtractor={(item) => item.id}
        searchable
        searchPlaceholder="Search configs..."
        selectable={false}
        sortable
        defaultSort={{ key: "updatedAt", direction: "desc" }}
        filters={[
          {
            key: "isActive",
            label: "Status",
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
          },
          {
            key: "category",
            label: "Category",
            options: [
              { value: "post", label: "Post" },
              { value: "comment", label: "Comment" },
              { value: "reaction", label: "Reaction" },
              { value: "other", label: "Other" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "PENDING_DEVELOPMENT", label: "Pending Development" },
              { value: "IN_DEVELOPMENT", label: "In Development" },
              { value: "PENDING_APPROVAL", label: "Pending Approval" },
              { value: "ACTIVE", label: "Active" },
            ],
          },
        ]}
        fetchData={async (params) => {
          return await xpConfigService.getFiltered(params);
        }}
        onCreateClick={handleCreate}
        createButtonLabel="Create Config"
        key={refreshTrigger} // Force re-render on refresh
        actions={(item) => (
          <>
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleEdit(item)}
              leftIcon={PencilIcon}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleDelete(item)}
              leftIcon={TrashIcon}
            >
              Delete
            </Button>
          </>
        )}
        emptyMessage="No XP configs found"
      />

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedConfig ? "Edit XP Config" : "Create XP Config"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <Input
            label="Event Type"
            value={formData.eventType}
            onChange={(e) =>
              setFormData({ ...formData, eventType: e.target.value })
            }
            required
            disabled={true}
            helperText={selectedConfig ? "Event type cannot be changed" : "Auto-generated from name"}
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            label="Points"
            type="number"
            value={formData.points.toString()}
            onChange={(e) =>
              setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
            }
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Dropdown
            label="Category"
            value={formData.category || null}
            onChange={(val) =>
              setFormData({ ...formData, category: val || "" })
            }
            options={[
              { value: "post", label: "Post" },
              { value: "comment", label: "Comment" },
              { value: "reaction", label: "Reaction" },
              { value: "other", label: "Other" },
            ]}
            placeholder="Select category"
            clearable
          />
          <Dropdown
            label="Status"
            value={formData.status || null}
            onChange={(val) =>
              setFormData({ ...formData, status: (val as XPConfigStatus) || "PENDING_DEVELOPMENT" })
            }
            options={[
              { value: "PENDING_DEVELOPMENT", label: "Pending Development" },
              { value: "IN_DEVELOPMENT", label: "In Development" },
              { value: "PENDING_APPROVAL", label: "Pending Approval" },
              { value: "ACTIVE", label: "Active" },
            ]}
            placeholder="Select status"
            required
          />
        </div>
      </FormModal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete XP Config"
        message={`Are you sure you want to delete "${selectedConfig?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
};

