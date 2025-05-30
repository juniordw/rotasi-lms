// src/components/user/BulkConfirmationModal.tsx
import Button from "@/components/ui/Button";
import { FiAlertTriangle, FiX, FiUsers, FiEdit, FiTrash } from "react-icons/fi";

type BulkAction = 'changeRole' | 'delete';

type BulkConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: BulkAction;
  selectedCount: number;
  targetRole?: string;
  isLoading?: boolean;
};

const BulkConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  selectedCount,
  targetRole,
  isLoading = false
}: BulkConfirmationModalProps) => {
  if (!isOpen) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'instructor': return 'Instruktur';
      case 'student': return 'Siswa';
      default: return role;
    }
  };

  const getActionDetails = () => {
    switch (action) {
      case 'changeRole':
        return {
          icon: <FiEdit className="text-blue-500" size={24} />,
          title: 'Ubah Role Pengguna',
          message: `Apakah Anda yakin ingin mengubah role ${selectedCount} pengguna menjadi ${getRoleDisplayName(targetRole || '')}?`,
          confirmText: 'Ubah Role',
          confirmClass: 'bg-blue-500 hover:bg-blue-600',
          warningText: 'Tindakan ini akan mengubah hak akses pengguna dalam sistem.'
        };
      case 'delete':
        return {
          icon: <FiTrash className="text-red-500" size={24} />,
          title: 'Hapus Pengguna',
          message: `Apakah Anda yakin ingin menghapus ${selectedCount} pengguna yang dipilih?`,
          confirmText: 'Hapus',
          confirmClass: 'bg-red-500 hover:bg-red-600',
          warningText: 'Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data pengguna.'
        };
      default:
        return {
          icon: <FiAlertTriangle className="text-yellow-500" size={24} />,
          title: 'Konfirmasi',
          message: 'Apakah Anda yakin ingin melanjutkan?',
          confirmText: 'Lanjutkan',
          confirmClass: 'bg-primary-500 hover:bg-primary-600',
          warningText: 'Pastikan Anda telah mempertimbangkan tindakan ini.'
        };
    }
  };

  const actionDetails = getActionDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {actionDetails.title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            <FiX />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
              {actionDetails.icon}
            </div>
          </div>

          <div className="mb-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400">
              <FiUsers size={16} />
              <span className="text-sm">
                {selectedCount} pengguna terpilih
              </span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300">
              {actionDetails.message}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Perhatian:</strong> {actionDetails.warningText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-white ${actionDetails.confirmClass}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Memproses...
              </div>
            ) : (
              actionDetails.confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkConfirmationModal;