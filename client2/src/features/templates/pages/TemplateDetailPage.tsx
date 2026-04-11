import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useConfirm } from '@/components/ConfirmProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { useAuth } from '@/features/auth/useAuth';
import { isFromLibraryState, libraryLocationState } from '@/lib/libraryNav';
import { cn, errorMessageFromUnknown } from '@/lib/utils';
import { deleteTemplate, fetchTemplateById, templateQueryKeys } from '../api';
import { TemplateMetadataChips } from '../components/TemplateMetadataChips';
import type { TemplateWorkout, TemplateWorkoutExercise } from '../types';

export function TemplateDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const fromLibrary = isFromLibraryState(location.state);
  const { id } = useParams<{ id: string }>();
  const templateId = id ?? '';
  const backFallback = fromLibrary ? '/library' : '/templates';
  const backLabel = fromLibrary ? 'Back to library' : 'Back to templates';

  const query = useQuery({
    queryKey: templateQueryKeys.detail(templateId),
    queryFn: () => fetchTemplateById(templateId),
    enabled: Boolean(templateId),
    staleTime: 1000 * 60 * 5,
  });

  const delTemplate = useMutation({
    mutationFn: () => deleteTemplate(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateQueryKeys.all });
      navigate(backFallback, { state: fromLibrary ? libraryLocationState : undefined });
    },
  });

  if (!templateId) {
    return (
      <>
        <SubpageHeader fallbackTo={backFallback} title="Templates" backLabel={backLabel} />
        <PageContainer className="py-8">
          <p className="text-sm text-(--text)">Missing template id.</p>
        </PageContainer>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        <SubpageHeader fallbackTo={backFallback} title="Templates" backLabel={backLabel} />
        <PageContainer className="py-8">
          <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        </PageContainer>
      </>
    );
  }

  if (query.isPending || !query.data) {
    return (
      <>
        <SubpageHeader fallbackTo={backFallback} title="Template" backLabel={backLabel} />
        <PageContainer className="py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </PageContainer>
      </>
    );
  }

  const t = query.data;
  const workouts = [...t.workouts].sort((a, b) => a.dayNumber - b.dayNumber);
  const isOwner = Boolean(user?.id && t.createdByUserId && t.createdByUserId === user.id);
  const fromTemplateHref = `/programs/from-template?templateId=${encodeURIComponent(t.id)}`;
  const editHref = `/templates/${encodeURIComponent(t.id)}/edit`;

  return (
    <>
      <SubpageHeader fallbackTo={backFallback} title={t.name} backLabel={backLabel} />
      <PageContainer className="gap-6 py-8">
        <header className="flex flex-col gap-4">
          {t.description ? (
            <p className="text-sm leading-relaxed text-(--text)">{t.description}</p>
          ) : null}
          <TemplateMetadataChips goal={t.goal} difficulty={t.difficulty} splitType={t.splitType} />
          <p className="text-sm text-(--text)">
            {t.daysPerWeek} days per week · Created {new Date(t.createdAt).toLocaleDateString()}
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                to={fromTemplateHref}
                className={cn(
                  'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-(--text-h) px-4 py-2.5 text-base font-medium text-(--bg) hover:opacity-90',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                  'sm:min-w-[min(100%,12rem)] sm:flex-none',
                )}
              >
                Start program from template
              </Link>
              {isOwner ? (
                <Link
                  to={editHref}
                  {...(fromLibrary ? { state: libraryLocationState } : {})}
                  className={cn(
                    'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg)',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                    'sm:min-w-[min(100%,12rem)] sm:flex-none',
                  )}
                >
                  Edit template
                </Link>
              ) : null}
            </div>
          ) : null}
          {isOwner ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="w-full border-red-600/50 text-red-700 sm:w-auto"
                disabled={delTemplate.isPending}
                onClick={async () => {
                  const ok = await confirm('Delete this template permanently?', {
                    confirmLabel: 'Delete',
                    cancelLabel: 'Cancel',
                  });
                  if (ok) delTemplate.mutate();
                }}
              >
                {delTemplate.isPending ? 'Deleting…' : 'Delete template'}
              </Button>
              {delTemplate.isError ? (
                <p className="text-sm text-red-600" role="alert">
                  {errorMessageFromUnknown(delTemplate.error)}
                </p>
              ) : null}
            </>
          ) : null}
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-(--text-h)">Workouts</h2>
          <div className="flex flex-col gap-4">
            {workouts.map((w) => (
              <ReadOnlyTemplateWorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

function ReadOnlyTemplateWorkoutCard({ workout: w }: { workout: TemplateWorkout }) {
  const exercises = [...w.exercises].sort((a, b) => a.order - b.order);

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
            <TemplateExerciseReadRow key={slot.id} slot={slot} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TemplateExerciseReadRow({ slot }: { slot: TemplateWorkoutExercise }) {
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
      {slot.notes ? <p className="text-xs text-(--text)">{slot.notes}</p> : null}
    </li>
  );
}
