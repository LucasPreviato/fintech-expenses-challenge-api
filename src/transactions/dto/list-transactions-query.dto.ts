import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';
import {
  transactionTypeValues,
  type TransactionTypeValue,
} from '../enums/transaction-type.enum';

export class ListTransactionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'expense',
    enum: transactionTypeValues,
    description: 'Filtra transacoes por tipo.',
  })
  @IsOptional()
  @IsIn(transactionTypeValues, {
    message: `type must be one of: ${transactionTypeValues.join(', ')}`,
  })
  type?: TransactionTypeValue;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filtra transacoes por categoria.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Data inicial do filtro em ISO 8601.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsISO8601(
    {},
    {
      message: 'startDate must be a valid ISO 8601 date string',
    },
  )
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.999Z',
    description: 'Data final do filtro em ISO 8601.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsISO8601(
    {},
    {
      message: 'endDate must be a valid ISO 8601 date string',
    },
  )
  endDate?: string;
}
