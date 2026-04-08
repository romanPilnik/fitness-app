import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { errorMessageFromUnknown } from '@/lib/utils';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import { createTemplate, templateQueryKeys } from '../api';
import { templateFormSchema, type TemplateForm } from '../schemas';

const defaultWorkout: TemplateForm['workouts'][number] = {
  name: 'Day 1',
  dayNumber: 1,
  exercises: [{ exerciseId: '', order: 1, targetSets: 3 }],
};

export function NewTemplatePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateFormSchema) as Resolver<TemplateForm>,
    defaultValues: {
      name: '',
      description: '',
      daysPerWeek: 3,
      difficulty: 'beginner',
      goal: 'hypertrophy',
      splitType: 'full_body',
      workouts: [defaultWorkout],
    },
  });

  const workoutsFA = useFieldArray({
    control: form.control,
    name: 'workouts',
  });

  const mutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: templateQueryKeys.all });
      navigate(`/templates/${t.id}`);
    },
  });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link
        to="/templates"
        className="text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        ← Templates
      </Link>
      <header className="border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">New template</h1>
      </header>

      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await mutation.mutateAsync({
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
                mutation.reset();
                return;
              }
              mutation.reset();
              form.setError('root', {
                type: 'server',
                message: e.message,
              });
              return;
            }
            mutation.reset();
            form.setError('root', {
              type: 'server',
              message: errorMessageFromUnknown(e),
            });
          }
        })}
      >
        <section className="flex flex-col gap-3 rounded-xl border border-(--border) p-4">
          <h2 className="text-lg font-medium text-(--text-h)">Basics</h2>
          <input
            placeholder="Name"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
            {...form.register('name')}
          />
          <textarea
            placeholder="Description"
            rows={2}
            className="rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-base"
            {...form.register('description')}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              max={14}
              className="min-h-11 rounded-lg border border-(--border) px-3"
              {...form.register('daysPerWeek')}
            />
            <select
              className="min-h-11 rounded-lg border border-(--border) px-2"
              {...form.register('difficulty')}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <select
            className="min-h-11 rounded-lg border border-(--border) px-2"
            {...form.register('goal')}
          >
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="endurance">Endurance</option>
          </select>
          <select
            className="min-h-11 rounded-lg border border-(--border) px-2"
            {...form.register('splitType')}
          >
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
        (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Create template'}
        </Button>
      </form>
    </div>
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
        className="min-h-11 rounded-lg border border-(--border) px-3 text-base"
        {...form.register(`workouts.${wi}.name`)}
      />
      <input
        type="number"
        min={1}
        max={14}
        className="min-h-11 rounded-lg border border-(--border) px-3 text-base"
        {...form.register(`workouts.${wi}.dayNumber`)}
      />

      {exercisesFA.fields.map((ef, ei) => (
        <div key={ef.id} className="flex flex-col gap-2 rounded-lg border border-(--border) p-3">
          <ExerciseIdSelect
            id={`tmpl-ex-${wi}-${ei}`}
            value={form.watch(`workouts.${wi}.exercises.${ei}.exerciseId`)}
            onChange={(id) => form.setValue(`workouts.${wi}.exercises.${ei}.exerciseId`, id)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              className="min-h-10 rounded border px-2"
              placeholder="Order"
              {...form.register(`workouts.${wi}.exercises.${ei}.order`)}
            />
            <input
              type="number"
              min={1}
              className="min-h-10 rounded border px-2"
              placeholder="Sets"
              {...form.register(`workouts.${wi}.exercises.${ei}.targetSets`)}
            />
          </div>
          <input
            placeholder="Notes"
            className="min-h-10 rounded border px-2 text-sm"
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
