export const transactionTypeValues = ['INCOME', 'EXPENSE'] as const;

export type TransactionTypeValue = (typeof transactionTypeValues)[number];
