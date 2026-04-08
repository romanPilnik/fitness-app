import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { cn } from '@/lib/utils';
import { fetchProgramById, programQueryKeys } from '../api';
import { ProgramMetadataChips } from '../components/ProgramMetadataChips';
import type { ProgramWorkout, ProgramWorkoutExercise } from '../types';

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const programId = id ?? '';

  const query = useQuery({
    queryKey: programQueryKeys.detail(programId),
    queryFn: () => fetchProgramById(programId),
    enabled: Boolean(programId),
    staleTime: 1000 * 60,
  });

  if (!programId) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Programs" backLabel="Back to programs" />
        <PageContainer className="py-8">
          <p className="text-sm text-(--text)">Missing program id.</p>
        </PageContainer>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Programs" backLabel="Back to programs" />
        <PageContainer className="py-8">
          <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        </PageContainer>
      </>
    );
  }

  if (query.isPending || !query.data) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Program" backLabel="Back to programs" />
        <PageContainer className="py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </PageContainer>
      </>
    );
  }

  const p = query.data;
  const workouts = [...p.programWorkouts].sort((a, b) => a.dayNumber - b.dayNumber);
  const startWorkoutHref = `/sessions/start?programId=${encodeURIComponent(programId)}`;
  const editHref = `/programs/${encodeURIComponent(programId)}/edit`;

  return (
    <>
      <SubpageHeader fallbackTo="/programs" title={p.name} backLabel="Back to programs" />
      <PageContainer className="gap-6 py-8">
        <header className="flex flex-col gap-4">
          {p.description ? (
            <p className="text-sm leading-relaxed text-(--text)">{p.description}</p>
          ) : null}
          <ProgramMetadataChips
            status={p.status}
            goal={p.goal}
            difficulty={p.difficulty}
            splitType={p.splitType}
          />
          <p className="text-sm text-(--text)">
            {p.daysPerWeek} days per week · Started {new Date(p.startDate).toLocaleDateString()}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              to={startWorkoutHref}
              className={cn(
                'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-(--text-h) px-4 py-2.5 text-base font-medium text-(--bg) hover:opacity-90',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                'sm:min-w-[min(100%,12rem)] sm:flex-none',
              )}
            >
              Start workout
            </Link>
            <Link
              to={editHref}
              className={cn(
                'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg)',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                'sm:min-w-[min(100%,12rem)] sm:flex-none',
              )}
            >
              Edit program
            </Link>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-(--text-h)">Workouts</h2>
          <div className="flex flex-col gap-4">
            {workouts.map((w) => (
              <ReadOnlyWorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

function ReadOnlyWorkoutCard({ workout: w }: { workout: ProgramWorkout }) {
  const exercises = [...w.programWorkoutExercises].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
      <h3 className="font-medium text-(--text-h)">
        Day {w.dayNumber}: {w.name}
      </h3>
      {exercises.length === 0 ? (
        <p className="mt-3 text-sm text-(--text)">No exercises in this day yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-(--border) border-t border-(--border)">
          {exercises.map((slot) => (
            <ExerciseReadRow key={slot.id} slot={slot} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ExerciseReadRow({ slot }: { slot: ProgramWorkoutExercise }) {
  const exerciseTitle = slot.exercise?.name ?? 'Exercise';
  return (
    <li className="flex flex-col gap-1 py-3 first:pt-3">
      <Link
        to={`/exercises/${slot.exerciseId}`}
        className="font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        {exerciseTitle}
      </Link>
      <p className="text-sm text-(--text)">
        {slot.targetSets} sets
        {slot.targetWeight != null ? ` · target ${slot.targetWeight}` : ''}
      </p>
    </li>
  );
}
