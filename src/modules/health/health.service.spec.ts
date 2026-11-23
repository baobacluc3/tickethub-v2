import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let queryMock: jest.Mock;
  let healthService: HealthService;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    queryMock = jest.fn();
    const mockDataSource = {
      query: queryMock,
    } as unknown as DataSource;
    healthService = new HealthService(mockDataSource);
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns status ok and database up when SELECT 1 succeeds', async () => {
    queryMock.mockResolvedValue([{ '?column?': 1 }]);

    const result = await healthService.check();

    expect(queryMock).toHaveBeenCalledWith('SELECT 1');
    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('up');
    expect(typeof result.database.latencyMs).toBe('number');
    expect(result.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.uptimeSeconds).toBe('number');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it('throws ServiceUnavailableException without leaking raw DB errors when SELECT 1 rejects', async () => {
    queryMock.mockRejectedValue(
      new Error('password authentication failed for user tickethub'),
    );

    let caught: unknown;
    try {
      await healthService.check();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ServiceUnavailableException);
    const response = (caught as ServiceUnavailableException).getResponse();
    expect(response).toEqual({
      message: 'Database health check failed',
      details: {
        database: {
          status: 'down',
        },
      },
    });
    expect(JSON.stringify(response)).not.toContain('password authentication');
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
  });
});
