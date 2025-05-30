// src/components/user/UserDetailModal.tsx
import { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiBriefcase, FiCalendar, FiClock, FiBook, FiAward } from "react-icons/fi";
import Button from "@/components/ui/Button";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useApi } from "@/hooks/api/useApi";

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

type UserStats = {
  totalCourses?: number;
  completedCourses?: number;
  enrolledStudents?: number;
  totalLessons?: number;
  certificatesEarned?: number;
  studyTimeHours?: number;
};

type UserDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
};

const UserDetailModal = ({ isOpen, onClose, user }: UserDetailModalProps) => {
  const { fetchData, isLoading } = useApi();
  const [userStats, setUserStats] = useState<UserStats>({});

  useEffect(() => {
    if (isOpen && user) {
      fetchUserStats();
    }
  }, [isOpen, user]);

  const fetchUserStats = async () => {
    try {
      const result = await fetchData(`/users/${user.id}/stats`);
      if (result?.success) {
        setUserStats(result.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  if (!isOpen) return null;

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
      case "admin":
        return "Admin";
      case "instructor":
        return "Instruktur";
      case "student":
        return "Siswa";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-neutral-800 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <h2 className="text-xl font-bold">Detail Pengguna</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {/* User Profile */}
          <div className="mb-6 flex items-center">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  className="h-20 w-20 rounded-full object-cover"
                  src={user.avatar_url}
                  alt={user.full_name}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <span className="text-2xl font-medium text-primary-600 dark:text-primary-400">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {user.full_name}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">@{user.username}</p>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
                {user.is_active !== undefined && (
                  <span className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    user.is_active 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}>
                    {user.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-center mb-2">
                <FiMail className="mr-2 text-neutral-500" size={16} />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">{user.email}</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-center mb-2">
                <FiBriefcase className="mr-2 text-neutral-500" size={16} />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Departemen</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">{user.department || 'Belum diatur'}</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-center mb-2">
                <FiCalendar className="mr-2 text-neutral-500" size={16} />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Bergabung</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">{formatDate(user.created_at)}</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-center mb-2">
                <FiClock className="mr-2 text-neutral-500" size={16} />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Login Terakhir</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">
                {user.last_login ? formatDate(user.last_login) : 'Belum pernah login'}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h4 className="mb-4 text-lg font-semibold">Statistik</h4>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingIndicator size="md" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {user.role === 'student' && (
                  <>
                    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                      <FiBook className="mx-auto mb-2 text-primary-500" size={24} />
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {userStats.totalCourses || 0}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Kursus Diikuti</div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                      <FiAward className="mx-auto mb-2 text-green-500" size={24} />
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {userStats.completedCourses || 0}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Kursus Selesai</div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                      <FiClock className="mx-auto mb-2 text-blue-500" size={24} />
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {userStats.studyTimeHours || 0}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Jam Belajar</div>
                    </div>
                  </>
                )}

                {user.role === 'instructor' && (
                  <>
                    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                      <FiBook className="mx-auto mb-2 text-primary-500" size={24} />
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {userStats.totalCourses || 0}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Kursus Dibuat</div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                      <FiUser className="mx-auto mb-2 text-green-500" size={24} />
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {userStats.enrolledStudents || 0}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Siswa</div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-800">
                      <FiBook className="mx-auto mb-2 text-blue-500" size={24} />
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {userStats.totalLessons || 0}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Materi</div>
                    </div>
                  </>
                )}

                {user.role === 'admin' && (
                  <div className="col-span-2 md:col-span-3">
                    <div className="rounded-lg border border-neutral-200 bg-gradient-to-r from-primary-50 to-primary-100 p-6 text-center dark:border-neutral-700 dark:from-primary-900/20 dark:to-primary-800/20">
                      <FiUser className="mx-auto mb-2 text-primary-500" size={32} />
                      <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                        Administrator
                      </div>
                      <div className="text-sm text-primary-700 dark:text-primary-300">
                        Memiliki akses penuh ke seluruh sistem
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;