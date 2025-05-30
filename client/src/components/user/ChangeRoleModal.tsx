// src/components/user/ChangeRoleModal.tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FiX, FiUser, FiShield, FiBook, FiAlertTriangle } from "react-icons/fi";

type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  department: string;
  avatar_url?: string;
};

type ChangeRoleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: (newRole: string) => Promise<void>;
};

const ChangeRoleModal = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}: ChangeRoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const roles = [
    {
      value: "student",
      label: "Siswa",
      description: "Dapat mengakses dan mengikuti kursus",
      icon: <FiUser className="text-green-500" />,
      color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
    },
    {
      value: "instructor",
      label: "Instruktur",
      description: "Dapat membuat dan mengelola kursus",
      icon: <FiBook className="text-blue-500" />,
      color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
    },
    {
      value: "admin",
      label: "Admin",
      description: "Akses penuh ke seluruh sistem",
      icon: <FiShield className="text-red-500" />,
      color: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
    }
  ];

  const handleConfirm = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(selectedRole);
      // Modal will be closed by parent component on success
    } catch (error) {
      console.error("Error changing role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Ubah Role Pengguna</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            <FiX />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={user.avatar_url}
                alt={user.full_name}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user.full_name}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {user.email}
            </div>
            <div className="text-xs text-neutral-400 dark:text-neutral-500">
              Role saat ini: <span className="font-medium">{getRoleDisplayName(user.role)}</span>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Pilih Role Baru
          </label>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selectedRole === role.value
                    ? `${role.color} border-opacity-100`
                    : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
                }`}
                onClick={() => !isLoading && setSelectedRole(role.value)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => !isLoading && setSelectedRole(e.target.value)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-800">
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {role.label}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {role.description}
                    </div>
                  </div>
                  {selectedRole === role.value && (
                    <div className="ml-2 h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        {selectedRole !== user.role && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Perhatian:</strong> Mengubah role akan mempengaruhi akses dan izin pengguna dalam sistem.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
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
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || selectedRole === user.role}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Mengubah...
              </div>
            ) : selectedRole === user.role ? (
              "Role Sama"
            ) : (
              "Ubah Role"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal;