import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

type UserProjection = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash: await this.hashPassword(createUserDto.password),
        },
        select: userSelect,
      });

      return this.toEntity(user);
    } catch (error) {
      this.handlePrismaError(error, 'email');
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<UserEntity>> {
    const paginationParams = getPaginationParams(paginationQuery);
    const where = {
      deletedAt: null,
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        ...paginationParams,
        select: userSelect,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return createPaginatedResult(
      users.map((user) => this.toEntity(user)),
      total,
      paginationQuery,
    );
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }

    return this.toEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.ensureUserExists(id);

    const data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (updateUserDto.name !== undefined) {
      data.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email;
    }

    if (updateUserDto.password !== undefined) {
      data.passwordHash = await this.hashPassword(updateUserDto.password);
    }

    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data,
        select: userSelect,
      });

      return this.toEntity(user);
    } catch (error) {
      this.handlePrismaError(error, 'email');
    }
  }

  async remove(id: string): Promise<UserEntity> {
    await this.ensureUserExists(id);

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: userSelect,
    });

    return this.toEntity(user);
  }

  private toEntity(user: UserProjection): UserEntity {
    return new UserEntity(user);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }
  }

  private handlePrismaError(error: unknown, fieldName: string): never {
    if (this.isUniqueConstraintError(error)) {
      throw new ConflictException(`User with this ${fieldName} already exists.`);
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
