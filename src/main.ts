import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<Env, true>);
  const port = configService.get('PORT', { infer: true });
  const swaggerEnabled = configService.get('SWAGGER_ENABLED', { infer: true });

  configureApp(app, { enableSwagger: swaggerEnabled });
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`TicketHub API listening on http://localhost:${port}`);
  if (swaggerEnabled) {
    logger.log(`Swagger UI available at http://localhost:${port}/docs`);
  }
}

void bootstrap();
