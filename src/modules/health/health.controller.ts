import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Check API and database health',
    description:
      'Runs a lightweight PostgreSQL connectivity check (SELECT 1) and returns service health.',
  })
  @ApiOkResponse({
    description: 'Service and database are healthy',
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Database is unreachable',
    type: ErrorResponseDto,
  })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
