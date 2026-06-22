import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

class PaginatedResponseDto<TData> {
  @ApiProperty({ type: () => PaginationMetaDto })
  meta!: PaginationMetaDto;

  data!: TData[];
}

export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  description: string,
) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, PaginationMetaDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}
