import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../users/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'alice@example.com',
    description: 'User email address (case-insensitive)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'StrongP@ss123',
    minLength: 8,
    maxLength: 128,
    description: 'Account password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.CUSTOMER,
    example: UserRole.CUSTOMER,
    description: 'Account role (defaults to CUSTOMER)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
