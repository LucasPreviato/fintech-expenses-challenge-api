import { Transform } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  transactionTypeValues,
  type TransactionTypeValue,
} from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description should not be empty' })
  @MaxLength(255, {
    message: 'description must be at most 255 characters long',
  })
  description!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'amount must be a string' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'amount must be a positive decimal string with up to 2 decimal places',
  })
  amount!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'date must be a string' })
  @IsISO8601(
    {},
    {
      message: 'date must be a valid ISO 8601 date string',
    },
  )
  date!: string;

  @IsIn(transactionTypeValues, {
    message: `type must be one of: ${transactionTypeValues.join(', ')}`,
  })
  type!: TransactionTypeValue;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId!: string;
}
