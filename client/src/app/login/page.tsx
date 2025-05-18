// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setCookie } from "cookies-next";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiMoon,
  FiSun,
  FiLock,
  FiMail,
  FiAlertCircle,
} from "react-icons/fi";
import { toggleTheme } from "@/redux/features/themeSlice";
import { RootState } from "@/redux/store";
import { useToast } from "@/components/ui/Toaster";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

// Apply dark mode manually on client-side
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

type FormErrors = {
  email?: string;
  password?: string;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const router = useRouter();
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const { showToast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    // Check for remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    // Also update the document class for immediate visual change
    applyTheme(!darkMode);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    
    // Validate email
    if (!email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email tidak valid";
    }
    
    // Validate password
    if (!password) {
      errors.password = "Password wajib diisi";
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate form
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  
  setGeneralError("");
  setIsLoading(true);

  try {
    // Attempt login using Auth context
    const result = await login(email, password, rememberMe);

    if (result.success) {
      showToast("Login berhasil! Anda akan dialihkan ke dashboard", "success");
      router.push("/dashboard");
    } else {
      setGeneralError(result.message || "Email atau password tidak valid");
    }
  } catch (err) {
    console.error("Login error:", err);
    setGeneralError("Terjadi kesalahan koneksi ke server");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-primary-50 dark:from-neutral-900 dark:to-primary-900/20">
      {/* Left side - Back button and theme toggle */}
      <div className="fixed left-4 top-4 z-10 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center text-neutral-600 transition-colors hover:text-primary-400 dark:text-neutral-300"
        >
          <FiArrowLeft className="mr-2" />
          <span className="hidden sm:inline">Kembali</span>
        </Link>
        <button
          onClick={handleThemeToggle}
          className="rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-200/60 dark:text-neutral-200 dark:hover:bg-neutral-800/60"
          aria-label="Toggle theme"
        >
          {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-neutral-800/80 sm:p-10">
          <div className="mb-8 flex flex-col items-center">
            <Logo className="mb-6" />
            <h1 className="mb-2 text-center font-poppins text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Selamat Datang Kembali!
            </h1>
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              Masuk untuk melanjutkan pembelajaran Anda
            </p>
          </div>

          {generalError && (
            <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                  <FiMail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`block w-full rounded-xl border ${
                    formErrors.email 
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                      : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                  } px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                  placeholder="nama@email.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary-400 transition-colors hover:text-primary-500"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                  <FiLock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`block w-full rounded-xl border ${
                    formErrors.password 
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                      : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                  } px-3 py-3 pl-10 pr-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-400 transition-colors focus:ring-primary-400 dark:border-neutral-700"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Ingat saya
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="rounded-xl py-3 transition-all hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Memproses...
                  </div>
                ) : (
                  "Masuk Sekarang"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-800/90 dark:text-neutral-400">
                  Atau masuk dengan
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M13.397,20.997v-8.196h2.765l0.411-3.209h-3.176V7.548c0-0.926,0.258-1.56,1.587-1.56h1.684V3.127 C15.849,3.039,15.025,2.997,14.201,3c-2.444,0-4.122,1.492-4.122,4.231v2.355H7.332v3.209h2.753v8.202H13.397z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary-400 hover:text-primary-500"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="pointer-events-none fixed -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary-300/20 blur-3xl filter dark:bg-primary-600/10"></div>
      <div className="pointer-events-none fixed -top-32 right-10 h-96 w-96 rounded-full bg-coral-300/20 blur-3xl filter dark:bg-coral-600/10"></div>
      <div className="pointer-events-none fixed bottom-10 right-10 h-64 w-64 rounded-full bg-mint-300/20 blur-3xl filter dark:bg-mint-600/10"></div>
    </div>
  );
};

export default LoginPage;