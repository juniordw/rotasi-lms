'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';
import { FiBook, FiClock, FiAward, FiBarChart2, FiPlay, FiMoreHorizontal } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Handle token expiration
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data.user);
        setEnrolledCourses(data.enrolledCourses || []);
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        showToast('Error loading dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, showToast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Selamat datang, {user.full_name}!</h1>
            <p className="text-primary-50">
              {user.role === 'student' ? 'Lanjutkan pembelajaran Anda hari ini' : 
               user.role === 'instructor' ? 'Kelola kursus dan pantau progress siswa Anda' : 
               'Akses panel admin dan kelola seluruh sistem'}
            </p>
          </div>
          <Button
            variant="ghost"
            className="border border-white bg-white/10 text-white hover:bg-white/20"
          >
            {user.role === 'student' ? 'Jelajahi Kursus' : 
             user.role === 'instructor' ? 'Buat Kursus Baru' : 
             'Lihat Laporan'}
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={<FiBook className="text-primary-400" />}
            title={user.role === 'student' ? 'Kursus Diikuti' : 'Kursus Dibuat'}
            value={enrolledCourses.length}
          />
          <StatCard 
            icon={<FiClock className="text-coral-400" />}
            title="Waktu Belajar"
            value="12 jam"
          />
          <StatCard 
            icon={<FiAward className="text-mint-400" />}
            title="Sertifikat"
            value="3"
          />
          <StatCard 
            icon={<FiBarChart2 className="text-amber-400" />}
            title="Progress"
            value="67%"
          />
        </div>

        {/* Courses Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {user.role === 'student' ? 'Kursus yang Diikuti' : 'Kursus yang Dikelola'}
            </h2>
            <Link href="/dashboard/courses">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.slice(0, 3).map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
              <FiBook size={40} className="mx-auto mb-4 text-neutral-400" />
              <h3 className="mb-2 text-lg font-medium">Belum ada kursus</h3>
              <p className="mb-4 text-neutral-500 dark:text-neutral-400">
                {user.role === 'student' 
                  ? 'Anda belum mengikuti kursus apapun. Jelajahi katalog kursus kami untuk mulai belajar.' 
                  : 'Anda belum membuat kursus apapun. Mulai buat kursus pertama Anda sekarang.'}
              </p>
              <Button>
                {user.role === 'student' ? 'Jelajahi Kursus' : 'Buat Kursus'}
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity / Notifications */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Aktivitas Terbaru</h2>
          {notifications.length > 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              {notifications.slice(0, 5).map((notification: any, index: number) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start justify-between p-4 ${
                    index !== notifications.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      {notification.type === 'course_completed' ? <FiAward /> : 
                       notification.type === 'certificate' ? <FiAward /> : 
                       notification.type === 'enrollment' ? <FiBook /> : <FiClock />}
                    </span>
                    <div>
                      <p className="text-neutral-700 dark:text-neutral-300">{notification.message}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary-400"></span>
                  )}
                </div>
              ))}
              <div className="border-t border-neutral-200 p-4 text-center dark:border-neutral-700">
                <Link href="/dashboard/notifications" className="text-sm text-primary-400 hover:text-primary-500">
                  Lihat semua notifikasi
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-neutral-600 dark:text-neutral-400">Belum ada aktivitas terbaru</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
        {icon}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const CourseCard = ({ course }: { course: any }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative h-36">
        <Image
          src={course.course.thumbnail_url || "/images/course-placeholder.jpg"}
          alt={course.course.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium">
              {course.completion_status === 'completed' ? 'Selesai' : 
               course.completion_status === 'in_progress' ? 'Sedang Dipelajari' : 'Belum Dimulai'}
            </span>
            <button className="rounded-full bg-white/90 p-1.5">
              <FiMoreHorizontal size={16} className="text-neutral-700" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 font-semibold line-clamp-2">{course.course.title}</h3>
        <div className="mb-3 flex items-center justify-between text-sm text-neutral-500">
          <span>Progress</span>
          <span>67%</span>
        </div>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div 
            className="h-full rounded-full bg-primary-400" 
            style={{ width: '67%' }}
          ></div>
        </div>
        <Button fullWidth className="flex items-center justify-center gap-2 rounded-lg">
          <FiPlay size={16} />
          Lanjutkan Belajar
        </Button>
      </div>
    </div>
  );
};