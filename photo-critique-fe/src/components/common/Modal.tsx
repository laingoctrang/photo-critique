import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "danger";
  showCancel?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  showCancel = true,
}) => {
  if (!isOpen) return null;

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={(e) => handleCancel(e)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="pr-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="text-gray-600 mb-6">{message}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {showCancel && (
            <Button
              variant="outline"
              onClick={(e) => handleCancel(e)}
              className="shrink-0"
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={(e) => handleConfirm(e)}
            className="shrink-0"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

