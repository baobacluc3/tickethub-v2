import { ApiProperty } from '@nestjs/swagger';

export class DatabaseHealthDto {
  @ApiProperty({
    example: 'up',
    description: 'Database connectivity status',
  })
  status: 'up';

  @ApiProperty({
    example: 2.15,
    description: 'Database query round-trip latency in milliseconds',
  })
  latencyMs: number;
}

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Overall API health status',
  })
  status: 'ok';

  @ApiProperty({
    type: DatabaseHealthDto,
    description: 'PostgreSQL health details',
  })
  database: DatabaseHealthDto;

  @ApiProperty({
    example: 42.5,
    description: 'Process uptime in seconds',
  })
  uptimeSeconds: number;

  @ApiProperty({
    example: '2026-11-24T02:45:00.000Z',
    description: 'ISO 8601 UTC timestamp of the health check',
  })
  timestamp: string;
}
