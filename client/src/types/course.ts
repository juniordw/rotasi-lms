// src/types/course.ts

export interface Lesson {
  id: number;
  title: string;
  content_type: string;
  content_text?: string;
  content_url?: string;
  duration_minutes: number;
  module_id: number;
  quiz?: Quiz;
  progress?: LessonProgress;
}

export interface Quiz {
  id: number;
  title: string;
  passing_score: number;
  time_limit_minutes: number;
  questionCount?: number;
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  order_number: number;
  course_id: number;
  lessons?: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: {
    id: number;
    full_name: string;
    avatar_url?: string;
  };
  enrollmentStatus?: {
    enrolled: boolean;
    status?: string;
  };
  modules?: Module[];
}

export interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  last_accessed?: string;
  time_spent_minutes: number;
}