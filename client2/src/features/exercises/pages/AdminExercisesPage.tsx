import { Link } from 'react-router-dom';
import { SubpageHeader } from '@/components/ui/SubpageHeader';

export function AdminExercisesPage() {
  return (
    <>
      <SubpageHeader fallbackTo="/home" title="Exercise library admin" backLabel="Back to home" />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header className="border-b border-(--border) pb-4">
        <p className="text-sm text-(--text)">
          Create exercises for the shared catalog. Deleting is available from each exercise&apos;s
          detail page.
        </p>
      </header>
      <ul className="flex flex-col gap-2 text-base">
        <li>
          <Link
            to="/admin/exercises/new"
            className="font-medium text-(--accent) underline-offset-2 hover:underline"
          >
            Add exercise
          </Link>
        </li>
        <li>
          <Link to="/exercises" className="font-medium text-(--accent) underline-offset-2 hover:underline">
            Browse catalog
          </Link>
        </li>
      </ul>
      </div>
    </>
  );
}
