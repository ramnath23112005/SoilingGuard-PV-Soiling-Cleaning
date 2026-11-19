import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

type Schema = ZodTypeAny | AnyZodObject | ZodEffects<ZodTypeAny>;

/**
 * Validates req.body (and optionally req.query/req.params) with Zod.
 * Places the parsed value back onto the request so downstream code
 * receives type-safe, coerced data.
 */
export function validate(schema: Schema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details));
    }
    // Express 5 types vs internal mutation
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}
