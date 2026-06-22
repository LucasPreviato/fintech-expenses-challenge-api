import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Alimentacao' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Despesas com refeicoes e lanches.',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ example: '2026-06-22T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-22T12:30:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
