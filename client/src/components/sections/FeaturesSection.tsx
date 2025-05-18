'use client';

import { motion } from 'framer-motion';
import { 
  FiMonitor, 
  FiUsers, 
  FiAward, 
  FiLayout, 
  FiBarChart2, 
  FiCheck, 
  FiBookOpen,
  FiSmartphone
} from 'react-icons/fi';

const features = [
  {
    icon: <FiMonitor size={32} className="text-primary-400" />,
    title: 'Dasbor Terpersonalisasi',
    description: 'Akses cepat ke semua kursus, progres, dan rekomendasi yang disesuaikan dengan minat belajar Anda.',
  },
  {
    icon: <FiBookOpen size={32} className="text-coral-400" />,
    title: 'Katalog Kursus Beragam',
    description: 'Pilihan kursus berkualitas tinggi dalam berbagai bidang dan tingkat keahlian.',
  },
  {
    icon: <FiUsers size={32} className="text-mint-400" />,
    title: 'Pembelajaran Sosial',
    description: 'Berkolaborasi dengan peserta lain melalui forum diskusi, grup belajar, dan proyek tim.',
  },
  {
    icon: <FiAward size={32} className="text-primary-400" />,
    title: 'Sertifikasi Profesional',
    description: 'Dapatkan sertifikat setelah menyelesaikan kursus.',
  },
  {
    icon: <FiBarChart2 size={32} className="text-mint-400" />,
    title: 'Analitik Pembelajaran',
    description: 'Pantau kemajuan belajar Anda dengan insights mendalam dan visualisasi yang jelas.',
  },
  {
    icon: <FiSmartphone size={32} className="text-primary-400" />,
    title: 'Mobile Learning',
    description: 'Belajar di mana saja dan kapan saja dengan aplikasi mobile yang responsif dan offline mode.',
  },
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 font-poppins text-3xl font-bold md:text-4xl">
            Fitur Unggulan ROTASI
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Platform pembelajaran modern dengan segala kebutuhan untuk pengalaman belajar yang optimal
          </p>
        </motion.div>

        <motion.div 
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-poppins text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;