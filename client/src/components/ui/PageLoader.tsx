// src/components/ui/PageLoader.tsx
import LoadingIndicator from './LoadingIndicator';

type PageLoaderProps = {
  message?: string;
};

const PageLoader = ({ message = 'Memuat data...' }: PageLoaderProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <LoadingIndicator size="lg" />
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">{message}</p>
    </div>
  );
};

export default PageLoader;