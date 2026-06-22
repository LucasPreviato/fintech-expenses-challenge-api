import { Transform } from 'class-transformer';
import { IsIn, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';
import {
  transactionTypeValues,
  type TransactionTypeValue,
} from '../enums/transaction-type.enum';

export class ListTransactionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(transactionTypeValues, {
    message: `type must be one of: ${transactionTypeValues.join(', ')}`,
  })
  type?: TransactionTypeValue;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsISO8601(
    {},
    {
      message: 'startDate must be a valid ISO 8601 date string',
    },
  )
  startDate?: string;

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
