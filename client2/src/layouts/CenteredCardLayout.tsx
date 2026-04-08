import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export function CenteredCardLayout({ title, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-(--bg) px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-(--border) bg-(--bg) p-6 shadow-(--shadow)">
        <h1 className="mb-6 text-center text-2xl font-medium text-(--text-h) md:text-3xl">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
