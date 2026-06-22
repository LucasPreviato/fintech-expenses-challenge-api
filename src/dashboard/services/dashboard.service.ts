import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetDashboardQueryDto } from '../dto/get-dashboard-query.dto';
import {
  DashboardEntity,
  DashboardPeriodEntity,
  DashboardTopExpenseCategoryEntity,
} from '../entities/dashboard.entity';

type DashboardSummaryRow = {
  totalIncome: Prisma.Decimal | null;
  totalExpense: Prisma.Decimal | null;
};

type DashboardTopExpenseCategoryRow = {
  categoryId: string;
  categoryName: string;
  totalAmount: Prisma.Decimal;
};

type DashboardDateRange = {
  startDate?: Date;
  endDate?: Date;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(
    userId: string,
    query: GetDashboardQueryDto,
  ): Promise<DashboardEntity> {
    const dateRange = this.buildDateRange(query);
    const summaryWhereClause = this.buildWhereClause(userId, dateRange);
    const topExpenseWhereClause = this.buildWhereClause(
      userId,
      dateRange,
      TransactionType.EXPENSE,
    );

    const [summaryRows, topExpenseRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<DashboardSummaryRow[]>(Prisma.sql`
        SELECT
          COALESCE(
            SUM(dtf."amount") FILTER (WHERE dtf."type" = 'INCOME'),
            0
          ) AS "totalIncome",
          COALESCE(
            SUM(dtf."amount") FILTER (WHERE dtf."type" = 'EXPENSE'),
            0
          ) AS "totalExpense"
        FROM "dashboard_transaction_facts" dtf
        ${summaryWhereClause}
      `),
      this.prisma.$queryRaw<DashboardTopExpenseCategoryRow[]>(Prisma.sql`
        SELECT
          dtf."category_id" AS "categoryId",
          dtf."category_name" AS "categoryName",
          SUM(dtf."amount") AS "totalAmount"
        FROM "dashboard_transaction_facts" dtf
        ${topExpenseWhereClause}
        GROUP BY dtf."category_id", dtf."category_name"
        ORDER BY SUM(dtf."amount") DESC, dtf."category_name" ASC
        LIMIT 3
      `),
    ]);

    const summary = summaryRows[0] ?? {
      totalIncome: new Prisma.Decimal(0),
      totalExpense: new Prisma.Decimal(0),
    };
    const totalIncome = this.formatDecimal(summary.totalIncome);
    const totalExpense = this.formatDecimal(summary.totalExpense);
    const balance = new Prisma.Decimal(totalIncome)
      .minus(new Prisma.Decimal(totalExpense))
      .toFixed(2);

    return new DashboardEntity({
      balance,
      totalIncome,
      totalExpense,
      topExpenseCategories: topExpenseRows.map(
        (row) =>
          new DashboardTopExpenseCategoryEntity({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            totalAmount: this.formatDecimal(row.totalAmount),
          }),
      ),
      period: new DashboardPeriodEntity({
        startDate: query.startDate ?? null,
        endDate: query.endDate ?? null,
      }),
    });
  }

  private buildWhereClause(
    userId: string,
    dateRange: DashboardDateRange,
    type?: TransactionType,
  ): Prisma.Sql {
    const conditions: Prisma.Sql[] = [Prisma.sql`dtf."user_id" = ${userId}`];

    if (type !== undefined) {
      conditions.push(Prisma.sql`dtf."type" = ${type}`);
    }

    if (dateRange.startDate !== undefined) {
      conditions.push(Prisma.sql`dtf."date" >= ${dateRange.startDate}`);
    }

    if (dateRange.endDate !== undefined) {
      conditions.push(Prisma.sql`dtf."date" <= ${dateRange.endDate}`);
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
  }

  private buildDateRange(query: GetDashboardQueryDto): DashboardDateRange {
    if (query.startDate === undefined && query.endDate === undefined) {
      return {};
    }

    const startDate =
      query.startDate !== undefined
        ? this.parseFilterDate(query.startDate, 'start')
        : undefined;
    const endDate =
      query.endDate !== undefined
        ? this.parseFilterDate(query.endDate, 'end')
        : undefined;

    if (
      startDate !== undefined &&
      endDate !== undefined &&
      startDate.getTime() > endDate.getTime()
    ) {
      throw new BadRequestException(
        'startDate must be less than or equal to endDate.',
      );
    }

    return {
      startDate,
      endDate,
    };
  }

  private parseFilterDate(value: string, boundary: 'start' | 'end'): Date {
    const normalizedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      const suffix = boundary === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';

      return this.createDateOrFail(
        `${normalizedValue}${suffix}`,
        boundary === 'start' ? 'startDate' : 'endDate',
      );
    }

    return this.createDateOrFail(
      normalizedValue,
      boundary === 'start' ? 'startDate' : 'endDate',
    );
  }

  private createDateOrFail(value: string, fieldName: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        `${fieldName} must be a valid ISO 8601 date string.`,
      );
    }

    return date;
  }

  private formatDecimal(
    value: Prisma.Decimal | string | number | null | undefined,
  ): string {
    if (value === null || value === undefined) {
      return '0.00';
    }

    const decimal =
      value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);

    return decimal.toDecimalPlaces(2).toFixed(2);
  }
}
