import {z} from 'zod';
import {
  programStatusEnum,
  difficultyEnum,
  goalEnum,
  splitTypeEnum,
  programSourceEnum,
} from './shared.js';

// GET /api/v1/programs
export const getPrograms = z.object({
  query: z.object({
    status: programStatusEnum.optional(),
  }),
});

// GET /api/v1/programs/active - No validation needed
export const getActiveProgram = z.object({});

// GET /api/v1/programs/:id
export const getProgramById = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// POST /api/v1/programs/from-template
export const createFromTemplate = z.object({
  body: z.object({
    templateId: z.string(),
    startDate: z.string().datetime().optional(),
    customizations: z
      .object({
        name: z.string().max(50).trim().optional(),
        workouts: z.object({}).passthrough().optional(),
      })
      .optional(),
  }),
});

// POST /api/v1/programs/custom
export const createCustomProgram = z.object({
  body: z.object({
    name: z.string().max(50).trim(),
    description: z.string().max(500).optional(),
    difficulty: difficultyEnum,
    goals: z.array(goalEnum).max(3).optional(),
    splitType: splitTypeEnum,
    daysPerWeek: z.number().int().min(1).max(14),
    workouts: z.array(z.any()),
    periodization: z.object({}).passthrough(),
    startDate: z.string().datetime().optional(),
    createdFrom: programSourceEnum.optional(),
  }),
});

// PATCH /api/v1/programs/:id
export const updateProgramById = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      name: z.string().max(50).trim().optional(),
      description: z.string().max(500).optional(),
      difficulty: difficultyEnum.optional(),
      goals: z.array(goalEnum).max(3).optional(),
      splitType: splitTypeEnum.optional(),
      daysPerWeek: z.number().int().min(1).max(14).optional(),
      workouts: z.array(z.any()).optional(),
      periodization: z.object({}).passthrough().optional(),
      status: programStatusEnum.optional(),
      startDate: z.string().datetime().optional(),
      currentWeek: z.number().int().min(1).optional(),
      nextWorkoutIndex: z.number().int().min(0).optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

// DELETE /api/v1/programs/:id
export const deleteProgramById = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Export inferred types
export type GetProgramsInput = z.infer<typeof getPrograms>;
export type GetActiveProgramInput = z.infer<typeof getActiveProgram>;
export type GetProgramByIdInput = z.infer<typeof getProgramById>;
export type CreateFromTemplateInput = z.infer<typeof createFromTemplate>;
export type CreateCustomProgramInput = z.infer<typeof createCustomProgram>;
export type UpdateProgramByIdInput = z.infer<typeof updateProgramById>;
export type DeleteProgramByIdInput = z.infer<typeof deleteProgramById>;
