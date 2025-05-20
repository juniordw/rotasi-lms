import Button from "@/components/ui/Button";
import { FiAlertTriangle, FiX } from "react-icons/fi";

type DeleteConfirmationProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
};

const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmationProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-red-500">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <FiX />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <FiAlertTriangle className="text-3xl text-red-500" />
            </div>
          </div>
          <p className="text-center text-neutral-600 dark:text-neutral-300">
            {message}
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;