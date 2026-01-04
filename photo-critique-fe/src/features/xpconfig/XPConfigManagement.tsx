import React, { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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

// Status and Category constants
type XPConfigStatus = "PENDING_DEVELOPMENT" | "IN_DEVELOPMENT" | "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";

const XP_CONFIG_STATUS = {
  PENDING_DEVELOPMENT: "PENDING_DEVELOPMENT" as const,
  IN_DEVELOPMENT: "IN_DEVELOPMENT" as const,
  PENDING_APPROVAL: "PENDING_APPROVAL" as const,
  ACTIVE: "ACTIVE" as const,
  INACTIVE: "INACTIVE" as const,
};

const XP_CONFIG_CATEGORY = {
  POST: "POST" as const,
  COMMENT: "COMMENT" as const,
  REACTION: "REACTION" as const,
};

// Helper to get status label
const getStatusLabel = (status: XPConfigStatus): string => {
  switch (status) {
    case XP_CONFIG_STATUS.PENDING_DEVELOPMENT:
      return "Pending Development";
    case XP_CONFIG_STATUS.IN_DEVELOPMENT:
      return "In Development";
    case XP_CONFIG_STATUS.PENDING_APPROVAL:
      return "Pending Approval";
    case XP_CONFIG_STATUS.ACTIVE:
      return "Active";
    case XP_CONFIG_STATUS.INACTIVE:
      return "Inactive";
    default:
      return "Unknown";
  }
};

// Helper to get category label
const getCategoryLabel = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
  
  switch (status) {
    case XP_CONFIG_STATUS.ACTIVE:
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          {getStatusLabel(XP_CONFIG_STATUS.ACTIVE)}
        </span>
      );
    case XP_CONFIG_STATUS.PENDING_APPROVAL:
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>
          {getStatusLabel(XP_CONFIG_STATUS.PENDING_APPROVAL)}
        </span>
      );
    case XP_CONFIG_STATUS.IN_DEVELOPMENT:
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          {getStatusLabel(XP_CONFIG_STATUS.IN_DEVELOPMENT)}
        </span>
      );
    case XP_CONFIG_STATUS.PENDING_DEVELOPMENT:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          {getStatusLabel(XP_CONFIG_STATUS.PENDING_DEVELOPMENT)}
        </span>
      );
    case XP_CONFIG_STATUS.INACTIVE:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          {getStatusLabel(XP_CONFIG_STATUS.INACTIVE)}
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
    status: XP_CONFIG_STATUS.PENDING_DEVELOPMENT,
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
      status: XP_CONFIG_STATUS.PENDING_DEVELOPMENT,
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
      status: config.status || XP_CONFIG_STATUS.PENDING_DEVELOPMENT,
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
      header: "Last Updated",
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
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-4">

      {/* Table */}
      <Table
        columns={columns}
        keyExtractor={(item) => item.id}
        searchable
        searchPlaceholder="Search by name, description"
        selectable={false}
        sortable
        defaultSort={{ key: "updatedAt", direction: "desc" }}
        filters={[
          {
            key: "category",
            label: "Category",
            options: Object.values(XP_CONFIG_CATEGORY).map(category => ({
              value: category,
              label: getCategoryLabel(category),
            })),
          },
          {
            key: "status",
            label: "Status",
            options: Object.values(XP_CONFIG_STATUS).map(status => ({
              value: status,
              label: getStatusLabel(status),
            })),
          },
        ]}
        fetchData={async (params) => {
          return await xpConfigService.getFiltered(params);
        }}
        onCreateClick={handleCreate}
        createButtonLabel="Create Config"
        key={refreshTrigger} // Force re-render on refresh
        actions={(item) => (
          <div className="">
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleEdit(item)}
              leftIcon={PencilSquareIcon}
              className="text-green-500 p-3 hover:text-green-600 hover:bg-green-50"
            >
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleDelete(item)}
              leftIcon={TrashIcon}
              className="text-red-500 p-3 hover:text-red-600 hover:bg-red-50"
            >
            </Button>
          </div>
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
            options={Object.values(XP_CONFIG_CATEGORY).map(category => ({
              value: category,
              label: getCategoryLabel(category),
            }))}
            placeholder="Select category"
            clearable
          />
          {/* <Dropdown
            label="Status"
            value={formData.status || null}
            onChange={(val) =>
              setFormData({ ...formData, status: (val as XPConfigStatus) || XP_CONFIG_STATUS.PENDING_DEVELOPMENT })
            }
            options={Object.values(XP_CONFIG_STATUS).map(status => ({
              value: status,
              label: getStatusLabel(status),
            }))}
            placeholder="Select status"
            required
          /> */}
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

