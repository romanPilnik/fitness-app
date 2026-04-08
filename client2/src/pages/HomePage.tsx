import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/features/auth/useAuth';
import { fetchActivePrograms, programQueryKeys } from '@/features/programs/api';
import { WorkoutCalendar } from '@/features/sessions/components/WorkoutCalendar';
import { fetchSessionsPage, sessionQueryKeys } from '@/features/sessions/api';

export function HomePage() {
  const { user } = useAuth();

  const activeProgramsQuery = useQuery({
    queryKey: programQueryKeys.active(),
    queryFn: fetchActivePrograms,
    staleTime: 60_000,
  });

  const recentSessionsQuery = useQuery({
    queryKey: sessionQueryKeys.list('dashboard-preview', {}),
    queryFn: () => fetchSessionsPage({ limit: 5 }),
    staleTime: 30_000,
  });

  const recentSessions = recentSessionsQuery.data?.data ?? [];

  const primaryBtn =
    'inline-flex min-h-11 items-center justify-center rounded-lg bg-(--text-h) px-4 py-2.5 text-sm font-medium text-(--bg) hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)';
  const secondaryBtn =
    'inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-sm font-medium text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)';
  const sectionHead = 'flex items-center justify-between gap-2';
  const sectionTitle = 'text-xs font-medium uppercase tracking-[0.1em] text-(--text)';
  const sectionLink =
    'text-xs font-medium uppercase tracking-wider text-(--text-h) underline-offset-4 hover:underline';
  const list = 'flex flex-col gap-2';
  const card =
    'block rounded-lg border border-(--border) px-4 py-3 transition-colors hover:bg-(--code-bg)';
  const cardTitle = 'text-sm font-medium text-(--text-h)';
  const cardMeta = 'mt-0.5 text-xs capitalize text-(--text)';
  const loading = 'text-sm text-(--text)';
  const btnGroup = 'flex flex-col gap-2 sm:flex-row sm:flex-wrap';

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-10">
      <header className="pb-2">
        <h1 className="text-2xl font-medium text-(--text-h)">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
      </header>

      <WorkoutCalendar />

      <section className="flex flex-col gap-4">
        <div className={sectionHead}>
          <h2 className={sectionTitle}>Active programs</h2>
          <Link to="/programs" className={sectionLink}>
            All →
          </Link>
        </div>
        {activeProgramsQuery.isError ? (
          <QueryErrorMessage
            error={activeProgramsQuery.error}
            refetch={() => activeProgramsQuery.refetch()}
          />
        ) : activeProgramsQuery.isPending ? (
          <p className={loading}>Loading programs…</p>
        ) : activeProgramsQuery.data.length === 0 ? (
          <EmptyState
            title="No active program"
            description="Start from a template, create a custom program, or open an existing program and set its status to active."
            action={
              <div className={btnGroup}>
                <Link to="/programs/new" className={primaryBtn}>
                  New program
                </Link>
                <Link to="/templates" className={secondaryBtn}>
                  Browse templates
                </Link>
                <Link to="/programs" className={secondaryBtn}>
                  My programs
                </Link>
              </div>
            }
          />
        ) : (
          <ul className={list}>
            {activeProgramsQuery.data.map((p) => (
              <li key={p.id}>
                <Link to={`/programs/${p.id}`} className={card}>
                  <span className={cardTitle}>{p.name}</span>
                  <p className={cardMeta}>
                    {p.goal} · {p.difficulty} · {p.programWorkouts.length} workouts
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className={sectionHead}>
          <h2 className={sectionTitle}>Recent sessions</h2>
          <Link to="/sessions" className={sectionLink}>
            All →
          </Link>
        </div>
        {recentSessionsQuery.isError ? (
          <QueryErrorMessage
            error={recentSessionsQuery.error}
            refetch={() => recentSessionsQuery.refetch()}
          />
        ) : recentSessionsQuery.isPending ? (
          <p className={loading}>Loading sessions…</p>
        ) : recentSessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Start a workout from a program day, or open Sessions and start a log."
            action={
              <Link to="/sessions/start" className={primaryBtn}>
                Start workout
              </Link>
            }
          />
        ) : (
          <ul className={list}>
            {recentSessions.map((s_) => (
              <li key={s_.id}>
                <Link to={`/sessions/${s_.id}`} className={card}>
                  <span className={cardTitle}>{s_.workoutName}</span>
                  <p className={cardMeta}>
                    {new Date(s_.datePerformed).toLocaleString()} · {s_.sessionStatus} ·{' '}
                    {Math.round(s_.sessionDuration)} min
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
