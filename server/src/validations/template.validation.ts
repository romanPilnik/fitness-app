import {z} from 'zod';
import {splitTypeEnum, difficultyEnum, goalEnum} from './shared.js';

// GET /api/v1/programs/templates
export const getProgramTemplates = z.object({
  query: z.object({
    splitType: splitTypeEnum.optional(),
    createdBy: z.string().optional(),
    difficulty: difficultyEnum.optional(),
    daysPerWeek: z.coerce.number().int().min(1).max(14).optional(),
  }),
});

// GET /api/v1/programs/templates/:id
export const getProgramTemplateById = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// POST /api/v1/programs/templates
export const createProgramTemplate = z.object({
  body: z.object({
    name: z.string().max(50).trim(),
    createdBy: z.string().min(2).max(50).trim(),
    splitType: splitTypeEnum,
    daysPerWeek: z.number().int().min(1).max(14),
    periodization: z.object({}).passthrough(),
    workouts: z.array(z.any()),
    description: z.string().max(500).optional(),
    difficulty: difficultyEnum,
    goals: z.array(goalEnum).max(3).optional(),
    isActive: z.boolean().optional(),
  }),
});

// PATCH /api/v1/programs/templates/:id
export const updateProgramTemplate = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      name: z.string().max(50).trim().optional(),
      description: z.string().max(500).optional(),
      difficulty: difficultyEnum.optional(),
      goals: z.array(goalEnum).max(3).optional(),
      workouts: z.array(z.any()).optional(),
      periodization: z.object({}).passthrough().optional(),
      daysPerWeek: z.number().int().min(1).max(14).optional(),
      splitType: splitTypeEnum.optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

// DELETE /api/v1/programs/templates/:id
export const deleteProgramTemplate = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Export inferred types
export type GetProgramTemplatesInput = z.infer<typeof getProgramTemplates>;
export type GetProgramTemplateByIdInput = z.infer<
  typeof getProgramTemplateById
>;
export type CreateProgramTemplateInput = z.infer<typeof createProgramTemplate>;
export type UpdateProgramTemplateInput = z.infer<typeof updateProgramTemplate>;
export type DeleteProgramTemplateInput = z.infer<typeof deleteProgramTemplate>;
