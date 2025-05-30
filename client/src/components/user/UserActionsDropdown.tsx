// src/components/user/UserActionsDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { 
  FiMoreVertical, 
  FiEdit, 
  FiTrash, 
  FiEye, 
  FiLock, 
  FiUnlock,
  FiMail
} from "react-icons/fi";

type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  department: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  is_active?: boolean;
};

type UserActionsDropdownProps = {
  user: User;
  onChangeRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onViewDetails?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onSendEmail?: (user: User) => void;
  currentUserId?: number;
};

const UserActionsDropdown = ({
  user,
  onChangeRole,
  onDeleteUser,
  onViewDetails,
  onToggleStatus,
  onSendEmail,
  currentUserId
}: UserActionsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // Check if this is the current user (prevent self-deletion/role change)
  const isCurrentUser = currentUserId === user.id;

  // Safely determine user status (default to active if undefined)
  const isUserActive = user.is_active !== false;

  // Don't allow role changes for super admin or if current user is the target
  const canChangeRole = !isCurrentUser && user.role !== 'super_admin';
  
  // Don't allow deletion of current user or super admin
  const canDelete = !isCurrentUser && user.role !== 'super_admin';
  
  // Don't allow status toggle for current user or super admin
  const canToggleStatus = !isCurrentUser && user.role !== 'super_admin' && onToggleStatus;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="User actions"
      >
        <FiMoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg z-20 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 py-1">
          {/* View Details */}
          {onViewDetails && (
            <button
              onClick={() => handleAction(() => onViewDetails(user))}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              <FiEye className="mr-3 text-blue-500" size={16} />
              Lihat Detail
            </button>
          )}

          {/* Change Role - Only for other users and non-super-admin */}
          {canChangeRole && (
            <button
              onClick={() => handleAction(() => onChangeRole(user))}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              <FiEdit className="mr-3 text-primary-500" size={16} />
              Ubah Role
            </button>
          )}

          {/* Toggle Status */}
          {canToggleStatus && (
            <button
              onClick={() => handleAction(() => onToggleStatus(user))}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              {isUserActive ? (
                <>
                  <FiLock className="mr-3 text-orange-500" size={16} />
                  Nonaktifkan
                </>
              ) : (
                <>
                  <FiUnlock className="mr-3 text-green-500" size={16} />
                  Aktifkan
                </>
              )}
            </button>
          )}

          {/* Send Email */}
          {onSendEmail && user.email && (
            <button
              onClick={() => handleAction(() => onSendEmail(user))}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              <FiMail className="mr-3 text-blue-500" size={16} />
              Kirim Email
            </button>
          )}

          {/* Divider before dangerous actions */}
          {canDelete && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
          )}

          {/* Delete User - Only for other users and non-super-admin */}
          {canDelete && (
            <button
              onClick={() => handleAction(() => onDeleteUser(user))}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <FiTrash className="mr-3" size={16} />
              Hapus User
            </button>
          )}

          {/* Message for current user or restricted actions */}
          {(isCurrentUser || user.role === 'super_admin') && (
            <div className="px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700">
              {isCurrentUser 
                ? "Anda tidak dapat mengubah akun sendiri"
                : "Akun terlindungi dari perubahan"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserActionsDropdown;