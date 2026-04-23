import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import {
  EQUIPMENT_VALUES,
  EXERCISE_CATEGORY_VALUES,
  MOVEMENT_PATTERN_VALUES,
  MUSCLE_GROUP_VALUES,
} from '@/lib/apiFilterOptions';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { FILTER_SELECT_CLASS } from '@/lib/nativeSelect';
import { errorMessageFromUnknown } from '@/lib/utils';
import { createExercise, exerciseQueryKeys } from '../api';
import { createExerciseFormSchema, type CreateExerciseFormValues } from '../schemas';

const fieldClass =
  'min-h-11 w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text-h)';

const resolver = zodResolver(createExerciseFormSchema) as Resolver<CreateExerciseFormValues>;

export function NewExercisePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const exercisesListPath = location.pathname.startsWith('/admin') ? '/admin/exercises' : '/exercises';

  const form = useForm<CreateExerciseFormValues>({
    resolver,
    defaultValues: {
      name: '',
      equipment: 'barbell',
      primaryMuscle: 'chest',
      secondaryMuscles: [],
      category: 'compound',
      movementPattern: 'horizontal_push',
      instructions: '',
    },
  });

  const primaryMuscle = useWatch({ control: form.control, name: 'primaryMuscle', defaultValue: 'chest' });
  const secondaryMuscles = useWatch({ control: form.control, name: 'secondaryMuscles', defaultValue: [] });

  const availableSecondaryMuscles = MUSCLE_GROUP_VALUES.filter(
    (m) => m !== primaryMuscle && !secondaryMuscles.includes(m),
  );

  const mutation = useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseQueryKeys.all });
      navigate(exercisesListPath);
    },
  });

  return (
    <>
      <SubpageHeader
        fallbackTo={exercisesListPath}
        title="New exercise"
        backLabel="Back to exercises"
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await mutation.mutateAsync({
              name: values.name.trim(),
              equipment: values.equipment,
              primaryMuscle: values.primaryMuscle,
              secondaryMuscles: values.secondaryMuscles,
              category: values.category,
              movementPattern: values.movementPattern,
              ...(values.instructions?.trim()
                ? { instructions: values.instructions.trim() }
                : {}),
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
              form.setError('root', { type: 'server', message: e.message });
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Name</span>
          <input
            type="text"
            autoComplete="off"
            className={fieldClass}
            {...form.register('name')}
          />
          {form.formState.errors.name ? (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Equipment</span>
          <select className={FILTER_SELECT_CLASS} {...form.register('equipment')}>
            {EQUIPMENT_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Primary muscle</span>
          <select className={FILTER_SELECT_CLASS} {...form.register('primaryMuscle')}>
            {MUSCLE_GROUP_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <div>
            <span className="text-(--text)">Secondary muscles</span>
            <p className="mt-0.5 text-xs text-(--text)">Up to 3, optional.</p>
          </div>
          {secondaryMuscles.length > 0 ? (
            <div className="flex flex-wrap gap-2" role="list" aria-label="Selected secondary muscles">
              {secondaryMuscles.map((m) => (
                <button
                  type="button"
                  key={m}
                  aria-label={`Remove ${formatEnumLabel(m)} from secondary muscles`}
                  className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border border-(--border) bg-(--code-bg) py-1 pl-3 pr-2 text-left text-sm text-(--text-h) touch-manipulation"
                  onClick={() => {
                    form.setValue(
                      'secondaryMuscles',
                      secondaryMuscles.filter((x) => x !== m),
                      { shouldValidate: true },
                    );
                  }}
                >
                  <span className="min-w-0 truncate">{formatEnumLabel(m)}</span>
                  <X className="size-3.5 shrink-0 text-(--text) opacity-90" strokeWidth={2.5} aria-hidden />
                </button>
              ))}
            </div>
          ) : null}
          <label className="sr-only" htmlFor="secondary-muscle-add">
            Add secondary muscle
          </label>
          <select
            id="secondary-muscle-add"
            className={FILTER_SELECT_CLASS}
            value=""
            disabled={secondaryMuscles.length >= 3}
            onChange={(e) => {
              const v = e.target.value as (typeof MUSCLE_GROUP_VALUES)[number];
              if (!v) return;
              const cur = form.getValues('secondaryMuscles');
              if (cur.length < 3 && !cur.includes(v)) {
                form.setValue('secondaryMuscles', [...cur, v], { shouldValidate: true });
              }
            }}
            key={secondaryMuscles.join(',')}
          >
            <option value="">
              {secondaryMuscles.length >= 3 ? 'Maximum 3 selected' : 'Add muscle…'}
            </option>
            {availableSecondaryMuscles.map((m) => (
              <option key={m} value={m}>
                {formatEnumLabel(m)}
              </option>
            ))}
          </select>
          {form.formState.errors.secondaryMuscles ? (
            <span className="text-sm text-red-600" role="alert">
              {form.formState.errors.secondaryMuscles.message}
            </span>
          ) : null}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Category</span>
          <select className={FILTER_SELECT_CLASS} {...form.register('category')}>
            {EXERCISE_CATEGORY_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Movement pattern</span>
          <select className={FILTER_SELECT_CLASS} {...form.register('movementPattern')}>
            {MOVEMENT_PATTERN_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Instructions (optional)</span>
          <textarea
            rows={4}
            className={`${fieldClass} resize-y`}
            {...form.register('instructions')}
          />
          {form.formState.errors.instructions ? (
            <span className="text-sm text-red-600">
              {form.formState.errors.instructions.message}
            </span>
          ) : null}
        </label>

        {form.formState.errors.root ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Create exercise'}
        </Button>
      </form>
      </div>
    </>
  );
}
