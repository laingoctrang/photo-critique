import { createRoot } from "react-dom/client";
import { ToastContainer, ToastType, type InternalToast } from "../components";

let container: HTMLDivElement | null = null;
let root: any = null;
let toasts: InternalToast[] = [];

export const showToast = (type: ToastType, message: string, title?: string, duration?: number) => {
  if (!container) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  }

  const id = Date.now().toString();

  const removeToast = (toastId: string) => {
    toasts = toasts.filter((t) => t.id !== toastId);
    render();
  };

  const addToast = () => {
    toasts.push({ id, type, message, title, duration });
    render();
  };

  const render = () => {
    root.render(<ToastContainer toasts={toasts} removeToast={removeToast} />);
  };

  addToast();
};
