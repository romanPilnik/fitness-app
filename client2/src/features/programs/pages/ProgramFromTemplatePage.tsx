import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { toDatetimeLocalInputValue } from '@/lib/datetime';
import { errorMessageFromUnknown } from '@/lib/utils';
import { fetchTemplateById, templateQueryKeys } from '@/features/templates/api';
import { createProgramFromTemplate, programQueryKeys } from '../api';
import { fromTemplateFormSchema, type FromTemplateForm } from '../schemas';

export function ProgramFromTemplatePage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const templateIdParam = search.get('templateId') ?? '';

  const templateQ = useQuery({
    queryKey: templateQueryKeys.detail(templateIdParam),
    queryFn: () => fetchTemplateById(templateIdParam),
    enabled: Boolean(templateIdParam),
    staleTime: 60_000,
  });

  const defaultStartLocal = useMemo(() => {
    void templateIdParam;
    return toDatetimeLocalInputValue(new Date());
  }, [templateIdParam]);

  const form = useForm<FromTemplateForm>({
    resolver: zodResolver(fromTemplateFormSchema),
    defaultValues: {
      templateId: templateIdParam,
      name: '',
      startDate: defaultStartLocal,
    },
    values: templateIdParam
      ? {
          templateId: templateIdParam,
          name: templateQ.data?.name ?? '',
          startDate: defaultStartLocal,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: createProgramFromTemplate,
  });

  if (!templateIdParam) {
    return (
      <>
        <SubpageHeader fallbackTo="/templates" title="Templates" backLabel="Back to templates" />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">
            Pick a template first, then use &quot;Start from template&quot;.
          </p>
          <Link to="/templates" className="mt-4 inline-block text-sm font-medium text-(--accent)">
            Browse templates
          </Link>
        </div>
      </>
    );
  }

  if (templateQ.isError) {
    return (
      <>
        <SubpageHeader fallbackTo="/templates" title="Templates" backLabel="Back to templates" />
        <div className="mx-auto max-w-lg px-4 py-8">
          <QueryErrorMessage error={templateQ.error} refetch={() => templateQ.refetch()} />
        </div>
      </>
    );
  }

  return (
    <>
      <SubpageHeader
        fallbackTo={`/templates/${templateIdParam}`}
        title="Start from template"
        backLabel="Back to template"
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <header className="border-b border-(--border) pb-4">
          {templateQ.data ? (
            <p className="mt-1 text-sm text-(--text)">From: {templateQ.data.name}</p>
          ) : (
            <p className="mt-1 text-sm text-(--text)">Loading…</p>
          )}
        </header>

      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          const body: Parameters<typeof createProgramFromTemplate>[0] = {
            templateId: values.templateId,
          };
          if (values.name?.trim()) body.name = values.name.trim();
          if (values.startDate?.trim()) {
            body.startDate = new Date(values.startDate.trim()).toISOString();
          }
          try {
            await mutation.mutateAsync(body);
            qc.invalidateQueries({ queryKey: programQueryKeys.all });
            navigate('/programs');
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
        <input type="hidden" {...form.register('templateId')} />

        <div className="flex flex-col gap-1">
          <label htmlFor="ft-name" className="text-sm font-medium text-(--text-h)">
            Program name (optional)
          </label>
          <input
            id="ft-name"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
            placeholder="Defaults to template name"
            {...form.register('name')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="ft-start" className="text-sm font-medium text-(--text-h)">
            Start date
          </label>
          <input
            id="ft-start"
            type="datetime-local"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
            {...form.register('startDate')}
          />
          <p className="text-xs text-(--text)">Defaults to today; adjust if needed.</p>
        </div>

        {form.formState.errors.root?.message ||
        (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending || templateQ.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create program'}
        </Button>
      </form>
      </div>
    </>
  );
}
