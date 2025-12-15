import React, { useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ToastType } from "./type";

interface ToastProps {
  id: string;
  title?: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  onClick?: () => void;
}

const toastColors: Record<ToastType, string> = {
  [ToastType.SUCCESS]: "bg-green-100 text-green-700",
  [ToastType.ERROR]: "bg-red-100 text-red-700",
  [ToastType.INFO]: "bg-blue-100 text-blue-700",
  [ToastType.WARNING]: "bg-yellow-100 text-yellow-700",
};

// map ToastType -> Heroicon component
const toastIcons: Record<ToastType, React.ElementType> = {
  [ToastType.SUCCESS]: CheckCircleIcon,
  [ToastType.ERROR]: ExclamationCircleIcon,
  [ToastType.INFO]: InformationCircleIcon,
  [ToastType.WARNING]: ExclamationTriangleIcon,
};

const toastDefaultTitles: Record<ToastType, string> = {
  [ToastType.SUCCESS]: "Success",
  [ToastType.ERROR]: "Error",
  [ToastType.INFO]: "Info",
  [ToastType.WARNING]: "Warning",
};

const DEFAULT_DURATION = 5000;

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  type,
  message,
  duration,
  onClose,
  onClick,
}) => {
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    setVisible(true);

    const hideDelay = (duration ?? DEFAULT_DURATION) - 500;
    const totalDuration = duration ?? DEFAULT_DURATION;

    const timer = window.setTimeout(() => setVisible(false), hideDelay);
    const removeTimer = window.setTimeout(() => onClose(id), totalDuration);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(removeTimer);
    };
  }, [id, onClose, duration]);

  const Icon = toastIcons[type];
  const displayTitle = title || toastDefaultTitles[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        max-w-md
        min-w-[300px]
        flex flex-col
        p-3 rounded-2xl shadow
        mb-2
        transition-all duration-300 ease-in-out
        ${toastColors[type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      style={{ lineHeight: 1.3 }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className="w-8 h-8" aria-hidden />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{displayTitle}</p>
          <p className="text-sm break-words">{message}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          aria-label="Close toast"
          className="ml-2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <XMarkIcon className="w-5 h-5" aria-hidden />
        </button>
      </div>
    </div>
  );
};
