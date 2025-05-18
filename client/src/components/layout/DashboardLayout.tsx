"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleTheme } from "@/redux/features/themeSlice";
import Logo from "@/components/ui/Logo";
import { Toaster } from "@/components/ui/Toaster";
import {
  FiHome,
  FiBook,
  FiAward,
  FiSettings,
  FiUser,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiMessageSquare,
  FiBarChart2,
} from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data.user);

        // Count unread notifications
        if (data.notifications) {
          const unread = data.notifications.filter(
            (n: any) => !n.is_read
          ).length;
          setUnreadNotifications(unread);
        }
      } catch (error) {
        console.error("User data fetch error:", error);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    // Close sidebar when route changes on mobile
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleThemeToggle = () => dispatch(toggleTheme());

  // Define navigation items based on user role
  let navItems = [{ href: "/dashboard", label: "Dashboard", icon: <FiHome /> }];

  if (user) {
    if (user.role === "student") {
      navItems = [
        ...navItems,
        { href: "/dashboard/courses", label: "Kursus Saya", icon: <FiBook /> },
        {
          href: "/dashboard/certificates",
          label: "Sertifikat",
          icon: <FiAward />,
        },
        {
          href: "/dashboard/discussions",
          label: "Diskusi",
          icon: <FiMessageSquare />,
        },
      ];
    } else if (user.role === "instructor") {
      navItems = [
        ...navItems,
        { href: "/dashboard/courses", label: "Kursus Saya", icon: <FiBook /> },
        { href: "/dashboard/students", label: "Siswa", icon: <FiUser /> },
        {
          href: "/dashboard/discussions",
          label: "Diskusi",
          icon: <FiMessageSquare />,
        },
        {
          href: "/dashboard/analytics",
          label: "Analitik",
          icon: <FiBarChart2 />,
        },
      ];
    } else if (user.role === "admin") {
      navItems = [
        ...navItems,
        { href: "/dashboard/users", label: "Pengguna", icon: <FiUser /> },
        { href: "/dashboard/courses", label: "Kursus", icon: <FiBook /> },
        {
          href: "/dashboard/categories",
          label: "Kategori",
          icon: <FiBarChart2 />,
        },
      ];
    }
  }

  // Common nav items for all roles
  navItems = [
    ...navItems,
    { href: "/dashboard/settings", label: "Pengaturan", icon: <FiSettings /> },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white p-4 shadow-lg transition-transform dark:bg-neutral-800 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/50"
            >
              <FiLogOut className="mr-3" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex w-full flex-col">
        {/* Top navigation */}
        <header className="border-b border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <FiMenu size={20} />
            </button>

            <div className="ml-auto flex items-center gap-4">
              <button
                onClick={handleThemeToggle}
                className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Toggle theme"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              <Link
                href="/dashboard/notifications"
                className="relative rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <FiBell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-400 text-[10px] text-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button className="flex items-center gap-2 rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      {user?.full_name?.charAt(0) || <FiUser />}
                    </div>
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
