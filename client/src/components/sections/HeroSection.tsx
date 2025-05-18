'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { FiArrowRight, FiPlay, FiX } from 'react-icons/fi';

const HeroSection = () => {
  const videoRef = useRef<HTMLDialogElement>(null);

  const openVideo = () => {
    if (videoRef.current) {
      videoRef.current.showModal();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pb-16 pt-32 dark:from-neutral-900 dark:to-neutral-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-400/10 to-primary-500/30 blur-3xl filter dark:from-primary-400/5 dark:to-primary-500/10"></div>
      </div>

      <div className="container relative mx-auto grid gap-12 px-4 md:px-8 lg:grid-cols-2 lg:gap-8">
        <motion.div
          className="flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-4 inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            Platform LMS Generasi Baru
          </motion.div>
          <motion.h1 
            variants={itemVariants} 
            className="mb-6 font-poppins text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
          >
            Belajar Tanpa Batas di 
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {' '}ROTASI
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mb-8 text-lg text-neutral-600 dark:text-neutral-300">
            Platform pembelajaran komprehensif yang dirancang untuk memaksimalkan potensi belajar mengajar di era digital. Akses kursus berkualitas tinggi kapan saja, di mana saja.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button size="lg" className="group rounded-xl">
                Mulai Sekarang
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={openVideo}
              className="group rounded-xl"
            >
              <FiPlay className="mr-2 text-primary-400" />
              Tonton Demo
            </Button>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-8 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="h-8 w-8 overflow-hidden rounded-full border-2 border-white dark:border-neutral-800"
                >
                  <div className={`h-full w-full bg-primary-${i * 100}`}></div>
                </div>
              ))}
            </div>
            <span className="ml-4">
              Bergabung dengan <span className="font-bold">10,000+</span> pelajar
            </span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.5
          }}
        >
          <div className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-floating md:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-mint-100 dark:from-primary-900/30 dark:to-mint-900/30"></div>
            <div className="relative h-full w-full">
              <Image
                src="/images/dashboard-preview.png"
                alt="ROTASI LMS Dashboard Preview"
                fill
                style={{ objectFit: 'contain' }}
                className="p-4"
              />
            </div>
          </div>
          {/* Decoration elements */}
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-lg bg-mint-400/20 backdrop-blur-md"></div>
          <div className="absolute -bottom-8 -left-8 h-16 w-16 rounded-lg bg-coral-400/20 backdrop-blur-md"></div>
          <div className="absolute bottom-12 right-12 h-12 w-12 animate-float rounded-full bg-primary-400/20 backdrop-blur-md"></div>
        </motion.div>
      </div>

      {/* Video Dialog */}
      <dialog
        ref={videoRef}
        className="rounded-lg bg-transparent p-0 backdrop:bg-neutral-900/80"
        onClick={(e) => {
          if (e.target === videoRef.current) {
            videoRef.current?.close();
          }
        }}
      >
        <div className="relative max-w-3xl">
          <button
            onClick={() => videoRef.current?.close()}
            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md"
          >
            <FiX />
          </button>
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            {/* Replace with actual video element */}
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 p-4 text-white">
              Video demo ROTASI LMS
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
};

export default HeroSection;