import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional } from 'class-validator';

export class GetDashboardQueryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsISO8601(
    {},
    {
      message: 'startDate must be a valid ISO 8601 date string',
    },
  )
  startDate?: string;

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
