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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaginatedResult } from '../../common/pagination';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ListTransactionsQueryDto } from '../dto/list-transactions-query.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionsService } from '../services/transactions.service';

type RequestWithUser = Request & {
  user: UserEntity;
};

@ApiTags('Transactions')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar transacao financeira' })
  @ApiCreatedResponse({
    description: 'Transacao criada com sucesso.',
    type: TransactionEntity,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para cadastro.' })
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
  @ApiOperation({ summary: 'Listar transacoes com filtros e paginacao' })
  @ApiPaginatedResponse(
    TransactionEntity,
    'Transacoes listadas com sucesso.',
  )
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
  @ApiOperation({ summary: 'Buscar transacao por ID' })
  @ApiParam({ name: 'id', description: 'ID da transacao.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Transacao encontrada com sucesso.',
    type: TransactionEntity,
  })
  @ApiNotFoundResponse({ description: 'Transacao nao encontrada.' })
  findOne(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<TransactionEntity> {
    return this.transactionsService.findOne(request.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar transacao por ID' })
  @ApiParam({ name: 'id', description: 'ID da transacao.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Transacao atualizada com sucesso.',
    type: TransactionEntity,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para atualizacao.' })
  @ApiNotFoundResponse({ description: 'Transacao nao encontrada.' })
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
  @ApiOperation({ summary: 'Remover transacao por ID' })
  @ApiParam({ name: 'id', description: 'ID da transacao.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Transacao removida com sucesso.',
    type: TransactionEntity,
  })
  @ApiNotFoundResponse({ description: 'Transacao nao encontrada.' })
  remove(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<TransactionEntity> {
    return this.transactionsService.remove(request.user.id, id);
  }
}
