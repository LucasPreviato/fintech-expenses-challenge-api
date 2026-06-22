import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type TransactionType } from '../../../generated/prisma/client';
import {
  createPaginatedResult,
  getPaginationParams,
  type PaginatedResult,
} from '../../common/pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ListTransactionsQueryDto } from '../dto/list-transactions-query.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import {
  TransactionCategorySummaryEntity,
  TransactionEntity,
} from '../entities/transaction.entity';

const transactionSelect = {
  id: true,
  description: true,
  amount: true,
  date: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

type TransactionProjection = {
  id: string;
  description: string;
  amount: Prisma.Decimal;
  date: Date;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    await this.ensureOwnedCategory(userId, createTransactionDto.categoryId);

    const transaction = await this.prisma.transaction.create({
      data: {
        description: createTransactionDto.description,
        amount: this.parseAmount(createTransactionDto.amount),
        date: this.parseExactDate(createTransactionDto.date),
        type: createTransactionDto.type,
        userId,
        categoryId: createTransactionDto.categoryId,
      },
      select: transactionSelect,
    });

    return this.toEntity(transaction);
  }

  async findAll(
    userId: string,
    listTransactionsQueryDto: ListTransactionsQueryDto,
  ): Promise<PaginatedResult<TransactionEntity>> {
    const paginationParams = getPaginationParams(listTransactionsQueryDto);
    const where = this.buildWhere(userId, listTransactionsQueryDto);

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        ...paginationParams,
        select: transactionSelect,
      }),
      this.prisma.transaction.count({
        where,
      }),
    ]);

    return createPaginatedResult(
      transactions.map((transaction) => this.toEntity(transaction)),
      total,
      listTransactionsQueryDto,
    );
  }

  findOne(userId: string, id: string): Promise<TransactionEntity> {
    return this.findOwnedById(userId, id);
  }

  async update(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    if (updateTransactionDto.categoryId !== undefined) {
      await this.ensureOwnedCategory(userId, updateTransactionDto.categoryId);
    }

    const data: Prisma.TransactionUncheckedUpdateManyInput = {};

    if (updateTransactionDto.description !== undefined) {
      data.description = updateTransactionDto.description;
    }

    if (updateTransactionDto.amount !== undefined) {
      data.amount = this.parseAmount(updateTransactionDto.amount);
    }

    if (updateTransactionDto.date !== undefined) {
      data.date = this.parseExactDate(updateTransactionDto.date);
    }

    if (updateTransactionDto.type !== undefined) {
      data.type = updateTransactionDto.type;
    }

    if (updateTransactionDto.categoryId !== undefined) {
      data.categoryId = updateTransactionDto.categoryId;
    }

    const updateResult = await this.prisma.transaction.updateMany({
      where: {
        id,
        userId,
      },
      data,
    });

    if (updateResult.count === 0) {
      throw new NotFoundException(`Transaction with id "${id}" not found.`);
    }

    return this.findOwnedById(userId, id);
  }

  async remove(userId: string, id: string): Promise<TransactionEntity> {
    const transaction = await this.findOwnedById(userId, id);
    const deleteResult = await this.prisma.transaction.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (deleteResult.count === 0) {
      throw new NotFoundException(`Transaction with id "${id}" not found.`);
    }

    return transaction;
  }

  private async findOwnedById(
    userId: string,
    id: string,
  ): Promise<TransactionEntity> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      select: transactionSelect,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found.`);
    }

    return this.toEntity(transaction);
  }

  private async ensureOwnedCategory(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id "${categoryId}" not found.`,
      );
    }
  }

  private buildWhere(
    userId: string,
    query: ListTransactionsQueryDto,
  ): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (query.type !== undefined) {
      where.type = query.type;
    }

    if (query.categoryId !== undefined) {
      where.categoryId = query.categoryId;
    }

    if (query.startDate !== undefined || query.endDate !== undefined) {
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

      where.date = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    return where;
  }

  private toEntity(transaction: TransactionProjection): TransactionEntity {
    return new TransactionEntity({
      ...transaction,
      amount: transaction.amount.toFixed(2),
      category: new TransactionCategorySummaryEntity(transaction.category),
    });
  }

  private parseAmount(value: string): Prisma.Decimal {
    const normalizedValue = value.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) {
      throw new BadRequestException(
        'amount must be a positive decimal string with up to 2 decimal places.',
      );
    }

    const decimal = new Prisma.Decimal(normalizedValue);

    if (!decimal.isFinite() || decimal.lte(0)) {
      throw new BadRequestException('amount must be greater than zero.');
    }

    if (decimal.greaterThan(new Prisma.Decimal('999999999999.99'))) {
      throw new BadRequestException(
        'amount must be less than or equal to 999999999999.99.',
      );
    }

    return decimal.toDecimalPlaces(2);
  }

  private parseExactDate(value: string): Date {
    const normalizedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      return this.createDateOrFail(`${normalizedValue}T00:00:00.000Z`, 'date');
    }

    return this.createDateOrFail(normalizedValue, 'date');
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
}
