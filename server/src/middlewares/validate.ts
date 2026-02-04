import {Request, Response, NextFunction} from 'express';
import {z} from 'zod';
import {ValidationError} from '../errors/index.js';

// Schema type for validation schemas with body, query, params
type ValidationSchema = z.ZodObject<{
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}>;

export const validate =
  (schema: ValidationSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(new ValidationError('Validation failed', result.error.issues));
    }

    // Assign validated (and potentially transformed) data back to request
    const data = result.data as {body?: unknown; query?: unknown; params?: unknown};
    if (data.body !== undefined) req.body = data.body;
    if (data.query !== undefined) req.query = data.query as typeof req.query;
    if (data.params !== undefined) req.params = data.params as typeof req.params;

    return next();
  };
