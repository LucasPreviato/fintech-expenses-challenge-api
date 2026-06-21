import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResult } from './interfaces/paginated-result.interface';

export interface PaginationParams {
  skip: number;
  take: number;
}

export function getPaginationParams(query: PaginationQueryDto): PaginationParams {
  return {
    skip: (query.page - 1) * query.perPage,
    take: query.perPage,
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  query: PaginationQueryDto,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / query.perPage);

  return {
    data,
    meta: {
      page: query.page,
      perPage: query.perPage,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
}
