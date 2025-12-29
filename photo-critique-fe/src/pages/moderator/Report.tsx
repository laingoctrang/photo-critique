import React, { useState } from "react";
import { Table, type TableColumn } from "../../components/common/Table";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { formatDateShortMonthTime } from "../../utils/dateUtils";
import { showToast } from "../../utils";
import { ToastType } from "../../components";
import { reportService, type ReportResponse, type ResolveReportRequest } from "../../services";
import type { ReportStatus, ReportContentType } from "../../types/enums";

const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
  
  switch (status) {
    case "PENDING":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>
          Pending
        </span>
      );
    case "REVIEWING":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          Reviewing
        </span>
      );
    case "RESOLVED":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          Resolved
        </span>
      );
    case "DISMISSED":
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          Dismissed
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          {status}
        </span>
      );
  }
};

const ContentTypeBadge: React.FC<{ type: ReportContentType }> = ({ type }) => {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
      type === "POST" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
    }`}>
      {type}
    </span>
  );
};

export const Report: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState("DELETE");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTable = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewDetail = (report: ReportResponse) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleResolve = (report: ReportResponse) => {
    setSelectedReport(report);
    setResolution("");
    setAction("DELETE");
    setIsResolveModalOpen(true);
  };

  const handleDismiss = (report: ReportResponse) => {
    setSelectedReport(report);
    setIsDismissModalOpen(true);
  };

  const handleResolveConfirm = async () => {
    if (!selectedReport || !resolution.trim()) {
      showToast(ToastType.ERROR, "Please provide a resolution");
      return;
    }
    try {
      const request: ResolveReportRequest = {
        resolution: resolution.trim(),
        action: action,
      };
      await reportService.resolveReport(selectedReport.id, request);
      showToast(ToastType.SUCCESS, "Report resolved successfully");
      setIsResolveModalOpen(false);
      setResolution("");
      setAction("DELETE");
      refreshTable();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to resolve report";
      showToast(ToastType.ERROR, message);
    }
  };

  const handleDismissConfirm = async () => {
    if (!selectedReport) return;
    try {
      await reportService.dismissReport(selectedReport.id);
      showToast(ToastType.SUCCESS, "Report dismissed successfully");
      setIsDismissModalOpen(false);
      refreshTable();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to dismiss report";
      showToast(ToastType.ERROR, message);
    }
  };

  const fetchData = async (params: {
    search?: string;
    filters?: Record<string, string>;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page: number;
    size: number;
  }) => {
    const status = params.filters?.status as ReportStatus | undefined;
    const contentType = params.filters?.reportedContentType as ReportContentType | undefined;
    
    const response = await reportService.getReports({
      status,
      contentType,
      page: params.page,
      size: params.size,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });
    
    return response;
  };

  const columns: TableColumn<ReportResponse>[] = [
    {
      key: "reporter",
      header: "Reporter",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.reporter?.fullName || "Unknown"}</div>
          <div className="text-xs text-gray-500">@{item.reporter?.username || "unknown"}</div>
        </div>
      ),
    },
    {
      key: "reportedContent",
      header: "Reported Content",
      render: (item) => (
        <div>
          <ContentTypeBadge type={item.contentType} />
          <div className="text-sm text-gray-900 mt-1 max-w-xs truncate">
            {item.reportedContentPreview}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            By: {item.reportedUser?.fullName || "Unknown"} (@{item.reportedUser?.username || "unknown"})
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (item) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {item.reason}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      header: "Reported At",
      render: (item) => (
        <div className="text-sm text-gray-900">
          {formatDateShortMonthTime(item.createdAt)}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <Table
        columns={columns}
        keyExtractor={(item) => item.id}
        searchable
        searchPlaceholder="Search reports..."
        selectable={false}
        sortable
        defaultSort={{ key: "createdAt", direction: "desc" }}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "REVIEWING", label: "Reviewing" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "DISMISSED", label: "Dismissed" },
            ],
          },
          {
            key: "reportedContentType",
            label: "Content Type",
            options: [
              { value: "POST", label: "Post" },
              { value: "COMMENT", label: "Comment" },
            ],
          },
        ]}
        fetchData={fetchData}
        key={refreshTrigger}
        actions={(item) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleViewDetail(item)}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            >
              View
            </Button>
            {item.status === "PENDING" || item.status === "REVIEWING" ? (
              <>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleResolve(item)}
                  className="text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  Resolve
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleDismiss(item)}
                  className="text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                >
                  Dismiss
                </Button>
              </>
            ) : null}
          </div>
        )}
        emptyMessage="No reports found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Report Details"
        message={
          selectedReport ? (
            <div className="text-left space-y-3">
              <div>
                <strong>Reporter:</strong> {selectedReport.reporter?.fullName || "Unknown"} (@{selectedReport.reporter?.username || "unknown"})
              </div>
              <div>
                <strong>Content Type:</strong> <ContentTypeBadge type={selectedReport.contentType} />
              </div>
              <div>
                <strong>Reported User:</strong> {selectedReport.reportedUser?.fullName || "Unknown"} (@{selectedReport.reportedUser?.username || "unknown"})
              </div>
              <div>
                <strong>Reason:</strong> {selectedReport.reason}
              </div>
              <div>
                <strong>Content Preview:</strong>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {selectedReport.reportedContentPreview}
                </div>
              </div>
              <div>
                <strong>Status:</strong> <StatusBadge status={selectedReport.status} />
              </div>
              <div>
                <strong>Reported At:</strong> {formatDateShortMonthTime(selectedReport.createdAt)}
              </div>
              {selectedReport.resolvedAt && (
                <div>
                  <strong>Resolved At:</strong> {formatDateShortMonthTime(selectedReport.resolvedAt)}
                </div>
              )}
              {selectedReport.resolution && (
                <div>
                  <strong>Resolution:</strong>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                    {selectedReport.resolution}
                  </div>
                </div>
              )}
            </div>
          ) : null
        }
        confirmText="Close"
        cancelText={null}
        onConfirm={() => setIsDetailModalOpen(false)}
        variant="default"
      />

      {/* Resolve Modal */}
      {isResolveModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsResolveModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Resolve Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the action taken..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15B8A6] focus:border-[#15B8A6] outline-none"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15B8A6] focus:border-[#15B8A6] outline-none"
                >
                  <option value="DELETE">Delete Content</option>
                  <option value="WARN">Warn User</option>
                  <option value="NO_ACTION">No Action</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleResolveConfirm} disabled={!resolution.trim()}>
                Resolve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Modal */}
      <Modal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        title="Dismiss Report"
        message={`Are you sure you want to dismiss this report? The report will be marked as dismissed and no action will be taken.`}
        confirmText="Dismiss"
        cancelText="Cancel"
        onConfirm={handleDismissConfirm}
        variant="default"
      />
    </div>
  );
};
