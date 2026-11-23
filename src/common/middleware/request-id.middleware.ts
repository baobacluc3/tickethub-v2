import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../constants/headers';

export interface RequestWithId extends Request {
  requestId?: string;
}

const SAFE_REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export function requestIdMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction,
): void {
  const incomingId = req.header(REQUEST_ID_HEADER);
  const requestId =
    incomingId && SAFE_REQUEST_ID_PATTERN.test(incomingId)
      ? incomingId
      : randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
