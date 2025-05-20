// src/components/ui/LoadingButton.tsx
import Button from '@/components/ui/Button';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type LoadingButtonProps = {
  children: ReactNode;
  isLoading: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const LoadingButton = ({
  children,
  isLoading,
  loadingText = 'Memproses...',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={isLoading || props.disabled}
      className={className}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;