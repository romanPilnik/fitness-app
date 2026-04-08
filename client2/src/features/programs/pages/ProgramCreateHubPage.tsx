import { BookOpen, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubpageHeader } from '@/components/ui/SubpageHeader';

export function ProgramCreateHubPage() {
  return (
    <>
      <SubpageHeader
        fallbackTo="/programs"
        title="Create program"
        backLabel="Back to programs"
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <p className="text-sm text-(--text)">
          Start from scratch or pick a template from the library, then customize it into your
          program.
        </p>

      <ul className="flex flex-col gap-3">
        <li>
          <Link
            to="/programs/new/custom"
            className="flex min-h-18 items-center gap-4 rounded-xl border border-(--border) bg-(--bg) p-4 transition-colors hover:bg-(--code-bg)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg)">
              <PenLine className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-(--text-h)">Build from scratch</span>
              <span className="mt-0.5 block text-sm text-(--text)">
                Define days, exercises, and targets yourself.
              </span>
            </span>
          </Link>
        </li>
        <li>
          <Link
            to="/templates"
            className="flex min-h-18 items-center gap-4 rounded-xl border border-(--border) bg-(--bg) p-4 transition-colors hover:bg-(--code-bg)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-(--code-bg)/30 text-(--text-h)">
              <BookOpen className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-(--text-h)">Use a library template</span>
              <span className="mt-0.5 block text-sm text-(--text)">
                Choose a template, then save it as your program and edit it.
              </span>
            </span>
          </Link>
        </li>
      </ul>
      </div>
    </>
  );
}
