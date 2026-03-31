import { z } from "zod";

export const getExercisePerformanceSchema = z.object({
  params: z.object({
    exerciseId: z.string(),
  }),
});

export type GetExercisePerformanceParams = z.infer<
  typeof getExercisePerformanceSchema
>["params"];
