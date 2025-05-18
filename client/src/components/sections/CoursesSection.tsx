'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { FiClock, FiStar, FiUsers, FiBookmark } from 'react-icons/fi';

const categories = [
  { id: 'all', name: 'Semua Kursus' },
  { id: 'programming', name: 'Pemrograman' },
  { id: 'design', name: 'Desain' },
  { id: 'business', name: 'Bisnis' },
  { id: 'marketing', name: 'Marketing' },
];

const courses = [
  {
    id: 1,
    title: 'Dasar-Dasar React.js untuk Pemula',
    description: 'Pelajari dasar-dasar React.js untuk membangun aplikasi web modern yang responsif dan interaktif.',
    instructor: 'Budi Santoso',
    duration: '12 jam',
    level: 'Pemula',
    students: 1245,
    rating: 4.7,
    category: 'programming',
    image: '/images/course-react.jpg',
  },
  {
    id: 2,
    title: 'UI/UX Design Fundamentals',
    description: 'Kuasai prinsip-prinsip dan praktik terbaik dalam merancang antarmuka pengguna yang efektif.',
    instructor: 'Diana Putri',
    duration: '18 jam',
    level: 'Menengah',
    students: 980,
    rating: 4.9,
    category: 'design',
    image: '/images/course-ux.jpg',
  },
  {
    id: 3,
    title: 'Digital Marketing Strategy',
    description: 'Strategi pemasaran digital terbaru untuk meningkatkan brand awareness dan konversi.',
    instructor: 'Rudi Hartono',
    duration: '15 jam',
    level: 'Semua Level',
    students: 1850,
    rating: 4.6,
    category: 'marketing',
    image: '/images/course-marketing.jpg',
  },
  {
    id: 4,
    title: 'E-Commerce Business Masterclass',
    description: 'Panduan lengkap membangun dan mengembangkan bisnis e-commerce yang sukses dari nol.',
    instructor: 'Sinta Wijaya',
    duration: '24 jam',
    level: 'Lanjutan',
    students: 756,
    rating: 4.8,
    category: 'business',
    image: '/images/course-business.jpg',
  },
];

const CoursesSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCourses = activeCategory === 'all'
    ? courses
    : courses.filter(course => course.category === activeCategory);

  return (
    <section id="courses" className="bg-neutral-50 py-20 dark:bg-neutral-800/30">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 font-poppins text-3xl font-bold md:text-4xl">
            Jelajahi Kursus Kami
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Pilih dari berbagai kursus berkualitas tinggi yang dirancang oleh para ahli
          </p>
        </motion.div>

        <div className="mb-8 flex items-center justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-400 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          layout
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg dark:bg-neutral-800"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  width={400}
                  height={200}
                />
                <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-primary-400 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <FiBookmark size={16} />
                </button>
              </div>
              <div className="p-5">
                <h3 className="mb-2 font-poppins text-lg font-semibold line-clamp-2">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {course.description}
                </p>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center text-neutral-500 dark:text-neutral-400">
                    <FiClock className="mr-1" size={14} />
                    {course.duration}
                  </span>
                  <span className="flex items-center text-neutral-500 dark:text-neutral-400">
                    <FiUsers className="mr-1" size={14} />
                    {course.students}
                  </span>
                  <span className="flex items-center font-medium text-amber-500">
                    <FiStar className="mr-1" size={14} />
                    {course.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {course.instructor}
                  </span>
                  <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {course.level}
                  </span>
                </div>
              </div>
              <div className="border-t border-neutral-100 px-5 py-3 dark:border-neutral-700">
                <Button variant="primary" fullWidth>Lihat Kursus</Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Lihat Semua Kursus
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;