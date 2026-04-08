import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: Props) {
  return (
    <div className={cn('mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8', className)}>
      {children}
    </div>
  );
}
