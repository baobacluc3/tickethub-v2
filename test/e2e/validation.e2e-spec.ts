import {
  Body,
  Controller,
  Get,
  type INestApplication,
  Logger,
  Post,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import request from 'supertest';
import type { App } from 'supertest/types';
import { configureApp } from '../../src/app.setup';
import { REQUEST_ID_HEADER } from '../../src/common/constants/headers';
import type { StandardErrorBody } from '../../src/common/filters/global-exception.filter';

class CreateSampleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

@Controller('__test')
class ValidationTestController {
  @Post('echo')
  echo(@Body() dto: CreateSampleDto): CreateSampleDto {
    return dto;
  }

  @Get('boom')
  boom(): never {
    throw new Error('secret database password');
  }
}

interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
}

describe('HTTP Pipeline, Validation, Error Filter & Swagger (e2e)', () => {
  let app: INestApplication<App>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ValidationTestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, { enableSwagger: true });
    await app.init();
  });

  beforeEach(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await app.close();
  });

  it('transforms and returns valid DTO payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/__test/echo')
      .send({ title: 'Concert', quantity: '2' })
      .expect(201);

    expect(response.body).toEqual({
      title: 'Concert',
      quantity: 2,
    });
    expect(response.headers[REQUEST_ID_HEADER]).toBeDefined();
  });

  it('rejects non-whitelisted fields with standard 400 error shape', async () => {
    const response = await request(app.getHttpServer())
      .post('/__test/echo')
      .send({ title: 'Concert', quantity: 2, admin: true })
      .expect(400);

    const body = response.body as StandardErrorBody;
    expect(body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'admin',
        }),
      ]) as unknown,
      requestId: expect.any(String) as string,
      timestamp: expect.any(String) as string,
    });
  });

  it('returns field-level validation details on invalid DTO constraints', async () => {
    const response = await request(app.getHttpServer())
      .post('/__test/echo')
      .send({ title: '', quantity: 0 })
      .expect(400);

    const body = response.body as StandardErrorBody;
    const details = body.details as Array<{
      field: string;
      messages: string[];
    }>;

    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Validation failed');
    expect(details.map((d) => d.field)).toEqual(
      expect.arrayContaining(['title', 'quantity']),
    );
  });

  it('returns standard 404 error shape without details and echoes valid X-Request-Id', async () => {
    const response = await request(app.getHttpServer())
      .get('/__test/does-not-exist')
      .set(REQUEST_ID_HEADER, 'custom-req-123')
      .expect(404);

    const body = response.body as StandardErrorBody;
    expect(response.headers[REQUEST_ID_HEADER]).toBe('custom-req-123');
    expect(body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: expect.any(String) as string,
      requestId: 'custom-req-123',
      timestamp: expect.any(String) as string,
    });
    expect('details' in body).toBe(false);
  });

  it('replaces unsafe X-Request-Id header with a generated UUID', async () => {
    const response = await request(app.getHttpServer())
      .get('/__test/does-not-exist')
      .set(REQUEST_ID_HEADER, 'invalid/id with spaces')
      .expect(404);

    const requestId = response.headers[REQUEST_ID_HEADER];
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('masks unhandled exceptions as generic 500 Internal server error', async () => {
    const response = await request(app.getHttpServer())
      .get('/__test/boom')
      .expect(500);

    const body = response.body as StandardErrorBody;
    expect(body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
      requestId: expect.any(String) as string,
      timestamp: expect.any(String) as string,
    });
    expect('details' in body).toBe(false);
    expect(JSON.stringify(body)).not.toContain('secret database password');
  });

  it('serves Swagger UI at /docs and OpenAPI JSON at /docs-json', async () => {
    const docsRes = await request(app.getHttpServer()).get('/docs').expect(200);
    expect(docsRes.text).toContain('Swagger UI');

    const jsonRes = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    const openApi = jsonRes.body as OpenApiDocument;
    expect(openApi.openapi).toMatch(/^3\./);
    expect(openApi.info.title).toBe('TicketHub API');
  });
});
