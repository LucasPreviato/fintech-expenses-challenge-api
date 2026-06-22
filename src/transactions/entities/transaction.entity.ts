import { ApiProperty } from '@nestjs/swagger';
import { type TransactionTypeValue } from '../enums/transaction-type.enum';

export class TransactionCategorySummaryEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Fornecedores' })
  name!: string;

  constructor(partial: Partial<TransactionCategorySummaryEntity>) {
    Object.assign(this, partial);
  }
}

export class TransactionEntity {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Pagamento de fornecedor' })
  description!: string;

  @ApiProperty({ example: '1250.50' })
  amount!: string;

  @ApiProperty({ example: '2026-06-22T10:30:00.000Z' })
  date!: Date;

  @ApiProperty({ example: 'expense' })
  type!: TransactionTypeValue;

  @ApiProperty({ type: () => TransactionCategorySummaryEntity })
  category!: TransactionCategorySummaryEntity;

  @ApiProperty({ example: '2026-06-22T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-22T12:30:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<TransactionEntity>) {
    Object.assign(this, partial);
  }
}
