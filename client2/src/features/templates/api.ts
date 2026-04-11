import { deleteEnvelope, getEnvelope, patchEnvelope, postEnvelope } from '@/api/client';
import { DEFAULT_LIST_LIMIT, type CursorPage } from '@/api/pagination';
import type { TemplateDetail, TemplateListSort, TemplateSummary } from './types';

export const templateQueryKeys = {
  all: ['templates'] as const,
  list: (
    mineScope: 'all' | 'mine',
    sort: TemplateListSort,
    difficulty: string,
    goal: string,
    splitType: string,
    daysPerWeek: string | number,
  ) =>
    [
      ...templateQueryKeys.all,
      'list',
      mineScope,
      sort,
      difficulty,
      goal,
      splitType,
      daysPerWeek,
    ] as const,
  detail: (id: string) => [...templateQueryKeys.all, 'detail', id] as const,
};

export type TemplateListParams = {
  cursor?: string;
  limit?: number;
  myTemplatesOnly?: boolean;
  sort?: TemplateListSort;
  splitType?: string;
  difficulty?: string;
  goal?: string;
  daysPerWeek?: number;
};

export type CreateTemplateBody = {
  name: string;
  description?: string;
  daysPerWeek: number;
  difficulty: string;
  splitType: string;
  goal: string;
  workouts: Array<{
    name: string;
    dayNumber: number;
    exercises: Array<{
      exerciseId: string;
      order: number;
      targetSets: number;
      notes?: string;
    }>;
  }>;
};

export type UpdateTemplateBody = Partial<CreateTemplateBody>;

export async function fetchTemplatesPage(
  params: TemplateListParams = {},
): Promise<CursorPage<TemplateSummary>> {
  const {
    cursor,
    limit = DEFAULT_LIST_LIMIT,
    myTemplatesOnly,
    sort,
    splitType,
    difficulty,
    goal,
    daysPerWeek,
  } = params;
  return getEnvelope<CursorPage<TemplateSummary>>('/programs/templates', {
    params: {
      ...(cursor ? { cursor } : {}),
      limit,
      ...(myTemplatesOnly === true ? { myTemplatesOnly: true } : {}),
      ...(sort ? { sort } : {}),
      ...(splitType ? { splitType } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(goal ? { goal } : {}),
      ...(daysPerWeek != null ? { daysPerWeek } : {}),
    },
  });
}

export async function fetchTemplateById(id: string): Promise<TemplateDetail> {
  return getEnvelope<TemplateDetail>(`/programs/templates/${encodeURIComponent(id)}`);
}

export async function createTemplate(body: CreateTemplateBody): Promise<TemplateDetail> {
  return postEnvelope<TemplateDetail>('/programs/templates', body);
}

export async function updateTemplate(
  id: string,
  body: UpdateTemplateBody,
): Promise<TemplateDetail> {
  return patchEnvelope<TemplateDetail>(`/programs/templates/${encodeURIComponent(id)}`, body);
}

export async function deleteTemplate(id: string): Promise<void> {
  return deleteEnvelope(`/programs/templates/${encodeURIComponent(id)}`);
}
