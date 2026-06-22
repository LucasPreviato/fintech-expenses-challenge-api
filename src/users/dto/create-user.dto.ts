import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsStrongPasswordPolicy } from '../../common/validators/is-strong-password-policy.decorator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do usuario.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @MaxLength(100, { message: 'name must be at most 100 characters long' })
  name!: string;

  @ApiProperty({
    example: 'maria@empresa.com',
    description: 'E-mail unico do usuario.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'email must be a valid email' })
  email!: string;

  @ApiProperty({
    example: 'Demo@123456',
    minLength: 8,
    maxLength: 100,
    description: 'Senha de acesso do usuario.',
  })
  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(100, { message: 'password must be at most 100 characters long' })
  @IsStrongPasswordPolicy()
  password!: string;
}
