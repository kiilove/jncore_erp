"use client";

import { createContext, useContext } from "react";
import { toast } from "react-toastify";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const showSuccess = (message) => {
    toast.success(message);
  };

  const showError = (message) => {
    toast.error(message);
  };

  const showWarning = (message) => {
    toast.warning(message);
  };

  const showInfo = (message) => {
    toast.info(message);
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
