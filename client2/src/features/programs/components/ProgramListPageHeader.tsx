import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProgramListPageHeader() {
  return (
    <header className="border-b border-(--border) pb-3 sm:pb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 border-l-2 border-(--accent) pl-3 sm:pl-4">
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-(--text-h) sm:text-4xl">
            My programs
          </h1>
        </div>
        <Link
          to="/programs/new"
          aria-label="Create program"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:size-11"
        >
          <Plus className="size-4.5 sm:size-5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
