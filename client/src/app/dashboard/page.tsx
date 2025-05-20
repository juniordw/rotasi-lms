// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import CourseCard from "@/components/course/CourseCard";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import NotificationList from "@/components/notifications/NotificationList";
import FadeIn from "@/components/animation/FadeIn";
import { useDashboardData } from "@/hooks/api/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiBook,
  FiClock,
  FiAward,
  FiBarChart2,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user: authUser } = useAuth();

  // Use custom hook for fetching dashboard data
  const { 
    user, 
    dashboardStats, 
    enrolledCourses, 
    notifications, 
    isLoading, 
    error,
    refetchDashboardData 
  } = useDashboardData(authUser);

  // Helper function to determine button target based on user role
  const getPrimaryActionTarget = () => {
    if (!user) return "/";
    
    if (user.role === "student") {
      return "/courses";
    } else if (user.role === "instructor") {
      return "/dashboard/courses/create";
    } else {
      return "/dashboard/reports";
    }
  };

  if (isLoading) {
    return <PageLoader message="Memuat dashboard..." />;
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

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Welcome Banner */}
        <FadeIn>
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
        </FadeIn>

        {/* Stats Section */}
        <FadeIn delay={0.1}>
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
        </FadeIn>

        {/* Courses Section */}
        <FadeIn delay={0.2}>
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
                {enrolledCourses.slice(0, 3).map((course) => (
                  <CourseCard
                    key={course.id || course.course_id}
                    course={course}
                    userRole={user.role}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FiBook size={40} />}
                title="Belum ada kursus"
                description={
                  user.role === "student"
                    ? "Anda belum mengikuti kursus apapun. Jelajahi katalog kursus kami untuk mulai belajar."
                    : "Anda belum membuat kursus apapun. Mulai buat kursus pertama Anda sekarang."
                }
                actionLabel={user.role === "student" ? "Jelajahi Kursus" : "Buat Kursus"}
                actionLink={
                  user.role === "student"
                    ? "/courses"
                    : "/dashboard/courses/create"
                }
              />
            )}
          </div>
        </FadeIn>

        {/* Recent Activity / Notifications */}
        <FadeIn delay={0.3}>
          <div>
            <h2 className="mb-4 text-xl font-bold">Aktivitas Terbaru</h2>
            <NotificationList 
              notifications={notifications} 
              emptyMessage="Belum ada aktivitas terbaru" 
            />
          </div>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}