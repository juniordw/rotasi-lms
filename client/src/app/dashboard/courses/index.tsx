"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { FiSearch, FiFilter, FiGrid, FiList, FiPlus, FiClock, FiUsers, FiBarChart2, FiBook } from "react-icons/fi";

export default function CoursesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all"); // all, in-progress, completed

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch user data to determine role
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Endpoint depends on user role
        const endpoint = 
          userData.user.role === "student"
            ? "http://localhost:5000/api/courses/enrolled"
            : userData.user.role === "instructor"
            ? "http://localhost:5000/api/courses/instructor"
            : "http://localhost:5000/api/courses";

        const coursesResponse = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData.data || []);
      } catch (error) {
        console.error("Courses fetch error:", error);
        showToast("Error loading courses", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [router, showToast]);

  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    return course.completion_status === filter;
  });

  // Handler for creating a new course (instructor/admin only)
  const handleCreateCourse = () => {
    router.push("/dashboard/courses/create");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {user?.role === "student"
                ? "Kursus Saya"
                : user?.role === "instructor"
                ? "Kursus yang Saya Kelola"
                : "Semua Kursus"}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {user?.role === "student"
                ? "Daftar kursus yang Anda ikuti"
                : user?.role === "instructor"
                ? "Kelola kursus yang Anda buat"
                : "Kelola semua kursus pada platform"}
            </p>
          </div>

          {/* Action buttons based on role */}
          {user?.role !== "student" && (
            <Button onClick={handleCreateCourse} className="flex items-center gap-2">
              <FiPlus />
              Buat Kursus Baru
            </Button>
          )}
        </div>

        {/* Filters and search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm ${
                  filter === "all" 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={`px-4 py-2 text-sm ${
                  filter === "in_progress" 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                Sedang Dipelajari
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 text-sm ${
                  filter === "completed" 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                Selesai
              </button>
            </div>
            
            <button className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
              <FiFilter size={16} />
              <span className="text-sm">Filter</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kursus..."
                className="pl-9 pr-4 py-2 rounded-lg border border-neutral-200 w-full dark:border-neutral-700 dark:bg-neutral-800"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
            
            <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid" 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list" 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Course list */}
        {filteredCourses.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
          }>
            {filteredCourses.map((course) => (
              viewMode === "grid" ? (
                <CourseCard 
                  key={course.id || course.course_id} 
                  course={course} 
                  userRole={user?.role} 
                />
              ) : (
                <CourseListItem 
                  key={course.id || course.course_id} 
                  course={course} 
                  userRole={user?.role} 
                />
              )
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800/30">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <FiBook size={24} className="text-neutral-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Tidak ada kursus</h3>
            <p className="mb-6 max-w-md text-neutral-600 dark:text-neutral-400">
              {user?.role === "student"
                ? "Anda belum terdaftar pada kursus apapun. Jelajahi katalog kursus untuk memulai pembelajaran."
                : "Anda belum membuat kursus apapun. Mulai buat kursus pertama Anda sekarang."}
            </p>
            {user?.role === "student" ? (
              <Link href="/courses">
                <Button>Jelajahi Kursus</Button>
              </Link>
            ) : (
              <Button onClick={handleCreateCourse}>Buat Kursus</Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const CourseCard = ({ course, userRole }: { course: any; userRole: string }) => {
  // Handle different course data structure based on role
  const courseData = course.course || course;
  const progressPercentage = userRole === "student" ? (course.progress_percentage || 0) : null;
  
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative h-40">
        <Image
          src={courseData.thumbnail_url || "/images/course-placeholder.jpg"}
          alt={courseData.title}
          fill
          className="object-cover"
        />
        {userRole === "student" && (
          <div className="absolute top-2 right-2">
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
              course.completion_status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : course.completion_status === "in_progress"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
            }`}>
              {course.completion_status === "completed"
                ? "Selesai"
                : course.completion_status === "in_progress"
                ? "Sedang Dipelajari"
                : "Belum Dimulai"}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="mb-2 font-semibold line-clamp-2">{courseData.title}</h3>
        
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center text-neutral-500 dark:text-neutral-400">
            <FiClock className="mr-1" />
            {courseData.duration_hours || 0} jam
          </span>
          
          <span className="flex items-center text-neutral-500 dark:text-neutral-400">
            <FiUsers className="mr-1" />
            {courseData.enrollmentCount || courseData.enrollment_count || 0} siswa
          </span>
          
          <span className="flex items-center text-neutral-500 dark:text-neutral-400">
            <FiBarChart2 className="mr-1" />
            {courseData.level || "Pemula"}
          </span>
        </div>
        
        {userRole === "student" && typeof progressPercentage === "number" && (
          <>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-primary-400"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </>
        )}

        <Link href={userRole === "student" 
          ? `/dashboard/courses/${course.course_id || courseData.id}` 
          : `/dashboard/courses/${courseData.id}/manage`
        }>
          <Button 
            variant="primary" 
            fullWidth 
            className="rounded-lg"
          >
            {userRole === "student" 
              ? course.completion_status === "not_started" 
                ? "Mulai Belajar" 
                : "Lanjutkan Belajar"
              : "Kelola Kursus"
            }
          </Button>
        </Link>
      </div>
    </div>
  );
};

const CourseListItem = ({ course, userRole }: { course: any; userRole: string }) => {
  // Handle different course data structure based on role
  const courseData = course.course || course;
  const progressPercentage = userRole === "student" ? (course.progress_percentage || 0) : null;
  
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 sm:flex-row">
      <div className="relative h-40 w-full sm:h-auto sm:w-48">
        <Image
          src={courseData.thumbnail_url || "/images/course-placeholder.jpg"}
          alt={courseData.title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{courseData.title}</h3>
            {userRole === "student" && (
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                course.completion_status === "completed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : course.completion_status === "in_progress"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
              }`}>
                {course.completion_status === "completed"
                  ? "Selesai"
                  : course.completion_status === "in_progress"
                  ? "Sedang Dipelajari"
                  : "Belum Dimulai"}
              </span>
            )}
          </div>
          
          <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {courseData.description}
          </p>
          
          <div className="mb-4 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center text-neutral-500 dark:text-neutral-400">
              <FiClock className="mr-1" />
              {courseData.duration_hours || 0} jam
            </span>
            
            <span className="flex items-center text-neutral-500 dark:text-neutral-400">
              <FiUsers className="mr-1" />
              {courseData.enrollmentCount || courseData.enrollment_count || 0} siswa
            </span>
            
            <span className="flex items-center text-neutral-500 dark:text-neutral-400">
              <FiBarChart2 className="mr-1" />
              {courseData.level || "Pemula"}
            </span>
          </div>
          
          {userRole === "student" && typeof progressPercentage === "number" && (
            <>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-primary-400"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </>
          )}
        </div>
        
        <Link href={userRole === "student" 
          ? `/dashboard/courses/${course.course_id || courseData.id}` 
          : `/dashboard/courses/${courseData.id}/manage`
        }>
          <Button 
            variant="primary" 
            className="rounded-lg w-full sm:w-auto"
          >
            {userRole === "student" 
              ? course.completion_status === "not_started" 
                ? "Mulai Belajar" 
                : "Lanjutkan Belajar"
              : "Kelola Kursus"
            }
          </Button>
        </Link>
      </div>
    </div>
  );
};