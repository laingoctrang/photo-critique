import React from "react";
import { Toast } from "./Toast";
import type { ToastType } from "./type";

export interface InternalToast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number
}

interface ToastContainerProps {
  toasts: InternalToast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col">
    {toasts.map((t) => (
      <Toast key={t.id} {...t} onClose={removeToast} />
    ))}
  </div>
);
