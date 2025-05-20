// src/components/ui/CourseButton.tsx
import Link from 'next/link';
import { ReactNode } from 'react';

type CourseButtonProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'secondary';
  className?: string;
};

const CourseButton = ({ 
  href, 
  children, 
  variant = 'primary',
  className = '' 
}: CourseButtonProps) => {
  // Style variants
  const variants = {
    primary: 'bg-primary-400 text-white hover:bg-primary-500 shadow-sm hover:shadow-md',
    outline: 'border border-primary-400 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
  };

  return (
    <Link href={href}>
      <div className={`
        flex items-center justify-center 
        h-12 rounded-lg 
        font-medium transition-all duration-200
        ${variants[variant]}
        ${className}
      `}>
        {children}
      </div>
    </Link>
  );
};

export default CourseButton;