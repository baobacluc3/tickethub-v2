import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
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
    maxLength: 128,
    description: 'Account password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
