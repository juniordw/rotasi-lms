// src/components/ui/EmptyState.tsx
import { ReactNode } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
};

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className = "",
}: EmptyStateProps) => {
  return (
    <div className={`rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-800/50 ${className}`}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="mb-6 max-w-md mx-auto text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
      
      {actionLabel && (
        actionLink ? (
          <Link href={actionLink}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;