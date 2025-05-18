// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import {
  FiBook,
  FiClock,
  FiAward,
  FiBarChart2,
  FiPlay,
  FiMoreHorizontal,
  FiAlertCircle,
  FiEdit,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

type DashboardStats = {
  courseStats?: {
    totalEnrollments?: number;
    inProgressCourses?: number;
    completedCourses?: number;
    completionRate?: number;
    totalCourses?: number;
    publishedCourses?: number;
    draftCourses?: number;
    publishRate?: number;
  };
  certificateStats?: {
    totalCertificates?: number;
  };
  studyStats?: {
    totalStudyTimeMinutes?: number;
    totalStudyTimeHours?: number;
  };
  studentStats?: {
    totalStudents?: number;
  };
  userStats?: {
    totalUsers?: number;
    roleCount?: {
      admin?: number;
      instructor?: number;
      student?: number;
    };
  };
  enrollmentStats?: {
    totalEnrollments?: number;
    statusCount?: {
      not_started?: number;
      in_progress?: number;
      completed?: number;
    };
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({});
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        // Use auth user if available, otherwise fetch from API
        const userData = authUser
          ? { user: authUser }
          : await fetchUserData(token);
        if (!userData) return;

        setUser(userData.user);

        // Fetch additional dashboard data in parallel
        const [statsResponse, coursesResponse, notificationsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/users/stats/dashboard", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:5000/api/courses/enrolled", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:5000/api/notifications?limit=5", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        // Process stats response
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData.data || {});
        }

        // Process enrolled courses
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setEnrolledCourses(coursesData.data?.enrollments || []);
        }

        // Process notifications
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData.data?.notifications || []);
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError("Terjadi kesalahan saat memuat data dashboard");
        showToast("Error loading dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to fetch user data
    const fetchUserData = async (token: string) => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            router.push("/login");
            return null;
          }
          throw new Error("Failed to fetch user data");
        }

        return await response.json();
      } catch (error) {
        console.error("User data fetch error:", error);
        return null;
      }
    };

    fetchDashboardData();
  }, [router, showToast, authUser]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-full flex-col items-center justify-center p-6">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/20">
            <FiAlertCircle size={32} />
          </div>
          <h2 className="mb-2 text-xl font-bold">{error}</h2>
          <p className="mb-4 text-center text-neutral-600 dark:text-neutral-400">
            Silakan muat ulang halaman atau coba lagi nanti.
          </p>
          <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  // Helper function to determine button target based on user role
  const getPrimaryActionTarget = () => {
    if (user.role === "student") {
      return "/courses";
    } else if (user.role === "instructor") {
      return "/dashboard/courses/create";
    } else {
      return "/dashboard/reports";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Selamat datang, {user.full_name}!
            </h1>
            <p className="text-primary-50">
              {user.role === "student"
                ? "Lanjutkan pembelajaran Anda hari ini"
                : user.role === "instructor"
                  ? "Kelola kursus dan pantau progress siswa Anda"
                  : "Akses panel admin dan kelola seluruh sistem"}
            </p>
          </div>
          <Link href={getPrimaryActionTarget()}>
            <Button
              variant="ghost"
              className="border border-white bg-white/10 text-white hover:bg-white/20"
            >
              {user.role === "student"
                ? "Jelajahi Kursus"
                : user.role === "instructor"
                  ? "Buat Kursus Baru"
                  : "Lihat Laporan"}
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {user.role === "student" && (
            <>
              <StatCard
                icon={<FiBook className="text-primary-400" />}
                title="Kursus Diikuti"
                value={
                  dashboardStats.courseStats?.totalEnrollments ||
                  enrolledCourses.length ||
                  0
                }
              />
              <StatCard
                icon={<FiClock className="text-coral-400" />}
                title="Waktu Belajar"
                value={`${dashboardStats.studyStats?.totalStudyTimeHours || 0} jam`}
              />
              <StatCard
                icon={<FiAward className="text-mint-400" />}
                title="Sertifikat"
                value={dashboardStats.certificateStats?.totalCertificates || 0}
              />
              <StatCard
                icon={<FiBarChart2 className="text-amber-400" />}
                title="Progress"
                value={`${dashboardStats.courseStats?.completionRate || 0}%`}
              />
            </>
          )}

          {user.role === "instructor" && (
            <>
              <StatCard
                icon={<FiBook className="text-primary-400" />}
                title="Kursus Dibuat"
                value={dashboardStats.courseStats?.totalCourses || 0}
              />
              <StatCard
                icon={<FiBarChart2 className="text-coral-400" />}
                title="Kursus Dipublish"
                value={dashboardStats.courseStats?.publishedCourses || 0}
              />
              <StatCard
                icon={<FiUsers className="text-mint-400" />}
                title="Total Siswa"
                value={dashboardStats.studentStats?.totalStudents || 0}
              />
              <StatCard
                icon={<FiAward className="text-amber-400" />}
                title="Rate Penyelesaian"
                value={`${dashboardStats.courseStats?.completionRate || 0}%`}
              />
            </>
          )}

          {user.role === "admin" && (
            <>
              <StatCard
                icon={<FiUsers className="text-primary-400" />}
                title="Total Pengguna"
                value={dashboardStats.userStats?.totalUsers || 0}
              />
              <StatCard
                icon={<FiBook className="text-coral-400" />}
                title="Total Kursus"
                value={dashboardStats.courseStats?.totalCourses || 0}
              />
              <StatCard
                icon={<FiBarChart2 className="text-mint-400" />}
                title="Total Pendaftaran"
                value={dashboardStats.enrollmentStats?.totalEnrollments || 0}
              />
              <StatCard
                icon={<FiAward className="text-amber-400" />}
                title="Instruktur"
                value={dashboardStats.userStats?.roleCount?.instructor || 0}
              />
            </>
          )}
        </div>

        {/* Courses Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {user.role === "student"
                ? "Kursus yang Diikuti"
                : "Kursus yang Dikelola"}
            </h2>
            <Link href="/dashboard/courses">
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.slice(0, 3).map((course: any) => (
                <CourseCard
                  key={course.id || course.course_id}
                  course={course}
                  userRole={user.role}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
              <FiBook size={40} className="mx-auto mb-4 text-neutral-400" />
              <h3 className="mb-2 text-lg font-medium">Belum ada kursus</h3>
              <p className="mb-4 text-neutral-500 dark:text-neutral-400">
                {user.role === "student"
                  ? "Anda belum mengikuti kursus apapun. Jelajahi katalog kursus kami untuk mulai belajar."
                  : "Anda belum membuat kursus apapun. Mulai buat kursus pertama Anda sekarang."}
              </p>
              <Link
                href={
                  user.role === "student"
                    ? "/courses"
                    : "/dashboard/courses/create"
                }
              >
                <Button>
                  {user.role === "student" ? "Jelajahi Kursus" : "Buat Kursus"}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity / Notifications */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Aktivitas Terbaru</h2>
          {notifications.length > 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              {notifications
                .slice(0, 5)
                .map((notification: any, index: number) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between p-4 ${
                      index !== notifications.length - 1
                        ? "border-b border-neutral-200 dark:border-neutral-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-primary-600 dark:bg-neutral-700 dark:text-primary-400">
                        {notification.type === "course_completed" ? (
                          <FiAward />
                        ) : notification.type === "certificate" ? (
                          <FiAward />
                        ) : notification.type === "enrollment" ? (
                          <FiBook />
                        ) : (
                          <FiClock />
                        )}
                      </span>
                      <div>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(notification.created_at).toLocaleString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary-400"></span>
                    )}
                  </div>
                ))}
              <div className="border-t border-neutral-200 p-4 text-center dark:border-neutral-700">
                <Link
                  href="/dashboard/notifications"
                  className="text-sm text-primary-400 hover:text-primary-500"
                >
                  Lihat semua notifikasi
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-neutral-600 dark:text-neutral-400">
                Belum ada aktivitas terbaru
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) => {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
        {icon}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Course Card Component
const CourseCard = ({
  course,
  userRole,
}: {
  course: any;
  userRole: string;
}) => {
  // Handle different course data structure based on role
  const courseData = course.course || course;
  const progressPercentage =
    userRole === "student" ? course.progress_percentage || 0 : null;
  const getLessonId = () => {
    if (course.last_accessed_lesson) {
      return course.last_accessed_lesson;
    }

    if (courseData.modules && courseData.modules.length > 0) {
      const firstModule = courseData.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        return firstModule.lessons[0].id;
      }
    }

    return 0;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative h-36">
        <Image
          src={courseData.thumbnail_url || "/images/course-placeholder.jpg"}
          alt={courseData.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-neutral-800">
              {course.completion_status === "completed"
                ? "Selesai"
                : course.completion_status === "in_progress"
                  ? "Sedang Dipelajari"
                  : "Belum Dimulai"}
            </span>
            <button className="rounded-full bg-white/90 p-1.5">
              <FiMoreHorizontal size={16} className="text-neutral-700" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 font-semibold line-clamp-2">{courseData.title}</h3>

        {userRole === "student" && typeof progressPercentage === "number" && (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-neutral-500">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-primary-400"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </>
        )}

        {userRole === "student" ? (
          <Link
            href={`/dashboard/courses/${course.course_id || courseData.id}/learn/${getLessonId()}`}
          >
            <Button
              fullWidth
              className="flex items-center justify-center gap-2 rounded-lg"
            >
              <FiPlay size={16} />
              {course.completion_status === "not_started"
                ? "Mulai Belajar"
                : "Lanjutkan Belajar"}
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/courses/${courseData.id}/manage`}>
            <Button
              fullWidth
              className="flex items-center justify-center gap-2 rounded-lg"
            >
              <FiEdit size={16} />
              Kelola Kursus
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

// Add the missing FiUsers import
import { FiUsers } from "react-icons/fi";
