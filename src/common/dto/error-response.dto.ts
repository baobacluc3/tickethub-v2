import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidationErrorDetailDto {
  @ApiProperty({
    example: 'title',
    description: 'Property path that failed validation',
  })
  field: string;

  @ApiProperty({
    type: [String],
    example: ['title must be a string', 'title should not be empty'],
    description: 'Validation constraints violated on this field',
  })
  messages: string[];
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Standard HTTP error reason phrase',
  })
  error: string;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Human-readable summary of the error',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Optional structured details such as field validation errors',
    example: [
      {
        field: 'title',
        messages: ['title should not be empty'],
      },
    ],
  })
  details?: unknown;

  @ApiProperty({
    example: '7f2e7f48-2b6e-4c4e-9df2-6d9d2e69c5d1',
    description: 'Correlation identifier echoed in X-Request-Id header',
  })
  requestId: string;

  @ApiProperty({
    example: '2026-11-24T02:45:00.000Z',
    description: 'ISO 8601 UTC timestamp when the error occurred',
  })
  timestamp: string;
}
