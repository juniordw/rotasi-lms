// src/hooks/api/useCourses.ts
import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { Course } from '@/types/course';

type UseCoursesOptions = {
  role?: string;
  filter?: string;
  autoFetch?: boolean;
};

export const useCourses = (options: UseCoursesOptions = { autoFetch: true }) => {
  const { fetchData, isLoading, error } = useApi();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (options.autoFetch) {
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.role, options.filter]);

  const fetchCourses = async () => {
    // Determine endpoint based on role
    let endpoint = '/courses';
    if (options.role === 'student') {
      endpoint = '/courses/enrolled';
    } else if (options.role === 'instructor') {
      endpoint = '/courses/instructor';
    }

    // Add filter if present
    if (options.filter) {
      endpoint += `?status=${options.filter}`;
    }

    const result = await fetchData(endpoint);
    
    if (result) {
      setCourses(result.data || []);
    }
  };

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses
  };
};