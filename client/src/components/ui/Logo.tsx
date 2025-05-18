import Link from 'next/link';

const Logo = ({ className = '' }: { className?: string }) => {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <span className="flex items-center">
        <span className="mr-1 block h-10 w-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 transition-all"></span>
        <span className="font-poppins text-2xl font-bold tracking-tight">
          ROT<span className="text-primary-400">A</span>SI
        </span>
      </span>
    </Link>
  );
};

export default Logo;