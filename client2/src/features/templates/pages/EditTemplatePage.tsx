import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm, useFormState, type Resolver, type UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { isFromLibraryState, libraryLocationState } from '@/lib/libraryNav';
import { errorMessageFromUnknown } from '@/lib/utils';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import { useConfirmLeaveWhenDirty } from '@/hooks/useConfirmLeaveWhenDirty';
import { deleteTemplate, fetchTemplateById, templateQueryKeys, updateTemplate } from '../api';
import { templateFormSchema, type TemplateForm } from '../schemas';

export function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const templateId = id ?? '';
  const location = useLocation();
  const fromLibrary = isFromLibraryState(location.state);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: templateQueryKeys.detail(templateId),
    queryFn: () => fetchTemplateById(templateId),
    enabled: Boolean(templateId),
  });

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateFormSchema) as Resolver<TemplateForm>,
    defaultValues: {
      name: '',
      description: '',
      daysPerWeek: 3,
      difficulty: 'beginner',
      goal: 'hypertrophy',
      splitType: 'full_body',
      workouts: [
        {
          name: 'Day 1',
          dayNumber: 1,
          exercises: [{ exerciseId: '', order: 1, targetSets: 3 }],
        },
      ],
    },
  });

  const { isDirty } = useFormState({ control: form.control });
  const prepareLeave = useConfirmLeaveWhenDirty(isDirty);

  useEffect(() => {
    if (!q.data) return;
    const t = q.data;
    form.reset({
      name: t.name,
      description: t.description ?? '',
      daysPerWeek: t.daysPerWeek,
      difficulty: t.difficulty as TemplateForm['difficulty'],
      goal: t.goal as TemplateForm['goal'],
      splitType: t.splitType as TemplateForm['splitType'],
      workouts: [...t.workouts]
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((w) => ({
          name: w.name,
          dayNumber: w.dayNumber,
          exercises: [...w.exercises]
            .sort((a, b) => a.order - b.order)
            .map((e) => ({
              exerciseId: e.exerciseId,
              order: e.order,
              targetSets: e.targetSets,
              notes: e.notes ?? '',
            })),
        })),
    });
  }, [q.data, form]);

  const workoutsFA = useFieldArray({
    control: form.control,
    name: 'workouts',
  });

  const save = useMutation({
    mutationFn: (body: Parameters<typeof updateTemplate>[1]) => updateTemplate(templateId, body),
    onSuccess: () => {
      prepareLeave();
      qc.invalidateQueries({ queryKey: templateQueryKeys.detail(templateId) });
      qc.invalidateQueries({ queryKey: templateQueryKeys.all });
      navigate(`/templates/${templateId}`, {
        state: fromLibrary ? libraryLocationState : undefined,
      });
    },
  });

  const del = useMutation({
    mutationFn: () => deleteTemplate(templateId),
    onSuccess: () => {
      prepareLeave();
      qc.invalidateQueries({ queryKey: templateQueryKeys.all });
      navigate('/templates', { state: fromLibrary ? libraryLocationState : undefined });
    },
  });

  if (!templateId) {
    return (
      <>
        <SubpageHeader fallbackTo="/templates" title="Templates" backLabel="Back to templates" />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Missing template id.</p>
        </div>
      </>
    );
  }

  if (q.isError) {
    return (
      <>
        <SubpageHeader
          fallbackTo={`/templates/${templateId}`}
          fallbackState={fromLibrary ? libraryLocationState : undefined}
          title="Edit template"
          backLabel="Back to template"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <QueryErrorMessage error={q.error} refetch={() => q.refetch()} />
        </div>
      </>
    );
  }

  if (q.isPending) {
    return (
      <>
        <SubpageHeader
          fallbackTo={`/templates/${templateId}`}
          fallbackState={fromLibrary ? libraryLocationState : undefined}
          title="Edit template"
          backLabel="Back to template"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SubpageHeader
        fallbackTo={`/templates/${templateId}`}
        fallbackState={fromLibrary ? libraryLocationState : undefined}
        title="Edit template"
        backLabel="Back to template"
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">

      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await save.mutateAsync({
              name: values.name.trim(),
              description: values.description?.trim() || undefined,
              daysPerWeek: values.daysPerWeek,
              difficulty: values.difficulty,
              goal: values.goal,
              splitType: values.splitType,
              workouts: values.workouts.map((w) => ({
                name: w.name.trim(),
                dayNumber: w.dayNumber,
                exercises: w.exercises.map((ex, ei) => ({
                  exerciseId: ex.exerciseId,
                  order: ex.order ?? ei + 1,
                  targetSets: ex.targetSets,
                  notes: ex.notes?.trim() || undefined,
                })),
              })),
            });
          } catch (e) {
            if (e instanceof ApiError) {
              if (
                e.code === API_VALIDATION_ERROR_CODE &&
                applyApiValidationErrors(e, form.setError)
              ) {
                save.reset();
                return;
              }
              save.reset();
              form.setError('root', {
                type: 'server',
                message: e.message,
              });
              return;
            }
            save.reset();
            form.setError('root', {
              type: 'server',
              message: errorMessageFromUnknown(e),
            });
          }
        })}
      >
        <section className="flex flex-col gap-3 rounded-xl border border-(--border) p-4">
          <input
            className="min-h-11 rounded-lg border border-(--border) px-3 text-base"
            {...form.register('name')}
          />
          <textarea
            rows={2}
            className="rounded-lg border border-(--border) px-3 py-2"
            {...form.register('description')}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              max={14}
              className="min-h-11 rounded-lg border px-3"
              {...form.register('daysPerWeek')}
            />
            <select className="min-h-11 rounded-lg border px-2" {...form.register('difficulty')}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <select className="min-h-11 rounded-lg border px-2" {...form.register('goal')}>
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="endurance">Endurance</option>
          </select>
          <select className="min-h-11 rounded-lg border px-2" {...form.register('splitType')}>
            <option value="full_body">Full body</option>
            <option value="push_pull_legs">Push / pull / legs</option>
            <option value="upper_lower">Upper / lower</option>
            <option value="arnold">Arnold</option>
            <option value="modified_full_body">Modified full body</option>
            <option value="other">Other</option>
          </select>
        </section>

        {workoutsFA.fields.map((wf, wi) => (
          <TemplateWorkoutBlock
            key={wf.id}
            wi={wi}
            form={form}
            onRemove={() => workoutsFA.remove(wi)}
            canRemove={workoutsFA.fields.length > 1}
          />
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            workoutsFA.append({
              name: `Day ${workoutsFA.fields.length + 1}`,
              dayNumber: workoutsFA.fields.length + 1,
              exercises: [{ exerciseId: '', order: 1, targetSets: 3 }],
            })
          }
        >
          Add workout day
        </Button>

        {form.formState.errors.root?.message ||
        (save.isError ? errorMessageFromUnknown(save.error) : null) ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (save.isError ? errorMessageFromUnknown(save.error) : undefined)}
          </p>
        ) : null}

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save template'}
        </Button>
      </form>

      <Button
        type="button"
        variant="secondary"
        className="border-red-600/50 text-red-700"
        disabled={del.isPending}
        onClick={() => {
          if (window.confirm('Delete this template permanently?')) del.mutate();
        }}
      >
        {del.isPending ? 'Deleting…' : 'Delete template'}
      </Button>
      </div>
    </>
  );
}

function TemplateWorkoutBlock({
  wi,
  form,
  onRemove,
  canRemove,
}: {
  wi: number;
  form: UseFormReturn<TemplateForm, unknown, TemplateForm>;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const exercisesFA = useFieldArray({
    control: form.control,
    name: `workouts.${wi}.exercises`,
  });

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-(--border) p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-(--text-h)">Workout {wi + 1}</h2>
        {canRemove ? (
          <Button type="button" variant="secondary" onClick={onRemove}>
            Remove day
          </Button>
        ) : null}
      </div>
      <input
        className="min-h-11 rounded-lg border px-3"
        {...form.register(`workouts.${wi}.name`)}
      />
      <input
        type="number"
        min={1}
        max={14}
        className="min-h-11 rounded-lg border px-3"
        {...form.register(`workouts.${wi}.dayNumber`)}
      />

      {exercisesFA.fields.map((ef, ei) => (
        <div key={ef.id} className="flex flex-col gap-2 rounded-lg border border-(--border) p-3">
          <ExerciseIdSelect
            id={`edit-tmpl-ex-${wi}-${ei}`}
            value={form.watch(`workouts.${wi}.exercises.${ei}.exerciseId`)}
            onChange={(id) => form.setValue(`workouts.${wi}.exercises.${ei}.exerciseId`, id)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              className="min-h-10 rounded border px-2"
              {...form.register(`workouts.${wi}.exercises.${ei}.order`)}
            />
            <input
              type="number"
              min={1}
              className="min-h-10 rounded border px-2"
              {...form.register(`workouts.${wi}.exercises.${ei}.targetSets`)}
            />
          </div>
          <input
            className="min-h-10 rounded border px-2 text-sm"
            placeholder="Notes"
            {...form.register(`workouts.${wi}.exercises.${ei}.notes`)}
          />
          {exercisesFA.fields.length > 1 ? (
            <Button type="button" variant="secondary" onClick={() => exercisesFA.remove(ei)}>
              Remove exercise
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          exercisesFA.append({
            exerciseId: '',
            order: exercisesFA.fields.length + 1,
            targetSets: 3,
          })
        }
      >
        Add exercise
      </Button>
    </section>
  );
}
