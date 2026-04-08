import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { errorMessageFromUnknown } from '@/lib/utils';
import { exercisePerformanceQueryKeys } from '@/features/exercise-performance/api';
import { deleteSession, fetchSessionById, sessionQueryKeys } from '../api';

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = id ?? '';
  const navigate = useNavigate();
  const qc = useQueryClient();

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
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="text-sm text-(--text)">Missing session id.</p>
        <Link to="/sessions" className="mt-4 inline-block text-sm font-medium text-(--accent)">
          Back to sessions
        </Link>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        <Link to="/sessions" className="mt-4 inline-block text-sm font-medium text-(--accent)">
          Back to sessions
        </Link>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="text-sm text-(--text)">Loading…</p>
      </div>
    );
  }

  const s = query.data;
  const exercises = [...s.sessionExercises].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link
        to="/sessions"
        className="text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        ← Sessions
      </Link>
      <header>
        <h1 className="text-2xl font-medium text-(--text-h)">{s.workoutName}</h1>
        <p className="mt-2 text-sm capitalize text-(--text)">
          Day {s.dayNumber} · {s.sessionStatus} · {Math.round(s.sessionDuration)} min
        </p>
        <p className="mt-1 text-sm text-(--text)">{new Date(s.datePerformed).toLocaleString()}</p>
        {s.program ? (
          <p className="mt-2 text-sm text-(--text)">
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
              {row.sessionExerciseSets.map((set, idx) => (
                <li key={set.id}>
                  Set {idx + 1}: {set.reps} reps @ {set.weight}
                  {typeof set.rir === 'number' ? ` · RIR ${set.rir}` : ''}
                  {set.setCompleted ? '' : ' (incomplete)'}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
