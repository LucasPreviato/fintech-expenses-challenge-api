import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaginatedResult } from '../../common/pagination';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ListTransactionsQueryDto } from '../dto/list-transactions-query.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionsService } from '../services/transactions.service';

type RequestWithUser = Request & {
  user: UserEntity;
};

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Req() request: RequestWithUser,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    return this.transactionsService.create(
      request.user.id,
      createTransactionDto,
    );
  }

  @Get()
  findAll(
    @Req() request: RequestWithUser,
    @Query() listTransactionsQueryDto: ListTransactionsQueryDto,
  ): Promise<PaginatedResult<TransactionEntity>> {
    return this.transactionsService.findAll(
      request.user.id,
      listTransactionsQueryDto,
    );
  }

  @Get(':id')
  findOne(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<TransactionEntity> {
    return this.transactionsService.findOne(request.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    return this.transactionsService.update(
      request.user.id,
      id,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  remove(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<TransactionEntity> {
    return this.transactionsService.remove(request.user.id, id);
  }
}
