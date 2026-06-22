export class DashboardTopExpenseCategoryEntity {
  categoryId!: string;
  categoryName!: string;
  totalAmount!: string;

  constructor(partial: Partial<DashboardTopExpenseCategoryEntity>) {
    Object.assign(this, partial);
  }
}

export class DashboardPeriodEntity {
  startDate!: string | null;
  endDate!: string | null;

  constructor(partial: Partial<DashboardPeriodEntity>) {
    Object.assign(this, partial);
  }
}

export class DashboardEntity {
  balance!: string;
  totalIncome!: string;
  totalExpense!: string;
  topExpenseCategories!: DashboardTopExpenseCategoryEntity[];
  period!: DashboardPeriodEntity;

  constructor(partial: Partial<DashboardEntity>) {
    Object.assign(this, partial);
  }
}
