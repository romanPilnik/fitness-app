import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
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
import { errorMessageFromUnknown } from '@/lib/utils';
import { createExercise, exerciseQueryKeys } from '../api';
import { createExerciseFormSchema, type CreateExerciseFormValues } from '../schemas';

const selectClass =
  'min-h-11 w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text-h)';

const resolver = zodResolver(createExerciseFormSchema) as Resolver<CreateExerciseFormValues>;

export function NewExercisePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

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

  const secondaryMuscles = useWatch({ control: form.control, name: 'secondaryMuscles', defaultValue: [] });

  const mutation = useMutation({
    mutationFn: createExercise,
    onSuccess: (ex) => {
      qc.invalidateQueries({ queryKey: exerciseQueryKeys.all });
      navigate(`/exercises/${ex.id}`);
    },
  });

  function toggleSecondary(muscle: (typeof MUSCLE_GROUP_VALUES)[number]) {
    const cur = form.getValues('secondaryMuscles');
    if (cur.includes(muscle)) {
      form.setValue(
        'secondaryMuscles',
        cur.filter((m) => m !== muscle),
        { shouldValidate: true },
      );
    } else if (cur.length < 3) {
      form.setValue('secondaryMuscles', [...cur, muscle], { shouldValidate: true });
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link
        to="/exercises"
        className="text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        ← Exercises
      </Link>
      <header className="border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">New exercise</h1>
      </header>

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
            className={selectClass}
            {...form.register('name')}
          />
          {form.formState.errors.name ? (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Equipment</span>
          <select className={selectClass} {...form.register('equipment')}>
            {EQUIPMENT_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Primary muscle</span>
          <select className={selectClass} {...form.register('primaryMuscle')}>
            {MUSCLE_GROUP_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm text-(--text)">Secondary muscles (at most 3)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MUSCLE_GROUP_VALUES.map((m) => {
              const checked = secondaryMuscles.includes(m);
              const disabled = !checked && secondaryMuscles.length >= 3;
              return (
                <label
                  key={m}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-sm text-(--text-h)"
                >
                  <input
                    type="checkbox"
                    className="size-4 rounded border-(--border)"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleSecondary(m)}
                  />
                  {formatEnumLabel(m)}
                </label>
              );
            })}
          </div>
          {form.formState.errors.secondaryMuscles ? (
            <span className="text-sm text-red-600">
              {form.formState.errors.secondaryMuscles.message}
            </span>
          ) : null}
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Category</span>
          <select className={selectClass} {...form.register('category')}>
            {EXERCISE_CATEGORY_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--text)">Movement pattern</span>
          <select className={selectClass} {...form.register('movementPattern')}>
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
            className={`${selectClass} resize-y`}
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
  );
}
