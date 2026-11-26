import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Rock Concert 2026',
    minLength: 1,
    maxLength: 200,
    description: 'Event title',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Ho Chi Minh City',
    minLength: 1,
    maxLength: 100,
    description: 'City where the event takes place',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: '2026-12-25T19:00:00.000Z',
    description: 'ISO 8601 timestamp when the event starts',
  })
  @IsDateString({ strict: true })
  startsAt: string;
}
