// src/hooks/api/useUserOperations.ts
import { useState } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { User } from '@/types/user';

export const useUserOperations = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Base API call function
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) })
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Operation failed');
    }
    
    return data;
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await apiCall('/users');
      setUsers(result.data?.users || []);
      return result.data?.users || [];
    } catch (error) {
      showToast('Gagal memuat data pengguna', 'error');
      console.error('Fetch users error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Change user role
  const changeUserRole = async (userId: number, newRole: string): Promise<boolean> => {
    try {
      await apiCall(`/users/${userId}/change-role`, 'POST', { role: newRole });
      
      showToast(`Role berhasil diubah menjadi ${newRole}`, 'success');
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal mengubah role pengguna', 'error');
      console.error('Change role error:', error);
      return false;
    }
  };

  // Delete user
  const deleteUser = async (userId: number): Promise<boolean> => {
    try {
      await apiCall(`/users/${userId}`, 'DELETE');
      
      showToast('Pengguna berhasil dihapus', 'success');
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus pengguna', 'error');
      console.error('Delete user error:', error);
      return false;
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId: number, isActive: boolean): Promise<boolean> => {
    try {
      await apiCall(`/users/${userId}/toggle-status`, 'POST', { is_active: isActive });
      
      showToast(
        `Pengguna berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`, 
        'success'
      );
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_active: isActive } : user
        )
      );
      
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal mengubah status pengguna', 'error');
      console.error('Toggle status error:', error);
      return false;
    }
  };

  // Bulk change role
  const bulkChangeRole = async (userIds: number[], newRole: string): Promise<boolean> => {
    try {
      await apiCall('/users/bulk/change-role', 'POST', {
        user_ids: userIds,
        role: newRole
      });
      
      showToast(`Role ${userIds.length} pengguna berhasil diubah`, 'success');
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          userIds.includes(user.id) ? { ...user, role: newRole } : user
        )
      );
      
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal mengubah role pengguna', 'error');
      console.error('Bulk change role error:', error);
      return false;
    }
  };

  // Bulk delete users
  const bulkDeleteUsers = async (userIds: number[]): Promise<boolean> => {
    try {
      await apiCall('/users/bulk/delete', 'POST', { user_ids: userIds });
      
      showToast(`${userIds.length} pengguna berhasil dihapus`, 'success');
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => !userIds.includes(user.id)));
      
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus pengguna', 'error');
      console.error('Bulk delete error:', error);
      return false;
    }
  };

  // Search and filter utilities
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

  // Get user statistics summary
  const getUserStatsSummary = (userList: User[]) => {
    if (!Array.isArray(userList)) {
      return {
        total: 0,
        admins: 0,
        instructors: 0,
        students: 0,
        active: 0,
        inactive: 0,
      };
    }

    const validUsers = userList.filter(user => user != null);

    return {
      total: validUsers.length,
      admins: validUsers.filter(u => u?.role === 'admin').length,
      instructors: validUsers.filter(u => u?.role === 'instructor').length,
      students: validUsers.filter(u => u?.role === 'student').length,
      active: validUsers.filter(u => u?.is_active === true).length,
      inactive: validUsers.filter(u => u?.is_active === false).length,
    };
  };

  return {
    users,
    setUsers,
    isLoading,
    
    // Operations
    fetchUsers,
    changeUserRole,
    deleteUser,
    toggleUserStatus,
    
    // Bulk operations
    bulkChangeRole,
    bulkDeleteUsers,
    
    // Utilities
    filterUsers,
    getUserStatsSummary,
  };
};