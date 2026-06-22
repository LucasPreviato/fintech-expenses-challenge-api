import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createPaginatedResult,
  getPaginationParams,
  type PaginatedResult,
  type PaginationQueryDto,
} from '../../common/pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryEntity } from '../entities/category.entity';

const categorySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;

type CategoryProjection = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          description: createCategoryDto.description ?? null,
          userId,
        },
        select: categorySelect,
      });

      return this.toEntity(category);
    } catch (error) {
      this.handlePrismaError(error, 'name');
    }
  }

  async findAll(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<CategoryEntity>> {
    const paginationParams = getPaginationParams(paginationQuery);
    const where = {
      userId,
    };

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        ...paginationParams,
        select: categorySelect,
      }),
      this.prisma.category.count({
        where,
      }),
    ]);

    return createPaginatedResult(
      categories.map((category) => this.toEntity(category)),
      total,
      paginationQuery,
    );
  }

  findOne(userId: string, id: string): Promise<CategoryEntity> {
    return this.findOwnedById(userId, id);
  }

  async update(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    await this.findOwnedById(userId, id);

    const data: {
      name?: string;
      description?: string | null;
    } = {};

    if (updateCategoryDto.name !== undefined) {
      data.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.description !== undefined) {
      data.description = updateCategoryDto.description;
    }

    try {
      const category = await this.prisma.category.update({
        where: {
          id,
        },
        data,
        select: categorySelect,
      });

      return this.toEntity(category);
    } catch (error) {
      this.handlePrismaError(error, 'name');
    }
  }

  async remove(userId: string, id: string): Promise<CategoryEntity> {
    await this.findOwnedById(userId, id);

    const category = await this.prisma.category.delete({
      where: {
        id,
      },
      select: categorySelect,
    });

    return this.toEntity(category);
  }

  private async findOwnedById(
    userId: string,
    id: string,
  ): Promise<CategoryEntity> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      select: categorySelect,
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found.`);
    }

    return this.toEntity(category);
  }

  private toEntity(category: CategoryProjection): CategoryEntity {
    return new CategoryEntity(category);
  }

  private handlePrismaError(error: unknown, fieldName: string): never {
    if (this.isUniqueConstraintError(error)) {
      throw new ConflictException(
        `Category with this ${fieldName} already exists.`,
      );
    }

    throw error;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }
}
