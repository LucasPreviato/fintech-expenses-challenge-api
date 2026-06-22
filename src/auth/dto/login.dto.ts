import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'maria@empresa.com',
    description: 'E-mail cadastrado do usuario.',
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
  password!: string;
}
