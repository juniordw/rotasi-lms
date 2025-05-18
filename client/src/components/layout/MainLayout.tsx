'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/Toaster';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 antialiased transition-colors duration-200 dark:bg-neutral-900 dark:text-neutral-50">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}