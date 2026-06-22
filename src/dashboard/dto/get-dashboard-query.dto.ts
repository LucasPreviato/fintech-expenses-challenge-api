import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional } from 'class-validator';

export class GetDashboardQueryDto {
  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Data inicial do periodo em ISO 8601.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsISO8601(
    {},
    {
      message: 'startDate must be a valid ISO 8601 date string',
    },
  )
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.999Z',
    description: 'Data final do periodo em ISO 8601.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsISO8601(
    {},
    {
      message: 'endDate must be a valid ISO 8601 date string',
    },
  )
  endDate?: string;
}
