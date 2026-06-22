import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'Pagamento de fornecedor',
    description: 'Descricao da movimentacao financeira.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description should not be empty' })
  @MaxLength(255, {
    message: 'description must be at most 255 characters long',
  })
  description!: string;

  @ApiProperty({
    example: '1250.50',
    description: 'Valor positivo em formato decimal string com ate 2 casas.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'amount must be a string' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'amount must be a positive decimal string with up to 2 decimal places',
  })
  amount!: string;

  @ApiProperty({
    example: '2026-06-22T10:30:00.000Z',
    description: 'Data da transacao em formato ISO 8601.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'date must be a string' })
  @IsISO8601(
    {},
    {
      message: 'date must be a valid ISO 8601 date string',
    },
  )
  date!: string;

  @ApiProperty({
    example: 'expense',
    enum: transactionTypeValues,
    description: 'Tipo da transacao.',
  })
  @IsIn(transactionTypeValues, {
    message: `type must be one of: ${transactionTypeValues.join(', ')}`,
  })
  type!: TransactionTypeValue;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador da categoria associada.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId!: string;
}
