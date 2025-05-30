// src/components/user/BulkActionsBar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import { FiTrash, FiEdit, FiX, FiUsers, FiChevronDown } from "react-icons/fi";

type BulkActionsBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkChangeRole: (role: string) => void;
  onBulkDelete: () => void;
  isVisible: boolean;
};

const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkChangeRole,
  onBulkDelete,
  isVisible
}: BulkActionsBarProps) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };

    if (showRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

  if (!isVisible) return null;

  const roles = [
    { value: 'student', label: 'Siswa', color: 'text-green-600' },
    { value: 'instructor', label: 'Instruktur', color: 'text-blue-600' },
    { value: 'admin', label: 'Admin', color: 'text-red-600' }
  ];

  const handleRoleChange = (role: string) => {
    onBulkChangeRole(role);
    setShowRoleDropdown(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-white rounded-lg shadow-lg border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FiUsers className="text-primary-500" size={20} />
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {selectedCount} pengguna terpilih
            </span>
          </div>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

          <div className="flex items-center gap-2">
            {/* Change Role Button */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2"
              >
                <FiEdit size={16} />
                Ubah Role
                <FiChevronDown size={14} className={`transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {showRoleDropdown && (
                <div className="absolute bottom-full mb-2 left-0 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 py-1 z-40">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleRoleChange(role.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${role.color}`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              <FiTrash size={16} />
              Hapus
            </Button>

            {/* Clear Selection Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="flex items-center gap-2"
            >
              <FiX size={16} />
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;