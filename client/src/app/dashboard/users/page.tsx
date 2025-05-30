// src/app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import EmptyState from "@/components/ui/EmptyState";
import { 
  FiUsers, 
  FiAlertCircle, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus
} from "react-icons/fi";
import ChangeRoleModal from "../../../components/user/ChangeRoleModal";
import UserActionsDropdown from "../../../components/user/UserActionsDropdown";
import UserDetailModal from "../../../components/user/UserDetailModal";
import DeleteConfirmation from "../../../components/DeleteConfirmation";
import BulkActionsBar from "../../../components/user/BulkActionsBar";
import BulkConfirmationModal from "../../../components/user/BulkConfirmationModal";
import { User } from "@/types/user";

export default function UsersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bulkAction, setBulkAction] = useState<'changeRole' | 'delete'>('changeRole');
  const [bulkTargetRole, setBulkTargetRole] = useState<string>('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Filter users based on search and filters
    if (Array.isArray(users)) {
      const filtered = filterUsers(users, searchQuery, roleFilter, statusFilter);
      setFilteredUsers(filtered);
      
      // Clear selection if filtered results change
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setFilteredUsers([]);
    }
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data?.users || []);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data pengguna");
      showToast("Error loading users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  // Filter function
  const filterUsers = (
    allUsers: User[], 
    searchQuery: string, 
    roleFilter: string,
    statusFilter?: string
  ) => {
    if (!Array.isArray(allUsers)) {
      return [];
    }

    let filtered = allUsers.filter(user => user != null);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => {
        if (user.is_active === undefined) {
          return isActive === true;
        }
        return user.is_active === isActive;
      });
    }

    return filtered;
  };

  // Selection handlers
  const handleSelectUser = (userId: number) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
    setSelectAll(newSelection.size === filteredUsers.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      const allIds = filteredUsers.map(user => user.id);
      setSelectedUsers(new Set(allIds));
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
    setSelectAll(false);
  };

  // Individual actions
  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setIsChangeRoleModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = !user.is_active;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/toggle-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(
          `Pengguna berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`, 
          'success'
        );
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, is_active: newStatus } : u
          )
        );
      } else {
        showToast(data.message || 'Gagal mengubah status pengguna', 'error');
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      showToast('Terjadi kesalahan saat mengubah status pengguna', 'error');
    }
  };

  const handleSendEmail = (user: User) => {
    window.location.href = `mailto:${user.email}`;
  };

  // Bulk actions
  const handleBulkChangeRole = (role: string) => {
    setBulkAction('changeRole');
    setBulkTargetRole(role);
    setIsBulkConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setBulkAction('delete');
    setIsBulkConfirmOpen(true);
  };

  const confirmBulkAction = async () => {
    setIsBulkLoading(true);
    const userIds = Array.from(selectedUsers);
    
    try {
      const token = localStorage.getItem("accessToken");
      let response;
      
      if (bulkAction === 'changeRole') {
        response = await fetch('http://localhost:5000/api/users/bulk/change-role', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_ids: userIds,
            role: bulkTargetRole
          })
        });
      } else if (bulkAction === 'delete') {
        response = await fetch('http://localhost:5000/api/users/bulk/delete', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_ids: userIds })
        });
      }

      if (response) {
        const data = await response.json();
        
        if (response.ok && data.success) {
          if (bulkAction === 'changeRole') {
            showToast(`Role ${userIds.length} pengguna berhasil diubah`, 'success');
            // Update local state
            setUsers(prevUsers => 
              prevUsers.map(user => 
                userIds.includes(user.id) ? { ...user, role: bulkTargetRole } : user
              )
            );
          } else {
            showToast(`${userIds.length} pengguna berhasil dihapus`, 'success');
            // Update local state
            setUsers(prevUsers => prevUsers.filter(user => !userIds.includes(user.id)));
          }
          
          clearSelection();
          setIsBulkConfirmOpen(false);
        } else {
          showToast(data.message || 'Gagal melakukan operasi bulk', 'error');
        }
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      showToast('Terjadi kesalahan saat melakukan operasi bulk', 'error');
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Individual confirmations
  const confirmChangeRole = async (newRole: string) => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/change-role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(`Role berhasil diubah menjadi ${newRole}`, 'success');
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id ? { ...user, role: newRole } : user
          )
        );
        
        setIsChangeRoleModalOpen(false);
        setSelectedUser(null);
      } else {
        showToast(data.message || 'Gagal mengubah role pengguna', 'error');
      }
    } catch (error) {
      console.error("Change role error:", error);
      showToast('Terjadi kesalahan saat mengubah role', 'error');
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Pengguna berhasil dihapus', 'success');
        
        // Update local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
        
        setIsDeleteConfirmOpen(false);
        setSelectedUser(null);
      } else {
        showToast(data.message || 'Gagal menghapus pengguna', 'error');
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showToast('Terjadi kesalahan saat menghapus pengguna', 'error');
    }
  };

  // Utility functions
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "instructor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "instructor": return "Instruktur";
      case "student": return "Siswa";
      default: return role;
    }
  };

  // Stats calculation
  const stats = Array.isArray(users) ? {
    total: users.length,
    admins: users.filter(u => u?.role === 'admin').length,
    instructors: users.filter(u => u?.role === 'instructor').length,
    students: users.filter(u => u?.role === 'student').length,
    active: users.filter(u => u?.is_active === true).length,
    inactive: users.filter(u => u?.is_active === false).length,
  } : {
    total: 0,
    admins: 0,
    instructors: 0,
    students: 0,
    active: 0,
    inactive: 0,
  };

  if (isLoading && users.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <LoadingIndicator size="md" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Kelola semua pengguna pada platform
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FiDownload className="mr-2" size={16} />
              Export
            </Button>
            <Button size="sm">
              <FiPlus className="mr-2" size={16} />
              Tambah User
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-500 dark:bg-red-900/20">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter className="text-neutral-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instruktur</option>
                <option value="student">Siswa</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<FiUsers size={40} />}
            title="Tidak ada pengguna"
            description="Belum ada pengguna yang terdaftar atau sesuai dengan filter yang dipilih"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                      Departemen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 ${
                        selectedUsers.has(user.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar_url}
                                alt={user.full_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
                                <span className="text-primary-600 font-medium dark:text-primary-400">
                                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {user.full_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {user.email || 'No email'}
                            </div>
                            <div className="text-xs text-neutral-400 dark:text-neutral-500">
                              @{user.username || 'unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active !== false
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          {user.is_active !== false ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <UserActionsDropdown
                          user={user}
                          onChangeRole={handleChangeRole}
                          onDeleteUser={handleDeleteUser}
                          onViewDetails={handleViewDetails}
                          onToggleStatus={handleToggleStatus}
                          onSendEmail={handleSendEmail}
                          currentUserId={currentUser?.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.total}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Total
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.admins}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Admin
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.instructors}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Instruktur
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.students}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Siswa
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Aktif
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.inactive}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Nonaktif
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedUsers.size}
        onClearSelection={clearSelection}
        onBulkChangeRole={handleBulkChangeRole}
        onBulkDelete={handleBulkDelete}
        isVisible={selectedUsers.size > 0}
      />

      {/* Modals */}
      
      {/* User Detail Modal */}
      {isUserDetailModalOpen && selectedUser && (
        <UserDetailModal
          isOpen={isUserDetailModalOpen}
          onClose={() => {
            setIsUserDetailModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {/* Change Role Modal */}
      {isChangeRoleModalOpen && selectedUser && (
        <ChangeRoleModal
          isOpen={isChangeRoleModalOpen}
          onClose={() => {
            setIsChangeRoleModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={confirmChangeRole}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && selectedUser && (
        <DeleteConfirmation
          isOpen={isDeleteConfirmOpen}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmDeleteUser}
          title="Hapus Pengguna"
          message={`Apakah Anda yakin ingin menghapus pengguna "${selectedUser.full_name}"? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}

      {/* Bulk Confirmation Modal */}
      {isBulkConfirmOpen && (
        <BulkConfirmationModal
          isOpen={isBulkConfirmOpen}
          onClose={() => setIsBulkConfirmOpen(false)}
          onConfirm={confirmBulkAction}
          action={bulkAction}
          selectedCount={selectedUsers.size}
          targetRole={bulkTargetRole}
          isLoading={isBulkLoading}
        />
      )}
    </DashboardLayout>
  );
}