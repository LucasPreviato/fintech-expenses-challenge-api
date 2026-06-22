import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Pagina atual da listagem.',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be greater than or equal to 1' })
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Quantidade de itens por pagina.',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'perPage must be an integer' })
  @Min(1, { message: 'perPage must be greater than or equal to 1' })
  @Max(100, { message: 'perPage must be less than or equal to 100' })
  perPage: number = 10;
}
