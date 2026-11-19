import { Response } from 'express';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: object;
}

export function ok<T>(res: Response, data: T, meta?: object, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function created<T>(res: Response, data: T, meta?: object): Response {
  return ok(res, data, meta, 201);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}
