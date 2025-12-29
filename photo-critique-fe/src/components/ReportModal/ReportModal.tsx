import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { reportService } from "../../services";  
import { showToast } from "../../utils";
import { ToastType } from "../Toast";
import type { ReportContentType } from "../../types";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentType: ReportContentType;
    contentId: string;
    onReportSubmitted?: () => void;
}

const REPORT_REASONS = [
    "Spam or misleading content",
    "Inappropriate or offensive content",
    "Copyright infringement",
    "Harassment or bullying",
    "Violence or dangerous content",
    "False information",
    "Other",
];

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    contentType,
    contentId,
    onReportSubmitted,
}) => {
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [customReason, setCustomReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>("");

    if (!isOpen) return null;

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        setError("");
    };

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError("Please select a reason for reporting");
            return;
        }

        const reason = selectedReason === "Other" ? customReason : selectedReason;
        if (!reason || reason.trim().length < 10) {
            setError("Please provide a detailed reason (at least 10 characters)");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await reportService.createReport({
                contentType,
                reportedContentId: contentId,
                reason: reason.trim(),
            });

            showToast(ToastType.SUCCESS, "Report submitted successfully. Thank you for helping keep our community safe.");
            setSelectedReason("");
            setCustomReason("");
            onReportSubmitted?.();
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to submit report";
            setError(message);
            showToast(ToastType.ERROR, message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason("");
            setCustomReason("");
            setError("");
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            handleClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="pr-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Report {contentType}</h3>
                    <p className="text-gray-600 mb-6">
                        Help us understand what's wrong with this {contentType.toLowerCase()}. Your report will be reviewed by our moderation team.
                    </p>

                    {/* Reason Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for reporting <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => handleReasonSelect(reason)}
                                    disabled={isSubmitting}
                                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                                        selectedReason === reason
                                            ? "border-[#15B8A6] bg-[#15B8A6]/10 text-[#15B8A6]"
                                            : "border-gray-300 hover:border-gray-400 text-gray-700"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Reason Input */}
                    {selectedReason === "Other" && (
                        <div className="mb-4">
                            <Input
                                label="Please provide details"
                                placeholder="Describe the issue in detail..."
                                value={customReason}
                                onChange={(e) => {
                                    setCustomReason(e.target.value);
                                    setError("");
                                }}
                                disabled={isSubmitting}
                                error={selectedReason === "Other" && !customReason.trim() ? "Please provide details" : undefined}
                                fullWidth
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Info */}
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                            <strong>Note:</strong> False reports may result in action against your account. Please only report content that violates our community guidelines.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="shrink-0"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason || (selectedReason === "Other" && !customReason.trim())}
                        className="shrink-0"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </div>
            </div>
        </div>
    );
};






