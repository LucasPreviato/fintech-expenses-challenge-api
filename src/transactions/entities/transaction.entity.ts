import { type TransactionTypeValue } from '../enums/transaction-type.enum';

export class TransactionCategorySummaryEntity {
  id!: string;
  name!: string;

  constructor(partial: Partial<TransactionCategorySummaryEntity>) {
    Object.assign(this, partial);
  }
}

export class TransactionEntity {
  id!: string;
  description!: string;
  amount!: string;
  date!: Date;
  type!: TransactionTypeValue;
  category!: TransactionCategorySummaryEntity;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<TransactionEntity>) {
    Object.assign(this, partial);
  }
}
