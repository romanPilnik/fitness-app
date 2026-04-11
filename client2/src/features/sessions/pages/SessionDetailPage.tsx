import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { errorMessageFromUnknown } from '@/lib/utils';
import { exercisePerformanceQueryKeys } from '@/features/exercise-performance/api';
import { deleteSession, fetchSessionById, sessionQueryKeys } from '../api';

type SessionDetailLocationState = {
  from?: 'exercise-progress';
  exerciseId?: string;
} | null;

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = id ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const backState = location.state as SessionDetailLocationState;
  const sessionBackFallback =
    backState?.from === 'exercise-progress' && backState.exerciseId
      ? `/exercises/${backState.exerciseId}/progress`
      : '/sessions';
  const sessionBackLabel =
    backState?.from === 'exercise-progress'
      ? 'Back to history and PRs'
      : 'Back to sessions';

  const query = useQuery({
    queryKey: sessionQueryKeys.detail(sessionId),
    queryFn: () => fetchSessionById(sessionId),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60,
  });

  const del = useMutation({
    mutationFn: () => deleteSession(sessionId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: sessionQueryKeys.all }),
        qc.invalidateQueries({ queryKey: exercisePerformanceQueryKeys.all }),
      ]);
      navigate('/sessions', { replace: true });
    },
  });

  if (!sessionId) {
    return (
      <>
        <SubpageHeader
          fallbackTo={sessionBackFallback}
          backLabel={sessionBackLabel}
          title="Sessions"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Missing session id.</p>
        </div>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        <SubpageHeader
          fallbackTo={sessionBackFallback}
          backLabel={sessionBackLabel}
          title="Sessions"
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
          fallbackTo={sessionBackFallback}
          backLabel={sessionBackLabel}
          title="Session"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </div>
      </>
    );
  }

  const s = query.data;
  const exercises = [...s.sessionExercises].sort((a, b) => a.order - b.order);

  return (
    <>
      <SubpageHeader
        fallbackTo={sessionBackFallback}
        backLabel={sessionBackLabel}
        title={s.workoutName}
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm capitalize text-(--text)">
          Day {s.dayNumber} · {s.sessionStatus} · {Math.round(s.sessionDuration)} min
        </p>
        <p className="text-sm text-(--text)">{new Date(s.datePerformed).toLocaleString()}</p>
        {s.program ? (
          <p className="text-sm text-(--text)">
            Program:{' '}
            <Link
              to={`/programs/${s.program.id}`}
              className="font-medium text-(--accent) underline-offset-2 hover:underline"
            >
              {s.program.name}
            </Link>
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="border-red-600/50 text-red-700"
          disabled={del.isPending}
          onClick={() => {
            if (window.confirm('Delete this session permanently? This cannot be undone.')) {
              del.mutate();
            }
          }}
        >
          {del.isPending ? 'Deleting…' : 'Delete session'}
        </Button>
      </div>
      {del.isError ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessageFromUnknown(del.error)}
        </p>
      ) : null}

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-medium text-(--text-h)">Exercises</h2>
        {exercises.map((row) => (
          <div key={row.id} className="rounded-xl border border-(--border) bg-(--bg) p-4">
            <h3 className="font-medium text-(--text-h)">
              <Link
                to={`/exercises/${row.exerciseId}`}
                className="text-(--accent) underline-offset-2 hover:underline"
              >
                {row.exercise.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-(--text)">Target: {row.targetSets} sets</p>
            <ul className="mt-3 space-y-2 border-t border-(--border) pt-3 text-sm text-(--text)">
              {row.sessionExerciseSets.map((set, idx) => {
                const rir = typeof set.rir === 'number' ? set.rir : 0;
                return (
                  <li key={set.id}>
                    Set {idx + 1}: {set.reps} reps @ {set.weight} · RIR {rir}
                    {set.setCompleted ? '' : ' (incomplete)'}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <div className="border-t border-(--border) pt-8">
        <Button
          type="button"
          className="w-full"
          onClick={() => navigate('/home', { replace: true })}
        >
          Back to home
        </Button>
      </div>
      </div>
    </>
  );
}
