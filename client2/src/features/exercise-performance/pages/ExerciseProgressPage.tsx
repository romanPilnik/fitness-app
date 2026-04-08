import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { exercisePerformanceQueryKeys, fetchExercisePerformance } from '../api';
import type {
  ExercisePerformanceHistoryRow,
  ExercisePerformanceLastPerformed,
  ExercisePerformancePersonalRecord,
} from '../types';

function formatSessionWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-(--text)">{label}</dt>
      <dd className="m-0 text-right font-medium text-(--text-h)">{value}</dd>
    </div>
  );
}

function LastPerformedCard({ row }: { row: ExercisePerformanceLastPerformed }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
      <h2 className="text-sm font-medium text-(--text-h)">Last performed</h2>
      <dl className="mt-3 flex flex-col gap-2">
        <StatLine label="When" value={formatSessionWhen(row.datePerformed)} />
        <StatLine label="Workout" value={row.workoutName} />
        <StatLine label="Top set" value={`${row.topSetWeight} × ${row.topSetReps}`} />
        <StatLine label="Sets" value={String(row.totalSets)} />
      </dl>
      <Link
        to={`/sessions/${row.sessionId}`}
        className="mt-4 inline-block text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        Open session
      </Link>
    </div>
  );
}

function PRCard({ pr }: { pr: ExercisePerformancePersonalRecord }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
      <h2 className="text-sm font-medium text-(--text-h)">Personal record</h2>
      <p className="mt-2 text-lg font-medium text-(--text-h)">
        {pr.weight} × {pr.reps}
      </p>
      <p className="mt-1 text-sm text-(--text)">{formatSessionWhen(pr.datePerformed)}</p>
      <Link
        to={`/sessions/${pr.sessionId}`}
        className="mt-3 inline-block text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        Open session
      </Link>
    </div>
  );
}

function HistoryRowMobile({ row }: { row: ExercisePerformanceHistoryRow }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--bg) px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-(--text-h)">{row.workoutName}</p>
          <p className="mt-0.5 text-sm text-(--text)">{formatSessionWhen(row.datePerformed)}</p>
        </div>
        <span className="shrink-0 text-sm font-medium text-(--text-h)">
          {row.topSetWeight} × {row.topSetReps}
        </span>
      </div>
      <p className="mt-2 text-sm text-(--text)">{row.totalSets} sets</p>
      <Link
        to={`/sessions/${row.sessionId}`}
        className="mt-2 inline-block text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        Session
      </Link>
    </div>
  );
}

function HistoryTable({ rows }: { rows: ExercisePerformanceHistoryRow[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-lg border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-(--border) text-(--text)">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Workout</th>
            <th className="py-2 pr-4 font-medium">Top set</th>
            <th className="py-2 pr-4 font-medium">Sets</th>
            <th className="py-2 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sessionId} className="border-b border-(--border)/80">
              <td className="py-2 pr-4 align-top text-(--text)">
                {formatSessionWhen(row.datePerformed)}
              </td>
              <td className="py-2 pr-4 align-top text-(--text-h)">{row.workoutName}</td>
              <td className="py-2 pr-4 align-top text-(--text-h)">
                {row.topSetWeight} × {row.topSetReps}
              </td>
              <td className="py-2 pr-4 align-top text-(--text)">{row.totalSets}</td>
              <td className="py-2 align-top">
                <Link
                  to={`/sessions/${row.sessionId}`}
                  className="font-medium text-(--accent) underline-offset-2 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExerciseProgressPage() {
  const { id } = useParams<{ id: string }>();
  const exerciseId = id ?? '';

  const query = useQuery({
    queryKey: exercisePerformanceQueryKeys.detail(exerciseId),
    queryFn: () => fetchExercisePerformance(exerciseId),
    enabled: Boolean(exerciseId),
    staleTime: 1000 * 60 * 2,
  });

  const exerciseDetailPath = `/exercises/${encodeURIComponent(exerciseId)}`;

  if (!exerciseId) {
    return (
      <>
        <SubpageHeader fallbackTo="/exercises" title="Exercises" backLabel="Back to exercises" />
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
          fallbackTo={exerciseDetailPath}
          title="Progress"
          backLabel="Back to exercise"
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
          fallbackTo={exerciseDetailPath}
          title="Progress"
          backLabel="Back to exercise"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </div>
      </>
    );
  }

  const data = query.data;
  if (!data) {
    return null;
  }

  const ex = data.exercise;

  return (
    <>
      <SubpageHeader
        fallbackTo={exerciseDetailPath}
        title="Progress"
        backLabel="Back to exercise"
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-xl font-medium text-(--text-h)">{ex.name}</p>
        <p className="mt-1 text-sm text-(--text)">
          {formatEnumLabel(ex.primaryMuscle)} · {formatEnumLabel(ex.equipment)}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {data.lastPerformed ? (
          <LastPerformedCard row={data.lastPerformed} />
        ) : (
          <div className="rounded-xl border border-dashed border-(--border) bg-(--bg) p-4">
            <h2 className="text-sm font-medium text-(--text-h)">Last performed</h2>
            <p className="mt-2 text-sm text-(--text)">No sessions logged for this exercise yet.</p>
          </div>
        )}
        {data.personalRecord ? (
          <PRCard pr={data.personalRecord} />
        ) : (
          <div className="rounded-xl border border-dashed border-(--border) bg-(--bg) p-4">
            <h2 className="text-sm font-medium text-(--text-h)">Personal record</h2>
            <p className="mt-2 text-sm text-(--text)">Log a session to track your best set.</p>
          </div>
        )}
      </div>

      <section>
        <h2 className="text-sm font-medium text-(--text-h)">Recent history</h2>
        {data.recentHistory.length === 0 ? (
          <p className="mt-2 text-sm text-(--text)">No history yet.</p>
        ) : (
          <>
            <ul className="mt-3 flex flex-col gap-2 md:hidden">
              {data.recentHistory.map((row) => (
                <li key={row.sessionId}>
                  <HistoryRowMobile row={row} />
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <HistoryTable rows={data.recentHistory} />
            </div>
          </>
        )}
      </section>
      </div>
    </>
  );
}
