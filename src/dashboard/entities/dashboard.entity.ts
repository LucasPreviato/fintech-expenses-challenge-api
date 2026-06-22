import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardTopExpenseCategoryEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  categoryId!: string;

  @ApiProperty({ example: 'Fornecedores' })
  categoryName!: string;

  @ApiProperty({ example: '4200.00' })
  totalAmount!: string;

  constructor(partial: Partial<DashboardTopExpenseCategoryEntity>) {
    Object.assign(this, partial);
  }
}

export class DashboardPeriodEntity {
  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    nullable: true,
  })
  startDate!: string | null;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.999Z',
    nullable: true,
  })
  endDate!: string | null;

  constructor(partial: Partial<DashboardPeriodEntity>) {
    Object.assign(this, partial);
  }
}

export class DashboardEntity {
  @ApiProperty({ example: '15200.35' })
  balance!: string;

  @ApiProperty({ example: '25000.00' })
  totalIncome!: string;

  @ApiProperty({ example: '9799.65' })
  totalExpense!: string;

  @ApiProperty({ type: () => [DashboardTopExpenseCategoryEntity] })
  topExpenseCategories!: DashboardTopExpenseCategoryEntity[];

  @ApiProperty({ type: () => DashboardPeriodEntity })
  period!: DashboardPeriodEntity;

  constructor(partial: Partial<DashboardEntity>) {
    Object.assign(this, partial);
  }
}
