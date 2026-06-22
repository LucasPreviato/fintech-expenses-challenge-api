import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Alimentacao',
    description: 'Nome da categoria financeira.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must be at most 100 characters long' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Despesas com refeicoes e lanches.',
    nullable: true,
    description: 'Descricao opcional da categoria.',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(255, {
    message: 'description must be at most 255 characters long',
  })
  description?: string | null;
}
