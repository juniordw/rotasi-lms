// src/app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import {
  FiUser,
  FiMail,
  FiBookmark,
  FiEdit,
  FiLock,
  FiSave,
  FiCamera,
  FiCheckCircle,
  FiLoader,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";
import { User, UserFormData, PasswordData } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";

type FormErrors = {
  full_name?: string;
  username?: string;
  email?: string;
  department?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser, refreshUserData } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    username: "",
    email: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>("");

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
        // Type assertion for proper typing
        setUser(data.user as User);

        // Initialize form data with user data
        setFormData({
          full_name: data.user.full_name || "",
          username: data.user.username || "",
          email: data.user.email || "",
          department: data.user.department || "",
        });
      } catch (error) {
        console.error("User data fetch error:", error);
        showToast("Error loading user data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    // If auth user is available, use it, otherwise fetch from API
    if (authUser) {
      setUser(authUser);

      setFormData({
        full_name: authUser.full_name || "",
        username: authUser.username || "",
        email: authUser.email || "",
        department: authUser.department || "",
      });

      setIsLoading(false);
    } else {
      fetchUserData();
    }
  }, [router, showToast, authUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: UserFormData) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev: PasswordData) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general password error
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleEditToggle = (): void => {
    setIsEditing(!isEditing);
    setFormErrors({});
  };

  const validateProfileForm = (): FormErrors => {
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
      errors.username =
        "Username hanya boleh berisi huruf, angka, dan underscore";
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }

    // Validate department
    if (!formData.department) {
      errors.department = "Departemen wajib dipilih";
    }

    return errors;
  };

  const validatePasswordForm = (): FormErrors => {
    const errors: FormErrors = {};

    // Validate current password
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Password saat ini wajib diisi";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      errors.newPassword = "Password baru wajib diisi";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password baru minimal 6 karakter";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(passwordData.newPassword)) {
      errors.newPassword = "Password harus mengandung huruf dan angka";
    }

    // Validate confirm password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password tidak cocok";
    }

    return errors;
  };

  const handleProfileUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate form
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`http://localhost:5000/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Profil berhasil diperbarui", "success");

        // Update user state
        setUser((prev: User | null) => {
          if (!prev) return null;
          return { ...prev, ...formData };
        });

        // Also update auth context
        refreshUserData();

        setIsEditing(false);
      } else {
        if (data.field) {
          // Handle field-specific errors
          setFormErrors({
            ...formErrors,
            [data.field]: data.message,
          });
        } else {
          // Handle general error
          showToast(data.message || "Gagal memperbarui profil", "error");
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Terjadi kesalahan saat memperbarui profil", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setPasswordError("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("Password berhasil diperbarui", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);

        // If the API requires re-login after password change
        if (data.message && data.message.includes("login kembali")) {
          showToast("Silakan login kembali dengan password baru Anda", "info");

          setTimeout(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            router.push("/login");
          }, 2000);
        }
      } else {
        if (data.field) {
          // Field-specific error
          setFormErrors({
            ...formErrors,
            [data.field]: data.message,
          });
        } else {
          // General error
          setPasswordError(data.message || "Gagal memperbarui password");
        }
      }
    } catch (error) {
      console.error("Password update error:", error);
      setPasswordError("Terjadi kesalahan saat memperbarui password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast(
        "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP",
        "error"
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      showToast("Ukuran file terlalu besar. Maksimal 2MB", "error");
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `http://localhost:5000/api/users/profile/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("Avatar berhasil diperbarui", "success");

        // Update user state
        setUser((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            avatar_url: data.data.avatar_url,
          } as User;
        });

        // Also update auth context
        refreshUserData();
      } else {
        showToast(data.message || "Gagal memperbarui avatar", "error");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      showToast("Terjadi kesalahan saat mengupload avatar", "error");
    } finally {
      setIsUploading(false);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-600 hover:text-primary-500 dark:text-neutral-400"
          >
            <FiArrowLeft className="mr-2" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-neutral-800">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="relative h-32 w-32">
                    <div className="h-full w-full overflow-hidden rounded-full border-4 border-neutral-100 dark:border-neutral-700">
                      {isUploading ? (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
                          <FiLoader
                            className="animate-spin text-primary-400"
                            size={24}
                          />
                        </div>
                      ) : (
                        <Image
                          src={
                            user.avatar_url || "/images/avatar-placeholder.jpg"
                          }
                          alt={user.full_name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-400 text-white shadow-md hover:bg-primary-500"
                      title="Upload foto profil"
                    >
                      <FiCamera size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                    />
                  </div>
                </div>
                <h2 className="mb-1 text-xl font-bold">{user.full_name}</h2>
                <p className="mb-2 text-neutral-500 dark:text-neutral-400">
                  @{user.username}
                </p>

                <div className="inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  {user.role === "student"
                    ? "Siswa"
                    : user.role === "instructor"
                      ? "Instruktur"
                      : "Admin"}
                </div>

                <div className="mt-4 w-full text-left">
                  <div className="mb-3">
                    <div className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Email
                    </div>
                    <div className="flex items-center">
                      <FiMail className="mr-2 text-neutral-400" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Departemen
                    </div>
                    <div className="flex items-center">
                      <FiBookmark className="mr-2 text-neutral-400" />
                      <span>{user.department || "Belum diatur"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Tanggal Bergabung
                    </div>
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-neutral-400" />
                      <span>
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Profile Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-neutral-800">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {isEditing ? "Edit Profil" : "Informasi Profil"}
                </h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    className="flex items-center gap-2"
                  >
                    <FiEdit size={16} />
                    Edit Profil
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-4">
                    <label
                      htmlFor="full_name"
                      className="mb-1 block text-sm font-medium"
                    >
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className={`w-full rounded-lg border ${
                        formErrors.full_name
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
                    />
                    {formErrors.full_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.full_name}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="mb-1 block text-sm font-medium"
                    >
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className={`w-full rounded-lg border ${
                        formErrors.username
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.username}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="mb-1 block text-sm font-medium"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full rounded-lg border ${
                        formErrors.email
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="department"
                      className="mb-1 block text-sm font-medium"
                    >
                      Departemen <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className={`w-full rounded-lg border ${
                        formErrors.department
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
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
                    {formErrors.department && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.department}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditToggle}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Menyimpan...
                        </div>
                      ) : (
                        <>
                          <FiSave size={16} />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                        Nama Lengkap
                      </h3>
                      <p className="mt-2">{user.full_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                        Username
                      </h3>
                      <p className="mt-2">{user.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                        Email
                      </h3>
                      <p className="mt-2">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                        Departemen
                      </h3>
                      <p className="mt-2">
                        {user.department || "Belum diatur"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change Form */}
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-neutral-800">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Keamanan Akun</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2"
                >
                  <FiLock size={16} />
                  {showPasswordForm ? "Batal" : "Ubah Password"}
                </Button>
              </div>

              {showPasswordForm ? (
                <form onSubmit={handlePasswordUpdate}>
                  {passwordError && (
                    <div className="mb-4 flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      <FiAlertCircle className="mr-2 flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="currentPassword"
                      className="mb-1 block text-sm font-medium"
                    >
                      Password Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className={`w-full rounded-lg border ${
                        formErrors.currentPassword
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
                    />
                    {formErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-sm font-medium"
                    >
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className={`w-full rounded-lg border ${
                        formErrors.newPassword
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
                    />
                    {formErrors.newPassword ? (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.newPassword}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-neutral-500">
                        Minimal 6 karakter, kombinasi huruf dan angka
                      </p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-medium"
                    >
                      Konfirmasi Password Baru{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className={`w-full rounded-lg border ${
                        formErrors.confirmPassword
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                          : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                      } p-2.5 dark:text-white`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Menyimpan...
                        </div>
                      ) : (
                        <>
                          <FiCheckCircle size={16} />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-300">
                  Password Anda adalah informasi pribadi yang penting. Jaga
                  kerahasiaan password Anda dan ubah secara berkala untuk
                  keamanan akun Anda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
