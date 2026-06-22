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
import { PaginatedResult, PaginationQueryDto } from '../../common/pagination';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryEntity } from '../entities/category.entity';
import { CategoriesService } from '../services/categories.service';

type RequestWithUser = Request & {
  user: UserEntity;
};

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Req() request: RequestWithUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.create(request.user.id, createCategoryDto);
  }

  @Get()
  findAll(
    @Req() request: RequestWithUser,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<CategoryEntity>> {
    return this.categoriesService.findAll(request.user.id, paginationQuery);
  }

  @Get(':id')
  findOne(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.findOne(request.user.id, id);
  }

  @Patch(':id')
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
  remove(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.remove(request.user.id, id);
  }
}
