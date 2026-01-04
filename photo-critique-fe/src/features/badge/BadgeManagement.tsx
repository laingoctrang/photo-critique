import React, { useState, useMemo } from "react";
import { TrashIcon, PencilSquareIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Table, type TableColumn } from "../../components/common/Table";
import { FormModal } from "../../components/common/FormModal";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { badgeService, type BadgeResponse, type BadgeRequest } from "../../services/badgeService";
import { formatDateShortMonthTime } from "../../utils/dateUtils";
import { showToast } from "../../utils";
import { FileUpload, ToastType, type FileUploadItemData } from "../../components";

type ValidationState = {
  name: boolean;
  iconUrl: boolean;
  xpThreshold: boolean;
  level: boolean;
};

const LevelBadge: React.FC<{ level: number }> = ({ level }) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-yellow-100 text-yellow-700",
    "bg-orange-100 text-orange-700",
    "bg-red-100 text-red-700",
    "bg-purple-100 text-purple-700",
  ];
  const colorClass = colors[level % colors.length] || colors[0];

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
      Level {level}
    </span>
  );
};

export const BadgeManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeResponse | null>(null);
  const [formData, setFormData] = useState<BadgeRequest>({
    name: "",
    description: "",
    iconUrl: "",
    xpThreshold: 0,
    level: 1,
  });

  const [files, setFiles] = useState<FileUploadItemData[]>([]);
  const [initialIconUrl, setInitialIconUrl] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force refresh table

  const [validation, setValidation] = useState<ValidationState>({
    iconUrl: true,
    name: true,
    xpThreshold: true,
    level: true,
  });

  const isChanged = useMemo(() => {
    const currentIconUrl = files[0]?.imageInfo?.url || "";
    const iconUrlChanged = currentIconUrl !== initialIconUrl;

    return formData.name !== selectedBadge?.name ||
      formData.description !== (selectedBadge?.description || "") ||
      iconUrlChanged ||
      formData.xpThreshold !== selectedBadge?.xpThreshold ||
      formData.level !== selectedBadge?.level;
  }, [formData, selectedBadge, files, initialIconUrl]);

  const handleFilesChange = (newFiles: FileUploadItemData[]) => {
    setFiles(newFiles);
    const newIconUrl = newFiles[0]?.imageInfo?.url || "";
    setFormData({ ...formData, iconUrl: newIconUrl });
    setValidation({ ...validation, iconUrl: true });
  };

  const refreshTable = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreate = () => {
    setSelectedBadge(null);
    setFiles([]);
    setInitialIconUrl("");
    setFormData({
      name: "",
      description: "",
      iconUrl: "",
      xpThreshold: 0,
      level: 1,
    });
    setValidation({
      iconUrl: true,
      name: true,
      xpThreshold: true,
      level: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (badge: BadgeResponse) => {
    setSelectedBadge(badge);
    const badgeIconUrl = badge.iconUrl || "";
    setInitialIconUrl(badgeIconUrl);
    setFormData({
      name: badge.name,
      description: badge.description || "",
      iconUrl: badgeIconUrl,
      xpThreshold: badge.xpThreshold,
      level: badge.level,
    });
    setValidation({
      iconUrl: true,
      name: true,
      xpThreshold: true,
      level: true,
    });

    // Load iconUrl vào FileUpload nếu có
    if (badge.iconUrl) {
      const iconItem: FileUploadItemData = {
        id: `existing-icon-${badge.id}`,
        imageInfo: {
          url: badge.iconUrl,
          name: badge.name,
          size: 0,
          contentType: "image/*",
        },
        title: badge.name,
        progress: 100,
        status: "completed",
      };
      setFiles([iconItem]);
    } else {
      setFiles([]);
      setInitialIconUrl("");
    }

    setIsModalOpen(true);
  };

  const handleDelete = (badge: BadgeResponse) => {
    setSelectedBadge(badge);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!handleValidate()) {
        return;
      }

      if (selectedBadge) {
        await badgeService.update(selectedBadge.id, formData);
        showToast(ToastType.SUCCESS, "Badge updated successfully");
      } else {
        await badgeService.create(formData);
        showToast(ToastType.SUCCESS, "Badge created successfully");
      }
      setFiles([]);
      setIsModalOpen(false);
      refreshTable();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save badge";
      showToast(ToastType.ERROR, message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBadge) return;
    try {
      await badgeService.delete(selectedBadge.id);
      showToast(ToastType.SUCCESS, "Badge deleted successfully");
      setIsDeleteModalOpen(false);
      refreshTable();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete badge";
      showToast(ToastType.ERROR, message);
    }
  };

  const handleValidate = () => {
    const newValidation: ValidationState = {
      name: !!formData.name,
      iconUrl: !!formData.iconUrl,
      xpThreshold: formData.xpThreshold > 0,
      level: formData.level > 0,
    };
    
    setValidation(newValidation);
    
    return Object.values(newValidation).every(v => v === true);
  };

  const columns: TableColumn<BadgeResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-none flex items-center justify-center text-white font-semibold text-lg">
            {item.iconUrl ? (
              <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
            ) : (
              item.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-xs text-gray-500">
              Created: {formatDateShortMonthTime(item.createdAt)}
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
          {formatDateShortMonthTime(item.updatedAt)}
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (item) => <LevelBadge level={item.level} />,
    },
    {
      key: "xpThreshold",
      header: "XP Threshold",
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">
          {item.xpThreshold.toLocaleString()} XP
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {item.description || "-"}
        </div>
      ),
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
            key: "level",
            label: "Level",
            options: Array.from({ length: 30 }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Level ${i + 1}`,
            })),
          },
        ]}
        fetchData={async (params) => {
          // Add refreshTrigger to force refetch when changed
          return await badgeService.getFiltered(params);
        }}
        key={refreshTrigger} // Force re-render on refresh
        onCreateClick={handleCreate}
        createButtonLabel="Create Badge"
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
        emptyMessage="No badges found"
      />

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setValidation({
            iconUrl: true,
            name: true,
            xpThreshold: true,
            level: true,
          });
        }}
        title={selectedBadge ? "Edit Badge" : "Create Badge"}
        onSubmit={handleSubmit}
        hasChanges={isChanged}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => { 
              setFormData({ ...formData, name: e.target.value });
              setValidation({ ...validation, name: true }); 
            }}
            required
          />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#15B8A6]/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-4">
            <div className="col-span-1 row-span-2">
              <label htmlFor="iconUrl" className={`block text-sm font-medium ${validation.iconUrl ? "text-gray-700" : "text-red-600"} mb-1.5`}>Icon <span className="text-[#ffa17a] ml-1">*</span></label>
              <FileUpload
                files={files}
                onFilesChange={handleFilesChange}
                maxFiles={1}
                acceptedTypes="image/*"
                maxSize={10 * 1024 * 1024}
                variant="square"
                className={`w-35 h-35 rounded-3xl bg-white ${validation.iconUrl ? "" : "border-red-300 hover:border-gray-300"}`}
                itemClassName="w-35 h-35 rounded-3xl"
              />
              {!validation.iconUrl && (
                <div className="text-red-500 text-sm flex items-center mt-1 gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  Icon is required
                </div>
              )}
            </div>

            <div className="col-span-2 row-span-1">
              <Input
                label="XP Threshold"
                type="number"
                value={formData.xpThreshold.toString()}
                onChange={(e) => { 
                  setFormData({ ...formData, xpThreshold: parseInt(e.target.value) || 0 });
                  setValidation({ ...validation, xpThreshold: true });
                }}
                required
                error={!validation.xpThreshold ? "XP Threshold must be greater than 0" : ""}
              />
            </div>

            <div className="col-span-2 row-span-1">
              <Input
                label="Level"
                type="number"
                value={formData.level.toString()}
                onChange={(e) => { 
                  setFormData({ ...formData, level: parseInt(e.target.value) || 1 }); 
                  setValidation({ ...validation, level: true });
                }}
                required
                error={!validation.level ? "Level must be greater than 0" : ""}
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Badge"
        message={`Are you sure you want to delete "${selectedBadge?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
};

