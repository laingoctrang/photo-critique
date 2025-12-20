import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  hasChanges?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  size = "medium",
  hasChanges = false,
}) => {
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const handleCloseAttempt = () => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCloseAttempt}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={handleCloseAttempt}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseAttempt}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            {onSubmit && (
              <Button type="submit" isLoading={isLoading}>
                {submitText}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmClose}
        onClose={handleCancelClose}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Cancel"
        cancelText="Continue Editing"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        variant="danger"
      />
    </div>
  );
};

