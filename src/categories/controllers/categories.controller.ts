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
import { PaginatedResult, PaginationQueryDto } from '../../common/pagination';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryEntity } from '../entities/category.entity';
import { CategoriesService } from '../services/categories.service';

type RequestWithUser = Request & {
  user: UserEntity;
};

@ApiTags('Categories')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiCreatedResponse({
    description: 'Categoria criada com sucesso.',
    type: CategoryEntity,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para cadastro.' })
  create(
    @Req() request: RequestWithUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.create(request.user.id, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias do usuario autenticado' })
  @ApiPaginatedResponse(CategoryEntity, 'Categorias listadas com sucesso.')
  findAll(
    @Req() request: RequestWithUser,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<CategoryEntity>> {
    return this.categoriesService.findAll(request.user.id, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID da categoria.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Categoria encontrada com sucesso.',
    type: CategoryEntity,
  })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada.' })
  findOne(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.findOne(request.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID da categoria.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Categoria atualizada com sucesso.',
    type: CategoryEntity,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para atualizacao.' })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada.' })
  update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.update(
      request.user.id,
      id,
      updateCategoryDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID da categoria.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Categoria removida com sucesso.',
    type: CategoryEntity,
  })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada.' })
  remove(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.remove(request.user.id, id);
  }
}
