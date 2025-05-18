import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { FiInstagram, FiTwitter, FiLinkedin, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-100 py-12 dark:bg-neutral-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-neutral-600 dark:text-neutral-300">
              Repositori Online untuk Pelatihan dan Informasi - Solusi pembelajaran modern untuk generasi digital.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                aria-label="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                aria-label="YouTube"
              >
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-poppins text-lg font-semibold">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Kursus
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Jalur Belajar
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Sertifikasi
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Menjadi Instruktur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-poppins text-lg font-semibold">Perusahaan</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Karir
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Partner
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-poppins text-lg font-semibold">Dukungan</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Bantuan
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Kontak
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-700">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              &copy; {currentYear} ROTASI Learning Management System. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-sm text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
              >
                Syarat & Ketentuan
              </Link>
              <Link
                href="#"
                className="text-sm text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="#"
                className="text-sm text-neutral-600 transition-colors hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;