import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { isProd } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
    if (statusCode >= 500) logger.error(message, { path: req.path, stack: err.stack });
  } else if (err instanceof Error) {
    const anyErr = err as Error & {
      code?: string | number;
      statusCode?: number;
      errors?: unknown;
      keyValue?: Record<string, unknown>;
    };
    // Mongoose validation errors
    if (anyErr.name === 'ValidationError') {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = anyErr.message;
    } else if (anyErr.name === 'CastError') {
      statusCode = 400;
      code = 'INVALID_ID';
      message = 'Invalid identifier format';
    } else if (anyErr.code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE';
      message = 'Duplicate value violates a unique constraint';
      details = anyErr.keyValue ?? anyErr.message;
    } else if (anyErr.code === 'EBADCSRFTOKEN') {
      statusCode = 403;
      code = 'BAD_CSRF';
      message = 'Invalid CSRF token';
    } else {
      message = isProd ? 'Internal server error' : anyErr.message;
      logger.error(anyErr.message, { path: req.path, stack: anyErr.stack });
    }
  } else {
    logger.error('Unknown error', { path: req.path, err: String(err) });
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  });
}
