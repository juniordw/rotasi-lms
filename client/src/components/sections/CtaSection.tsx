'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FiArrowRight } from 'react-icons/fi';

const CtaSection = () => {
  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-20 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 
            className="mb-6 font-poppins text-3xl font-bold md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Mulai Perjalanan Belajar Anda Sekarang
          </motion.h2>
          
          <motion.p 
            className="mb-8 text-lg opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Daftar dan dapatkan akses ke kursus dan materi pengantar. Tingkatkan keterampilan Anda dan buka peluang karir baru.
          </motion.p>
          
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/register">
              <button
                type="button"
                className="inline-flex items-center rounded-xl px-6 py-3 text-lg font-semibold text-primary-600 transition-all duration-200 bg-white border border-primary-300 shadow-sm hover:bg-primary-50 hover:border-primary-500 hover:shadow-lg"
              >
                Daftar
                <FiArrowRight className="ml-2 text-xl" />
              </button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-xl border-white text-white hover:bg-white/10"
              >
                Masuk
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;