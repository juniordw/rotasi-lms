// src/components/course/CourseCard.tsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { FiPlay, FiEdit, FiClock, FiUsers, FiBarChart2, FiMoreHorizontal } from "react-icons/fi";

type CourseCardProps = {
  course: any;
  userRole: string;
  className?: string;
};

const CourseCard = ({ course, userRole, className = "" }: CourseCardProps) => {
  // Handle different course data structure based on role
  const courseData = course.course || course;
  const progressPercentage = userRole === "student" ? course.progress_percentage || 0 : null;
  
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
    <div className={`overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 ${className}`}>
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

export default CourseCard;