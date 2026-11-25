import {
  BadRequestException,
  type INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import type { ValidationErrorDetailDto } from './common/dto/error-response.dto';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

export interface ConfigureAppOptions {
  enableSwagger?: boolean;
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationErrorDetailDto[] {
  const details: ValidationErrorDetailDto[] = [];

  for (const error of errors) {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      details.push({
        field,
        messages: Object.values(error.constraints),
      });
    }

    if (error.children && error.children.length > 0) {
      details.push(...flattenValidationErrors(error.children, field));
    }
  }

  return details;
}

export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): void {
  app.use(requestIdMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          message: 'Validation failed',
          details: flattenValidationErrors(errors),
        }),
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (options.enableSwagger !== false) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TicketHub API')
      .setDescription(
        'Event ticketing and reservation API — Milestone M1 walking skeleton.',
      )
      .setVersion('0.1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token (introduced in Milestone M2)',
        },
        'access-token',
      )
      .addTag('Health', 'Service and database health checks')
      .addTag('Auth', 'Authentication and registration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      jsonDocumentUrl: 'docs-json',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
}
