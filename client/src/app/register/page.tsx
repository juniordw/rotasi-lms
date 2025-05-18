// src/app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiMoon,
  FiSun,
  FiLock,
  FiMail,
  FiUser,
  FiBriefcase,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { toggleTheme } from "@/redux/features/themeSlice";
import { RootState } from "@/redux/store";
import { useToast } from "@/components/ui/Toaster";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { setCookie } from "cookies-next";
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
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
  department?: string;
  confirm_password?: string;
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    full_name: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1); // 2-step registration process for better UX

  const router = useRouter();
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const { showToast } = useToast();
  // Gunakan useAuth hook dari AuthContext
  const { login } = useAuth();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    // Also update the document class for immediate visual change
    applyTheme(!darkMode);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form fields
  const validateStep1 = () => {
    const errors: FormErrors = {};
    
    // Validate full name
    if (!formData.full_name.trim()) {
      errors.full_name = "Nama lengkap wajib diisi";
    } else if (formData.full_name.length < 3) {
      errors.full_name = "Nama lengkap minimal 3 karakter";
    }
    
    // Validate username
    if (!formData.username.trim()) {
      errors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      errors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username hanya boleh berisi huruf, angka, dan underscore";
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }
    
    return errors;
  };
  
  const validateStep2 = () => {
    const errors: FormErrors = {};
    
    // Validate department
    if (!formData.department) {
      errors.department = "Departemen wajib dipilih";
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = "Password harus mengandung huruf dan angka";
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Konfirmasi password tidak cocok";
    }
    
    return errors;
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate step 1 fields
    const errors = validateStep1();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Proceed to step 2
    setStep(2);
    setFormErrors({});
  };

  const prevStep = () => {
    setStep(1);
    setGeneralError("");
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate step 2 fields
    const errors = validateStep2();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setGeneralError("");
    setIsLoading(true);

    // Remove confirm_password from the data sent to API
    const { confirm_password, ...registrationData } = formData;

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save tokens to localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        
        // Set cookies for middleware
        setCookie("accessToken", data.accessToken, { maxAge: 60 * 60 * 24 });
        setCookie("refreshToken", data.refreshToken, { maxAge: 60 * 60 * 24 * 30 });

        showToast("Registrasi berhasil! Anda akan dialihkan ke dashboard", "success");
        
        // Login setelah registrasi berhasil (membuat session)
        await login(formData.email, formData.password, false);
        
        // Redirect dengan slight delay agar user dapat melihat pesan sukses
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        if (data.field) {
          // Handle field-specific errors
          setFormErrors({
            ...formErrors,
            [data.field]: data.message
          });
        } else {
          // Handle general error
          setGeneralError(data.message || "Terjadi kesalahan saat mendaftar");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setGeneralError("Terjadi kesalahan koneksi ke server");
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    "Pilih Departemen",
    "IT & Pengembangan",
    "Pemasaran & Penjualan",
    "Keuangan & Akuntansi",
    "Operasional",
    "Sumber Daya Manusia",
    "Penelitian & Pengembangan",
    "Layanan Pelanggan",
    "Desain & Kreatif",
    "Pendidikan",
    "Lainnya",
  ];

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
          <div className="mb-6 flex flex-col items-center">
            <Logo className="mb-5" />
            <h1 className="mb-2 text-center font-poppins text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {step === 1 ? "Buat Akun" : "Sedikit Lagi!"}
            </h1>
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              {step === 1
                ? "Bergabung dengan ROTASI untuk memulai perjalanan belajar"
                : "Lengkapi informasi untuk menyelesaikan pendaftaran"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6 flex items-center justify-center">
            <div className="flex w-full max-w-[200px] items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 1 ? "bg-primary-400 text-white" : "bg-neutral-200 dark:bg-neutral-700"}`}
              >
                1
              </div>
              <div
                className={`h-1 flex-1 ${step >= 2 ? "bg-primary-400" : "bg-neutral-200 dark:bg-neutral-700"}`}
              ></div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 2 ? "bg-primary-400 text-white" : "bg-neutral-200 dark:bg-neutral-700"}`}
              >
                2
              </div>
            </div>
          </div>

          {generalError && (
            <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-4" onSubmit={nextStep}>
              <div className="space-y-1">
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                    <FiUser size={18} />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border ${
                      formErrors.full_name 
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                        : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                    } px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                    placeholder="Nama lengkap Anda"
                  />
                </div>
                {formErrors.full_name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                    <FiUser size={18} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border ${
                      formErrors.username 
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                        : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                    } px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                    placeholder="Username yang unik"
                  />
                </div>
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>

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
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
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

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="rounded-xl py-3 transition-all hover:shadow-lg"
                >
                  Lanjutkan
                </Button>
              </div>
            </form>
          ) : (
            // ... (kode lainnya sama dengan sebelumnya) ...
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Departemen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                    <FiBriefcase size={18} />
                  </div>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border ${
                      formErrors.department 
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                        : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                    } px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                  >
                    {departments.map((dept, index) => (
                      <option
                        key={index}
                        value={index === 0 ? "" : dept}
                        disabled={index === 0}
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.department}</p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border ${
                      formErrors.password 
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                        : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                    } px-3 py-3 pl-10 pr-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                    placeholder="Buat password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
                {formErrors.password ? (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Minimal 6 karakter, kombinasi huruf dan angka
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border ${
                      formErrors.confirm_password 
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10" 
                        : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800/90"
                    } px-3 py-3 pl-10 pr-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:text-white dark:focus:border-primary-400`}
                    placeholder="Konfirmasi password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
                {formErrors.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.confirm_password}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 rounded-xl py-3"
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 rounded-xl py-3 transition-all hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Mendaftar...
                    </div>
                  ) : (
                    "Daftar"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary-400 hover:text-primary-500"
              >
                Masuk
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link
              href="/syarat-ketentuan"
              className="text-primary-400 hover:text-primary-500"
            >
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/kebijakan-privasi"
              className="text-primary-400 hover:text-primary-500"
            >
              Kebijakan Privasi
            </Link>{" "}
            kami.
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

export default RegisterPage;