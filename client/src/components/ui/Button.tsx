import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900';
  
  const variantStyles = {
    primary: 'bg-primary-400 text-white hover:bg-primary-500 active:bg-primary-600',
    secondary: 'bg-coral-400 text-white hover:bg-coral-500 active:bg-coral-600',
    outline: 'border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800',
    ghost: 'bg-transparent text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;