'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiEyeOff, FiArrowLeft, FiMoon, FiSun, FiLock, FiMail, FiUser, FiBriefcase } from 'react-icons/fi';
import { toggleTheme } from '@/redux/features/themeSlice';
import { RootState } from '@/redux/store';
import { useToast } from '@/components/ui/Toaster';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

// Apply dark mode manually on client-side
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // We'll use a 2-step registration process for a better UX
  
  const router = useRouter();
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const { showToast } = useToast();
  
  const handleThemeToggle = () => {
      dispatch(toggleTheme());
      // Also update the document class for immediate visual change
      applyTheme(!darkMode);
    };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.full_name && formData.username && formData.email) {
      setStep(2);
    } else {
      setError('Harap isi semua kolom yang diperlukan');
    }
  };
  
  const prevStep = () => {
    setStep(1);
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Save tokens to localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        showToast('Registrasi berhasil!', 'success');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Terjadi kesalahan saat mendaftar');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Terjadi kesalahan koneksi ke server');
    } finally {
      setIsLoading(false);
    }
  };
  
  const departments = [
    'Pilih Departemen',
    'IT & Pengembangan',
    'Pemasaran & Penjualan',
    'Keuangan & Akuntansi',
    'Operasional',
    'Sumber Daya Manusia',
    'Penelitian & Pengembangan',
    'Layanan Pelanggan',
    'Desain & Kreatif',
    'Pendidikan',
    'Lainnya'
  ];
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-primary-50 dark:from-neutral-900 dark:to-primary-900/20">
      {/* Left side - Back button and theme toggle */}
      <div className="fixed left-4 top-4 z-10 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center text-neutral-600 transition-colors hover:text-primary-400 dark:text-neutral-300">
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
              {step === 1 ? 'Buat Akun' : 'Sedikit Lagi!'}
            </h1>
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              {step === 1 
                ? 'Bergabung dengan ROTASI untuk memulai perjalanan belajar' 
                : 'Lengkapi informasi untuk menyelesaikan pendaftaran'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6 flex items-center justify-center">
            <div className="flex w-full max-w-[200px] items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary-400 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                1
              </div>
              <div className={`h-1 flex-1 ${step >= 2 ? 'bg-primary-400' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary-400 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <form className="space-y-4" onSubmit={nextStep}>
              <div className="space-y-1">
                <label htmlFor="full_name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nama Lengkap
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
                    className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-white dark:focus:border-primary-400"
                    placeholder="Nama lengkap Anda"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Username
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
                    className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-white dark:focus:border-primary-400"
                    placeholder="Username yang unik"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
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
                    className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-white dark:focus:border-primary-400"
                    placeholder="nama@email.com"
                  />
                </div>
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="department" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Departemen
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
                    className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 pl-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-white dark:focus:border-primary-400"
                  >
                    {departments.map((dept, index) => (
                      <option key={index} value={index === 0 ? '' : dept} disabled={index === 0}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 dark:text-neutral-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 pl-10 pr-10 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-white dark:focus:border-primary-400"
                    placeholder="Buat password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Minimal 6 karakter, kombinasi huruf dan angka
                </p>
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
                  {isLoading ? 'Mendaftar...' : 'Daftar'}
                </Button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-primary-400 hover:text-primary-500">
                Masuk
              </Link>
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/syarat-ketentuan" className="text-primary-400 hover:text-primary-500">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/kebijakan-privasi" className="text-primary-400 hover:text-primary-500">
              Kebijakan Privasi
            </Link>{' '}
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