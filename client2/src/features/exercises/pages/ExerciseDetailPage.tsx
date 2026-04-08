import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { formatEnumLabel, formatEnumList } from '@/lib/formatEnumLabel';
import { isFromLibraryState, libraryLocationState } from '@/lib/libraryNav';
import { errorMessageFromUnknown } from '@/lib/utils';
import { exercisePerformanceQueryKeys } from '@/features/exercise-performance/api';
import { useCurrentUser } from '@/features/users/useCurrentUser';
import { exerciseQueryKeys, deleteExercise, fetchExerciseById } from '../api';

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exerciseId = id ?? '';
  const location = useLocation();
  const fromLibrary = isFromLibraryState(location.state);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useCurrentUser();

  const query = useQuery({
    queryKey: exerciseQueryKeys.detail(exerciseId),
    queryFn: () => fetchExerciseById(exerciseId),
    enabled: Boolean(exerciseId),
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteExercise(exerciseId),
    onSuccess: async () => {
      qc.removeQueries({
        queryKey: exercisePerformanceQueryKeys.detail(exerciseId),
        exact: true,
      });
      await qc.invalidateQueries({ queryKey: exerciseQueryKeys.all });
      navigate('/exercises', { state: fromLibrary ? libraryLocationState : undefined });
    },
  });

  const isAdmin = me.data?.role === 'admin';

  const exercisesFallback = fromLibrary ? '/library' : '/exercises';

  if (!exerciseId) {
    return (
      <>
        <SubpageHeader
          fallbackTo={exercisesFallback}
          title="Exercises"
          backLabel={fromLibrary ? 'Back to library' : 'Back to exercises'}
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Missing exercise id.</p>
        </div>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        <SubpageHeader
          fallbackTo={exercisesFallback}
          title="Exercises"
          backLabel={fromLibrary ? 'Back to library' : 'Back to exercises'}
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        </div>
      </>
    );
  }

  if (query.isPending) {
    return (
      <>
        <SubpageHeader
          fallbackTo={exercisesFallback}
          title="Exercise"
          backLabel={fromLibrary ? 'Back to library' : 'Back to exercises'}
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </div>
      </>
    );
  }

  const ex = query.data;

  return (
    <>
      <SubpageHeader
        fallbackTo={exercisesFallback}
        title={ex.name}
        backLabel={fromLibrary ? 'Back to library' : 'Back to exercises'}
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3">
        <div>
          <p className="text-sm text-(--text)">
            {formatEnumLabel(ex.primaryMuscle)} · {formatEnumLabel(ex.equipment)} ·{' '}
            {formatEnumLabel(ex.category)}
          </p>
          <p className="mt-1 text-sm text-(--text)">
            Pattern: {formatEnumLabel(ex.movementPattern)}
          </p>
        </div>
      </header>
      {ex.secondaryMuscles.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-(--text-h)">Secondary muscles</h2>
          <p className="mt-1 text-sm text-(--text)">{formatEnumList(ex.secondaryMuscles)}</p>
        </section>
      ) : null}
      {ex.instructions ? (
        <section>
          <h2 className="text-sm font-medium text-(--text-h)">Instructions</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-(--text)">{ex.instructions}</p>
        </section>
      ) : null}
      <div>
        <Link
          to={`/exercises/${encodeURIComponent(exerciseId)}/progress`}
          className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) transition-opacity hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
        >
          History &amp; PRs
        </Link>
      </div>

      {isAdmin ? (
        <section className="rounded-xl border border-(--border) bg-(--code-bg)/30 p-4">
          <h2 className="text-sm font-medium text-(--text-h)">Library admin</h2>
          <p className="mt-1 text-sm text-(--text)">
            Delete removes this exercise from the catalog. Some system rows cannot be removed.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-red-600/50 bg-transparent px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-600/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (
                typeof window !== 'undefined' &&
                !window.confirm(`Delete “${ex.name}” from the library? This cannot be undone.`)
              ) {
                return;
              }
              deleteMutation.mutate();
            }}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete exercise'}
          </button>
          {deleteMutation.isError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errorMessageFromUnknown(deleteMutation.error)}
            </p>
          ) : null}
        </section>
      ) : null}
      </div>
    </>
  );
}
