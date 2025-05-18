"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import {
  FiClock,
  FiUsers,
  FiBarChart2,
  FiCheckCircle,
  FiUser,
  FiLayers,
  FiPlay,
} from "react-icons/fi";

export default function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/courses/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course data");
        }

        const data = await response.json();
        setCourse(data.data);

        // Check if user is authenticated
        const token = localStorage.getItem("accessToken");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Course data fetch error:", error);
        showToast("Error loading course data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id, showToast]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setIsEnrolling(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/courses/${params.id}/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("Berhasil mendaftar ke kursus!", "success");
        router.push(`/dashboard/courses/${params.id}`);
      } else {
        showToast(data.message || "Gagal mendaftar ke kursus", "error");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      showToast("Terjadi kesalahan saat mendaftar", "error");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center md:px-8">
          <h1 className="mb-4 text-2xl font-bold">Kursus tidak ditemukan</h1>
          <p className="mb-8">
            Kursus yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link href="/courses">
            <Button>Jelajahi Kursus Lainnya</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12 dark:from-neutral-800 dark:to-neutral-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h1 className="mb-4 font-poppins text-3xl font-bold md:text-4xl">
                {course.title}
              </h1>
              <p className="mb-6 text-lg text-neutral-600 dark:text-neutral-300">
                {course.description}
              </p>

              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <FiUser className="mr-1" />
                  <span>
                    Instruktur:{" "}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {course.instructor.full_name}
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <FiClock className="mr-1" />
                  <span>
                    Durasi:{" "}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {course.duration_hours || 0} jam
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <FiUsers className="mr-1" />
                  <span>
                    Siswa:{" "}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {course.enrollmentCount || 0}
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <FiBarChart2 className="mr-1" />
                  <span>
                    Level:{" "}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {course.level || "Pemula"}
                    </span>
                  </span>
                </div>
              </div>

              {course.enrollmentStatus?.enrolled ? (
                <Link href={`/dashboard/courses/${course.id}`}>
                  <Button size="lg" className="rounded-xl">
                    <FiPlay className="mr-2" /> Lanjutkan Belajar
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="rounded-xl"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? "Mendaftar..." : "Daftar Kursus"}
                </Button>
              )}
            </div>

            <div className="relative h-64 overflow-hidden rounded-xl shadow-lg sm:h-80 lg:h-96">
              <Image
                src={course.thumbnail_url || "/images/course-placeholder.jpg"}
                alt={course.title}
                className="h-full w-full object-cover"
                fill
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-wrap">
              <button
                onClick={() => setActiveTab("overview")}
                className={`mr-8 border-b-2 px-1 pb-4 text-sm font-medium sm:text-base ${
                  activeTab === "overview"
                    ? "border-primary-400 text-primary-500"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                }`}
              >
                Ikhtisar
              </button>
              <button
                onClick={() => setActiveTab("curriculum")}
                className={`mr-8 border-b-2 px-1 pb-4 text-sm font-medium sm:text-base ${
                  activeTab === "curriculum"
                    ? "border-primary-400 text-primary-500"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                }`}
              >
                Materi Kursus
              </button>
              <button
                onClick={() => setActiveTab("instructor")}
                className={`mr-8 border-b-2 px-1 pb-4 text-sm font-medium sm:text-base ${
                  activeTab === "instructor"
                    ? "border-primary-400 text-primary-500"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                }`}
              >
                Instruktur
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-4 text-2xl font-bold">Tentang Kursus</h2>
                <div className="prose max-w-none dark:prose-invert">
                  <p>{course.description}</p>
                </div>

                <h3 className="mb-3 mt-8 text-xl font-bold">
                  Apa yang akan Anda pelajari
                </h3>
                <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                  {course.modules &&
                    course.modules.slice(0, 4).map((module: any) => (
                      <li key={module.id} className="flex items-start">
                        <FiCheckCircle className="mr-2 mt-1 text-primary-400" />
                        <span>{module.title}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                  <h3 className="mb-4 text-lg font-semibold">
                    Kursus ini mencakup:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <FiClock className="mr-2 text-primary-400" />
                      <span>{course.duration_hours || 0} jam konten video</span>
                    </li>
                    <li className="flex items-center">
                      <FiLayers className="mr-2 text-primary-400" />
                      <span>{course.modules?.length || 0} modul</span>
                    </li>
                    <li className="flex items-center">
                      <FiBarChart2 className="mr-2 text-primary-400" />
                      <span>Level {course.level || "Pemula"}</span>
                    </li>
                    <li className="flex items-center">
                      <FiUsers className="mr-2 text-primary-400" />
                      <span>{course.enrollmentCount || 0} siswa terdaftar</span>
                    </li>
                  </ul>

                  <div className="mt-6">
                    {course.enrollmentStatus?.enrolled ? (
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Button
                          variant="primary"
                          fullWidth
                          className="rounded-lg"
                        >
                          <FiPlay className="mr-2" /> Lanjutkan Belajar
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        className="rounded-lg"
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? "Mendaftar..." : "Daftar Kursus"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">Materi Kursus</h2>

              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module: any, index: number) => (
                    <div
                      key={module.id}
                      className="rounded-lg border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                        <h3 className="font-semibold">
                          Modul {index + 1}: {module.title}
                        </h3>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {module.lessons?.length || 0} materi
                        </span>
                      </div>

                      {module.lessons && module.lessons.length > 0 ? (
                        <ul>
                          {module.lessons.map(
                            (lesson: any, lessonIndex: number) => (
                              <li
                                key={lesson.id}
                                className={`border-b border-neutral-200 p-4 last:border-b-0 dark:border-neutral-700 ${
                                  lessonIndex % 2 !== 0
                                    ? "bg-neutral-50 dark:bg-neutral-800/30"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {lesson.content_type === "video" && (
                                      <FiPlay className="mr-2 text-primary-400" />
                                    )}
                                    {lesson.content_type === "quiz" && (
                                      <FiBarChart2 className="mr-2 text-coral-400" />
                                    )}
                                    {lesson.content_type === "article" && (
                                      <FiLayers className="mr-2 text-mint-400" />
                                    )}
                                    <span>{lesson.title}</span>
                                  </div>
                                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {lesson.duration_minutes} menit
                                  </span>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="p-4 text-neutral-500 dark:text-neutral-400">
                          Tidak ada materi dalam modul ini
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400">
                  Tidak ada materi yang tersedia untuk kursus ini
                </p>
              )}
            </div>
          )}

          {activeTab === "instructor" && (
            <div>
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
                <div className="h-24 w-24 overflow-hidden rounded-full">
                  <Image
                    src={
                      course.instructor.avatar_url ||
                      "/images/avatar-placeholder.jpg"
                    }
                    alt={course.instructor.full_name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    {course.instructor.full_name}
                  </h2>
                  <p className="mb-4 text-neutral-600 dark:text-neutral-300">
                    {course.instructor.role === "instructor"
                      ? "Instruktur"
                      : "Admin"}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam in metus euismod, elementum nunc vel, feugiat magna.
                    Suspendisse potenti. In ut lectus nec nisi malesuada varius
                    ac ut diam.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Courses Section */}
      <section className="bg-neutral-50 py-12 dark:bg-neutral-800/30">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="mb-8 text-2xl font-bold">Kursus Serupa</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md dark:bg-neutral-800"
              >
                <div className="relative h-40">
                  <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">Kursus Placeholder</h3>
                  <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                  <Button variant="outline" fullWidth>
                    Lihat Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
