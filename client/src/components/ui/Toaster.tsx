import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextType = {
  showToast: (message: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const { type, message } = toast;

  const icons = {
    success: <FiCheckCircle className="text-green-500" size={18} />,
    error: <FiAlertCircle className="text-red-500" size={18} />,
    info: <FiInfo className="text-blue-500" size={18} />,
  };

  const backgrounds = {
    success: 'bg-green-50 dark:bg-green-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  };

  const borders = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    info: 'border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={`flex w-72 items-center justify-between rounded-lg border p-3 shadow-md ${backgrounds[type]} ${borders[type]} animate-in slide-in-from-right`}
    >
      <div className="flex items-center gap-2">
        {icons[type]}
        <p className="text-sm text-neutral-800 dark:text-neutral-200">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

export const Toaster = () => {
  return null; // This component is just for convenience when importing
};