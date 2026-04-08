import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { libraryLocationState } from '@/lib/libraryNav';

export function LibraryPage() {
  return (
    <PageContainer className="gap-4 py-6 sm:gap-6 sm:py-8">
      <header className="border-b border-(--border) pb-3 sm:pb-4">
        <div className="min-w-0 border-l-2 border-(--accent) pl-3 sm:pl-4">
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-(--text-h) sm:text-4xl">
            Library
          </h1>
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        <li>
          <Link
            to="/exercises"
            state={libraryLocationState}
            className="block rounded-xl border border-(--border) bg-(--bg) px-4 py-3 transition-colors hover:bg-(--code-bg)/50"
          >
            <span className="font-medium text-(--text-h)">Exercises</span>
            <p className="font-mono-ui mt-0.5 text-xs tracking-tight text-(--text)">
              Browse by muscle group
            </p>
          </Link>
        </li>
        <li>
          <Link
            to="/templates"
            state={libraryLocationState}
            className="block rounded-xl border border-(--border) bg-(--bg) px-4 py-3 transition-colors hover:bg-(--code-bg)/50"
          >
            <span className="font-medium text-(--text-h)">Templates</span>
            <p className="font-mono-ui mt-0.5 text-xs tracking-tight text-(--text)">
              Program templates to build from
            </p>
          </Link>
        </li>
      </ul>
    </PageContainer>
  );
}
