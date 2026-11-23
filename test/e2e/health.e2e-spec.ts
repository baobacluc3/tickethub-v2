import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { REQUEST_ID_HEADER } from '../../src/common/constants/headers';
import type { StandardErrorBody } from '../../src/common/filters/global-exception.filter';
import type { HealthResponseDto } from '../../src/modules/health/dto/health-response.dto';

interface OpenApiSpec {
  openapi: string;
  paths: Record<
    string,
    {
      get?: {
        responses?: Record<string, unknown>;
      };
    }
  >;
}

describe('Health & AppModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, { enableSwagger: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with PostgreSQL status and X-Request-Id header', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    const body = response.body as HealthResponseDto;
    expect(response.headers[REQUEST_ID_HEADER]).toBeDefined();
    expect(body).toEqual({
      status: 'ok',
      database: {
        status: 'up',
        latencyMs: expect.any(Number) as number,
      },
      uptimeSeconds: expect.any(Number) as number,
      timestamp: expect.any(String) as string,
    });
    expect(body.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('GET /docs and GET /docs-json expose Swagger documentation for /health', async () => {
    await request(app.getHttpServer()).get('/docs').expect(200);

    const specResponse = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    const spec = specResponse.body as OpenApiSpec;

    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.paths['/health']?.get?.responses).toHaveProperty('200');
    expect(spec.paths['/health']?.get?.responses).toHaveProperty('503');
  });

  it('GET /does-not-exist returns standard 404 error shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/does-not-exist')
      .expect(404);

    const body = response.body as StandardErrorBody;
    expect(body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: expect.any(String) as string,
      requestId: expect.any(String) as string,
      timestamp: expect.any(String) as string,
    });
    expect('details' in body).toBe(false);
  });
});
