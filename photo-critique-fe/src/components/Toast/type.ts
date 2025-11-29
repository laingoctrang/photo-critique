export const ToastType = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  INFO: "INFO",
  WARNING: "WARNING",
} as const;

export type ToastType = typeof ToastType[keyof typeof ToastType];
