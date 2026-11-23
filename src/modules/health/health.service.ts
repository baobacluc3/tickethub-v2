import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthResponseDto> {
    const startedAt = process.hrtime.bigint();

    try {
      await this.dataSource.query('SELECT 1');
      const elapsedNs = Number(process.hrtime.bigint() - startedAt);
      const latencyMs = Math.round((elapsedNs / 1_000_000) * 100) / 100;

      return {
        status: 'ok',
        database: {
          status: 'up',
          latencyMs,
        },
        uptimeSeconds: Math.round(process.uptime() * 100) / 100,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database health check failed: ${reason}`);

      throw new ServiceUnavailableException({
        message: 'Database health check failed',
        details: {
          database: {
            status: 'down',
          },
        },
      });
    }
  }
}
