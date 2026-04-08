import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';
import { fetchTemplateById, templateQueryKeys } from '../api';

export function TemplateDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const templateId = id ?? '';

  const query = useQuery({
    queryKey: templateQueryKeys.detail(templateId),
    queryFn: () => fetchTemplateById(templateId),
    enabled: Boolean(templateId),
    staleTime: 1000 * 60 * 5,
  });

  if (!templateId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="text-sm text-(--text)">Missing template id.</p>
        <Link to="/templates" className="mt-4 inline-block text-sm font-medium text-(--accent)">
          Back to templates
        </Link>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        <Link to="/templates" className="mt-4 inline-block text-sm font-medium text-(--accent)">
          Back to templates
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

  const t = query.data;
  const workouts = [...t.workouts].sort((a, b) => a.dayNumber - b.dayNumber);
  const isOwner = Boolean(user?.id && t.createdByUserId && t.createdByUserId === user.id);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link
        to="/templates"
        className="text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        ← Templates
      </Link>
      <header>
        <h1 className="text-2xl font-medium text-(--text-h)">{t.name}</h1>
        {t.description ? <p className="mt-2 text-sm text-(--text)">{t.description}</p> : null}
        <p className="mt-2 text-sm text-(--text)">
          {t.daysPerWeek} days per week · {t.difficulty} · {t.goal} · {t.splitType}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {isAuthenticated ? (
            <Link
              to={`/programs/from-template?templateId=${encodeURIComponent(t.id)}`}
              className={cn(
                'inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 text-base font-medium text-(--text-h) hover:bg-(--code-bg)',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
              )}
            >
              Start program from template
            </Link>
          ) : null}
          {isAuthenticated && isOwner ? (
            <Link
              to={`/templates/${t.id}/edit`}
              className={cn(
                'inline-flex min-h-11 items-center justify-center rounded-lg bg-(--text-h) px-4 text-base font-medium text-(--bg) hover:opacity-90',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
              )}
            >
              Edit template
            </Link>
          ) : null}
        </div>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-medium text-(--text-h)">Workouts</h2>
        {workouts.map((w) => (
          <div key={w.id} className="rounded-xl border border-(--border) bg-(--bg) p-4">
            <h3 className="font-medium text-(--text-h)">
              Day {w.dayNumber}: {w.name}
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-(--text)">
              {[...w.exercises]
                .sort((a, b) => a.order - b.order)
                .map((slot) => (
                  <li key={slot.id}>
                    <Link
                      to={`/exercises/${slot.exerciseId}`}
                      className="font-medium text-(--accent) underline-offset-2 hover:underline"
                    >
                      {slot.exercise?.name ?? slot.exerciseId}
                    </Link>
                    <span className="text-(--text)"> — {slot.targetSets} sets</span>
                    {slot.notes ? (
                      <p className="mt-0.5 text-xs text-(--text)">{slot.notes}</p>
                    ) : null}
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}
