// src/components/ui/LoadingIndicator.tsx
type LoadingIndicatorProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const LoadingIndicator = ({ 
  size = 'md', 
  className = ''
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-primary-400 border-t-transparent ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  );
};

export default LoadingIndicator;