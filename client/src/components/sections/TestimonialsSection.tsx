'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const testimonials = [
  {
    id: 1,
    content: 'ROTASI mengubah cara saya belajar coding. Antarmuka yang intuitif dan jalur pembelajaran yang terstruktur membantu saya menjadi developer web dalam waktu kurang dari 6 bulan.',
    name: 'Ahmad Fauzi',
    title: 'Frontend Developer',
    avatar: '/images/avatar-1.jpg',
  },
  {
    id: 2,
    content: 'Sebagai instruktur, saya sangat terkesan dengan kemudahan pembuatan kursus di ROTASI. Tools dan analitik yang disediakan sangat membantu untuk meningkatkan kualitas kursus saya.',
    name: 'Dina Maulida',
    title: 'UX Design Instructor',
    avatar: '/images/avatar-2.jpg',
  },
  {
    id: 3,
    content: 'Sistem sertifikasi ROTASI diakui di perusahaan kami. Beberapa karyawan terbaik kami adalah lulusan dari kursus intensif ROTASI Learning Management System.',
    name: 'Budi Santoso',
    title: 'HR Manager at TechCorp',
    avatar: '/images/avatar-3.jpg',
  },
  {
    id: 4,
    content: 'Fleksibilitas belajar di ROTASI sangat cocok dengan jadwal saya yang padat. Saya bisa belajar kapan saja, di mana saja, bahkan offline dengan fitur download materi.',
    name: 'Sinta Wijaya',
    title: 'Marketing Professional',
    avatar: '/images/avatar-4.jpg',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isAutoplay) return;
    
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoplay, currentIndex]);
  
  const pauseAutoplay = () => setIsAutoplay(false);
  
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 font-poppins text-3xl font-bold md:text-4xl">
            Apa Kata Mereka
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Pengalaman dari pengguna yang telah merasakan manfaat belajar di ROTASI
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          <div 
            className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-neutral-800 md:p-10"
            onMouseEnter={pauseAutoplay}
            onTouchStart={pauseAutoplay}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 h-20 w-20 overflow-hidden rounded-full border-4 border-primary-100 dark:border-primary-900">
                  <Image
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mb-6 text-lg italic text-neutral-700 dark:text-neutral-300 md:text-xl">
                  "{testimonials[currentIndex].content}"
                </p>
                <h4 className="font-poppins text-lg font-semibold">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {testimonials[currentIndex].title}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-500 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-primary-400"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoplay(false);
                  }}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary-500 w-6'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-500 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-primary-400"
              aria-label="Next testimonial"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;