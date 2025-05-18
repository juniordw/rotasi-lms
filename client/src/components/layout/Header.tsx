'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/features/themeSlice';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleThemeToggle = () => dispatch(toggleTheme());

  // Render theme button only after client-side hydration
  const renderThemeButton = () => {
    if (!isMounted) return null;
    
    return (
      <button
        onClick={handleThemeToggle}
        className="rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
        aria-label="Toggle theme"
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    );
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 shadow backdrop-blur-md dark:bg-neutral-900/90'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <nav className="mr-8">
            <ul className="flex items-center space-x-8">
              <li>
                <Link
                  href="#features"
                  className="text-neutral-700 transition-colors hover:text-primary-400 dark:text-neutral-200 dark:hover:text-primary-400"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="#courses"
                  className="text-neutral-700 transition-colors hover:text-primary-400 dark:text-neutral-200 dark:hover:text-primary-400"
                >
                  Kursus
                </Link>
              </li>
              <li>
                <Link
                  href="#testimonials"
                  className="text-neutral-700 transition-colors hover:text-primary-400 dark:text-neutral-200 dark:hover:text-primary-400"
                >
                  Testimoni
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-xl">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="rounded-xl">
                Daftar
              </Button>
            </Link>
            {renderThemeButton()}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          {renderThemeButton()}
          <button
            onClick={toggleMenu}
            className="ml-4 rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-20 bg-white p-4 shadow-md dark:bg-neutral-900 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-neutral-700 transition-colors hover:text-primary-400 dark:text-neutral-200 dark:hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Fitur
              </Link>
              <Link
                href="#courses"
                className="text-neutral-700 transition-colors hover:text-primary-400 dark:text-neutral-200 dark:hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Kursus
              </Link>
              <Link
                href="#testimonials"
                className="text-neutral-700 transition-colors hover:text-primary-400 dark:text-neutral-200 dark:hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimoni
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth className="rounded-xl">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" fullWidth className="rounded-xl">
                    Daftar
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;