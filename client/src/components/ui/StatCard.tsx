// src/components/ui/StatCard.tsx
import { ReactNode } from 'react';

type StatCardProps = {
  icon: ReactNode;
  title: string;
  value: string | number;
  className?: string;
};

const StatCard = ({ icon, title, value, className = '' }: StatCardProps) => {
  return (
    <div className={`rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 ${className}`}>
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
        {icon}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;