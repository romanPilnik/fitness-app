import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LibraryPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8">
      <header className="border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">Library</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-(--text-h)">Exercises</h2>
        <Link
          to="/exercises"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
        >
          Browse exercises
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-medium text-(--text-h)">Templates</h2>
          <Link
            to="/templates/new"
            aria-label="Add template"
            title="New template"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
          >
            <Plus className="size-5" aria-hidden />
          </Link>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            to="/templates"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
          >
            Browse templates
          </Link>
        </div>
      </section>
    </div>
  );
}
