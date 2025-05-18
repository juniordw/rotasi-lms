'use client';

import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CoursesSection from '@/components/sections/CoursesSection'; 
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CtaSection from '@/components/sections/CtaSection';
import MainLayout from '@/components/layout/MainLayout';

// Import font CSS
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <TestimonialsSection />
      <CtaSection />
    </MainLayout>
  );
}