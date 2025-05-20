// src/hooks/api/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toaster';
import { useApi } from './useApi';

export const useDashboardData = (authUser: any) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { fetchData, isLoading: apiLoading } = useApi();
  
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [authUser]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
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
      const [statsData, coursesData, notificationsData] = await Promise.all([
        fetchData("/users/stats/dashboard"),
        fetchData("/courses/enrolled"),
        fetchData("/notifications?limit=5")
      ]);

      // Process stats data
      if (statsData) {
        setDashboardStats(statsData.data || {});
      }

      // Process enrolled courses
      if (coursesData) {
        setEnrolledCourses(coursesData.data?.enrollments || []);
      }

      // Process notifications
      if (notificationsData) {
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
      const userData = await fetchData("/auth/me");
      return userData;
    } catch (error) {
      console.error("User data fetch error:", error);
      return null;
    }
  };

  return {
    user,
    dashboardStats,
    enrolledCourses,
    notifications,
    isLoading: isLoading || apiLoading,
    error,
    refetchDashboardData: fetchDashboardData
  };
};