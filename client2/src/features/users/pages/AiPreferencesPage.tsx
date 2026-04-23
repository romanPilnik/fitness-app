import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ApiError } from '@/api/errors';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { errorMessageFromUnknown } from '@/lib/utils';
import {
  fetchAiPreferences,
  patchAiPreferences,
  userQueryKeys,
} from '../api';
import {
  aiPreferencesFormSchema,
  DEFAULT_AI_PREFERENCES_FORM,
  type AiPreferencesForm,
} from '../schemas';
import type { AiUserPreferences } from '../types';

const resolver = zodResolver(aiPreferencesFormSchema);

export function AiPreferencesPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: userQueryKeys.aiPreferences(),
    queryFn: fetchAiPreferences,
    staleTime: 60_000,
  });

  const form = useForm<AiPreferencesForm>({
    resolver,
    values: q.data ?? DEFAULT_AI_PREFERENCES_FORM,
  });

  const mutation = useMutation({
    mutationFn: patchAiPreferences,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userQueryKeys.aiPreferences() });
    },
  });

  return (
    <>
      <SubpageHeader
        fallbackTo="/account"
        title="Generation settings"
        backLabel="Back to account"
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        {q.isError ? (
          <QueryErrorMessage error={q.error} refetch={() => q.refetch()} />
        ) : q.isPending ? (
          <p className="text-sm text-(--text)">Loading…</p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              const dirty = form.formState.dirtyFields;
              const body: Partial<AiUserPreferences> = {};
              if (dirty.progressionStyle) body.progressionStyle = values.progressionStyle;
              if (dirty.progressionPreference)
                body.progressionPreference = values.progressionPreference;
              if (dirty.deloadSensitivity) body.deloadSensitivity = values.deloadSensitivity;
              if (dirty.rirFloor) body.rirFloor = values.rirFloor;
              if (Object.keys(body).length === 0) {
                return;
              }
              try {
                await mutation.mutateAsync(body);
                form.reset(values);
              } catch (e) {
                mutation.reset();
                if (e instanceof ApiError) {
                  if (
                    e.code === API_VALIDATION_ERROR_CODE &&
                    applyApiValidationErrors(e, form.setError)
                  ) {
                    return;
                  }
                  form.setError('root', { type: 'server', message: e.message });
                  return;
                }
                form.setError('root', {
                  type: 'server',
                  message: errorMessageFromUnknown(e),
                });
              }
            })}
          >
            <p className="text-sm text-(--text)">
              These settings guide automatic target suggestions after you log a workout. They do
              not change exercise selection.
            </p>

            <div className="flex flex-col gap-1">
              <label htmlFor="ai-progression-style" className="text-sm font-medium text-(--text-h)">
                Progression style
              </label>
              <select
                id="ai-progression-style"
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
                {...form.register('progressionStyle')}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="ai-progression-preference"
                className="text-sm font-medium text-(--text-h)"
              >
                Prefer load or reps
              </label>
              <select
                id="ai-progression-preference"
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
                {...form.register('progressionPreference')}
              >
                <option value="weight">Weight first</option>
                <option value="reps">Reps first</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="ai-deload-sensitivity"
                className="text-sm font-medium text-(--text-h)"
              >
                Deload sensitivity
              </label>
              <select
                id="ai-deload-sensitivity"
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
                {...form.register('deloadSensitivity')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ai-rir-floor" className="text-sm font-medium text-(--text-h)">
                Minimum RIR (safety floor)
              </label>
              <input
                id="ai-rir-floor"
                type="number"
                min={0}
                max={4}
                step={1}
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
                {...form.register('rirFloor', { valueAsNumber: true })}
              />
              <p className="text-xs text-(--text)">
                Reps in reserve: suggested targets stay at or above this RIR on working sets.
              </p>
            </div>

            {form.formState.errors.root?.message ||
            (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
              <p className="text-sm text-red-600" role="alert">
                {form.formState.errors.root?.message ??
                  (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
              </p>
            ) : null}

            <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
              {mutation.isPending ? 'Saving…' : 'Save preferences'}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
