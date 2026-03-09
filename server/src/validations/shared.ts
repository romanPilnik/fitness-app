import { z } from "zod";

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
