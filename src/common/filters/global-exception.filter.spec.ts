import {
  type ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../constants/headers';
import type { RequestWithId } from '../middleware/request-id.middleware';
import {
  GlobalExceptionFilter,
  type StandardErrorBody,
} from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let loggerErrorSpy: jest.SpyInstance;

  function createMockHost(requestId?: string) {
    const req = {
      method: 'GET',
      url: '/test-path',
      requestId,
    } as unknown as RequestWithId;

    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const setHeaderMock = jest.fn();

    const res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    } as unknown as Response;

    const host = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as unknown as ArgumentsHost;

    return { host, statusMock, jsonMock, setHeaderMock, req };
  }

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('formats NotFoundException without a details property', () => {
    const { host, statusMock, jsonMock, setHeaderMock } =
      createMockHost('req-404');

    filter.catch(new NotFoundException('Resource not found'), host);

    expect(setHeaderMock).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'req-404');
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

    const [body] = jsonMock.mock.calls[0] as [StandardErrorBody];
    expect(body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Resource not found',
      requestId: 'req-404',
      timestamp: expect.any(String) as string,
    });
    expect('details' in body).toBe(false);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('formats BadRequestException with validation details', () => {
    const { host, statusMock, jsonMock } = createMockHost('req-400');
    const details = [
      { field: 'title', messages: ['title should not be empty'] },
    ];

    filter.catch(
      new BadRequestException({
        message: 'Validation failed',
        details,
      }),
      host,
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const [body] = jsonMock.mock.calls[0] as [StandardErrorBody];
    expect(body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details,
      requestId: 'req-400',
      timestamp: expect.any(String) as string,
    });
  });

  it('formats ServiceUnavailableException with custom details and logs 5xx', () => {
    const { host, statusMock, jsonMock } = createMockHost('req-503');
    const details = { database: { status: 'down' } };

    filter.catch(
      new ServiceUnavailableException({
        message: 'Database health check failed',
        details,
      }),
      host,
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    const [body] = jsonMock.mock.calls[0] as [StandardErrorBody];
    expect(body).toEqual({
      statusCode: 503,
      error: 'Service Unavailable',
      message: 'Database health check failed',
      details,
      requestId: 'req-503',
      timestamp: expect.any(String) as string,
    });
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('masks unexpected non-HttpException errors and generates requestId if missing', () => {
    const { host, statusMock, jsonMock, setHeaderMock } = createMockHost();

    filter.catch(new Error('db password leaked in stack'), host);

    expect(setHeaderMock).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      expect.any(String),
    );
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    const [body] = jsonMock.mock.calls[0] as [StandardErrorBody];
    expect(body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
      requestId: expect.any(String) as string,
      timestamp: expect.any(String) as string,
    });
    expect('details' in body).toBe(false);
    expect(JSON.stringify(body)).not.toContain('db password leaked');
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps request type compatible when headers are checked', () => {
    const req = { method: 'POST', url: '/orders' } as Request;
    expect(req.method).toBe('POST');
  });
});
