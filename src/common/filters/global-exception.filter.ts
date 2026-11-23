import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { STATUS_CODES } from 'node:http';
import type { Response } from 'express';
import { REQUEST_ID_HEADER } from '../constants/headers';
import type { RequestWithId } from '../middleware/request-id.middleware';

export interface StandardErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  requestId: string;
  timestamp: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<RequestWithId>();
    const res = ctx.getResponse<Response>();

    const requestId = req.requestId ?? randomUUID();
    res.setHeader(REQUEST_ID_HEADER, requestId);

    const timestamp = new Date().toISOString();
    const normalized = this.normalizeException(exception, req, requestId);

    const body: StandardErrorBody = {
      statusCode: normalized.statusCode,
      error: normalized.error,
      message: normalized.message,
      ...(normalized.details !== undefined
        ? { details: normalized.details }
        : {}),
      requestId,
      timestamp,
    };

    res.status(normalized.statusCode).json(body);
  }

  private normalizeException(
    exception: unknown,
    req: RequestWithId,
    requestId: string,
  ): {
    statusCode: number;
    error: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const defaultError = STATUS_CODES[statusCode] ?? 'Error';
      const rawResponse = exception.getResponse();

      let error = defaultError;
      let message = defaultError;
      let details: unknown;

      if (typeof rawResponse === 'string') {
        message = rawResponse;
      } else if (isRecord(rawResponse)) {
        if (
          typeof rawResponse.error === 'string' &&
          rawResponse.error.length > 0
        ) {
          error = rawResponse.error;
        }

        if (typeof rawResponse.message === 'string') {
          message = rawResponse.message;
        } else if (Array.isArray(rawResponse.message)) {
          message = 'Validation failed';
          details = rawResponse.message;
        }

        if (rawResponse.details !== undefined) {
          details = rawResponse.details;
        }
      }

      if (statusCode >= 500) {
        this.logger.error(
          `[${requestId}] ${req.method} ${req.url} -> ${statusCode}: ${message}`,
          exception.stack,
        );
      }

      return { statusCode, error, message, details };
    }

    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `[${requestId}] Unhandled exception on ${req.method} ${req.url}: ${errorMessage}`,
      stack,
    );

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    };
  }
}
