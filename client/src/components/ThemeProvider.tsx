'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setTheme } from '@/redux/features/themeSlice';

export default function ThemeProvider() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      const isDarkMode = savedTheme === 'true';
      
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      dispatch(setTheme(isDarkMode));
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
      
      localStorage.setItem('darkMode', prefersDark.toString());
      dispatch(setTheme(prefersDark));
    }

    setMounted(true);
  }, [dispatch]);

  return null; // This component doesn't render anything
}