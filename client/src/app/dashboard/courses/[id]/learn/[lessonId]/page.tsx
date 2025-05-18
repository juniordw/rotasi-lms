"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiList,
  FiVideo,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";
// Import interface
import { Course, Lesson, Module } from "@/types/course";

export default function CourseLearningPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();

  // Terapkan tipe ke state
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch course data
        const courseResponse = await fetch(
          `http://localhost:5000/api/courses/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course data");
        }

        const courseData = await courseResponse.json();
        setCourse(courseData.data as Course);

        // Fetch modules dan lessons
        const modulesResponse = await fetch(
          `http://localhost:5000/api/courses/${params.id}/modules`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!modulesResponse.ok) {
          throw new Error("Failed to fetch modules data");
        }

        const modulesData = await modulesResponse.json();
        setModules(modulesData.data as Module[]);

        // Fetch current lesson
        const lessonResponse = await fetch(
          `http://localhost:5000/api/lessons/${params.lessonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!lessonResponse.ok) {
          throw new Error("Failed to fetch lesson data");
        }

        const lessonData = await lessonResponse.json();
        setCurrentLesson(lessonData.data as Lesson);

        // Calculate progress
        if (
          courseData.data.enrollmentStatus &&
          courseData.data.enrollmentStatus.enrolled
        ) {
          setProgress(33); // Example progress percentage
        }
      } catch (error) {
        console.error("Course data fetch error:", error);
        showToast("Error loading course content", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id, params.lessonId, router, showToast]);

  const handleCompleteLesson = async (): Promise<void> => {
    try {
      setIsCompleting(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/lessons/${params.lessonId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            time_spent_minutes: 10,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("Materi berhasil ditandai selesai!", "success");

        const nextLesson = findNextLesson();
        if (nextLesson) {
          router.push(`/dashboard/courses/${params.id}/learn/${nextLesson.id}`);
        } else {
          router.push(`/dashboard/courses/${params.id}`);
        }
      } else {
        showToast(data.message || "Gagal menyelesaikan materi", "error");
      }
    } catch (error) {
      console.error("Complete lesson error:", error);
      showToast("Terjadi kesalahan saat menyelesaikan materi", "error");
    } finally {
      setIsCompleting(false);
    }
  };

  const findNextLesson = (): Lesson | null => {
    // Flatten all lessons from all modules
    const allLessons: Lesson[] = [];
    modules.forEach((module: Module) => {
      if (module.lessons) {
        module.lessons.forEach((lesson: Lesson) => {
          allLessons.push({
            ...lesson,
            moduleTitle: module.title, // Tambahkan tipe ini ke interface Lesson jika dibutuhkan
          } as Lesson);
        });
      }
    });

    // Find the index of the current lesson
    const currentIndex = allLessons.findIndex(
      (lesson: Lesson) => lesson.id === parseInt(params.lessonId)
    );

    // Return the next lesson if exists
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }

    return null;
  };

  const findPreviousLesson = () => {
    // Similar to findNextLesson
    const allLessons: any[] = [];
    modules.forEach((module: any) => {
      if (module.lessons) {
        module.lessons.forEach((lesson: any) => {
          allLessons.push({
            ...lesson,
            moduleTitle: module.title,
          });
        });
      }
    });

    const currentIndex = allLessons.findIndex(
      (lesson: any) => lesson.id === parseInt(params.lessonId)
    );

    if (currentIndex > 0) {
      return allLessons[currentIndex - 1];
    }

    return null;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course || !currentLesson) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-16 text-center md:px-8">
          <h1 className="mb-4 text-2xl font-bold">Materi tidak ditemukan</h1>
          <p className="mb-8">
            Materi yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link href="/dashboard/courses">
            <Button>Kembali ke Kursus</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Course Header */}
        <header className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={`/dashboard/courses/${params.id}`}
                className="mr-4 text-neutral-500 hover:text-primary-500 dark:text-neutral-400"
              >
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-bold truncate">{course.title}</h1>
                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="mr-2">Progress:</span>
                  <div className="w-32 h-2 bg-neutral-200 rounded-full dark:bg-neutral-700">
                    <div
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{progress}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              <FiList className="mr-2" /> Materi
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">
                  {currentLesson.title}
                </h2>

                {/* Content based on type */}
                <div className="mb-8">
                  {currentLesson.content_type === "video" && (
                    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden mb-4 bg-neutral-200 dark:bg-neutral-700">
                      {currentLesson.content_url ? (
                        <iframe
                          src={currentLesson.content_url}
                          className="absolute top-0 left-0 w-full h-full"
                          allowFullScreen
                          title={currentLesson.title}
                        ></iframe>
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-neutral-500">
                          <FiVideo size={40} />
                          <span className="ml-2">Video tidak tersedia</span>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson.content_type === "article" && (
                    <div className="prose max-w-none dark:prose-invert">
                      {currentLesson.content_text ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: currentLesson.content_text,
                          }}
                        ></div>
                      ) : (
                        <div className="flex items-center justify-center p-8 text-neutral-500 border border-dashed border-neutral-300 rounded-lg dark:border-neutral-700">
                          <FiFileText size={24} />
                          <span className="ml-2">
                            Konten artikel tidak tersedia
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson.content_type === "quiz" && (
                    <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-neutral-800">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 dark:bg-primary-900/30">
                          <FiHelpCircle size={24} />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold">
                            Quiz: {currentLesson.title}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            <FiClock className="inline mr-1" />
                            {currentLesson.quiz?.time_limit_minutes || 30} menit
                          </p>
                        </div>
                      </div>
                      <p className="mb-4">
                        Tes pemahaman Anda tentang materi yang telah dipelajari
                        dalam bagian ini.
                      </p>
                      <Link
                        href={`/dashboard/courses/${params.id}/quiz/${currentLesson.quiz?.id || 0}`}
                      >
                        <Button>Mulai Quiz</Button>
                      </Link>
                    </div>
                  )}

                  {/* Other content types can be handled here */}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  {findPreviousLesson() ? (
                    <Link
                      href={`/dashboard/courses/${params.id}/learn/${findPreviousLesson()?.id}`}
                    >
                      <Button variant="outline" className="flex items-center">
                        <FiArrowLeft className="mr-2" /> Sebelumnya
                      </Button>
                    </Link>
                  ) : (
                    <div></div>
                  )}

                  <Button
                    onClick={handleCompleteLesson}
                    disabled={isCompleting}
                    className="flex items-center"
                  >
                    {isCompleting ? "Memproses..." : "Tandai Selesai"}
                    {!isCompleting && <FiCheckCircle className="ml-2" />}
                  </Button>

                  {findNextLesson() ? (
                    <Link
                      href={`/dashboard/courses/${params.id}/learn/${findNextLesson()?.id}`}
                    >
                      <Button variant="primary" className="flex items-center">
                        Selanjutnya <FiArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Course Content Sidebar */}
          <aside
            className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform z-30 overflow-y-auto dark:bg-neutral-800 ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            } lg:relative lg:transform-none lg:shadow-none lg:w-72 lg:border-l lg:border-neutral-200 lg:dark:border-neutral-700`}
          >
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-semibold">Materi Kursus</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded dark:hover:bg-neutral-700 lg:hidden"
              >
                <FiArrowRight />
              </button>
            </div>

            <div className="p-4">
              {modules.map((module: any, moduleIndex: number) => (
                <div key={module.id} className="mb-4">
                  <h4 className="font-medium mb-2 text-sm uppercase text-neutral-500 dark:text-neutral-400">
                    Module {moduleIndex + 1}: {module.title}
                  </h4>
                  <ul className="space-y-1">
                    {module.lessons &&
                      module.lessons.map((lesson: any) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/dashboard/courses/${params.id}/learn/${lesson.id}`}
                            className={`block px-3 py-2 rounded-lg text-sm ${
                              parseInt(params.lessonId) === lesson.id
                                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            }`}
                          >
                            <div className="flex items-center">
                              {/* Ikon tipe konten */}
                              {lesson.content_type === "video" && (
                                <FiVideo className="mr-2 flex-shrink-0" />
                              )}
                              {lesson.content_type === "article" && (
                                <FiFileText className="mr-2 flex-shrink-0" />
                              )}
                              {lesson.content_type === "quiz" && (
                                <FiEdit className="mr-2 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                              {/* Indikator status */}
                              {lesson.progress &&
                                lesson.progress.status === "completed" && (
                                  <FiCheckCircle className="ml-auto text-green-500 flex-shrink-0" />
                                )}
                            </div>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
