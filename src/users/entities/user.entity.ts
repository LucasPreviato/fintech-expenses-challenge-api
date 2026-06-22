import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@empresa.com' })
  email!: string;

  @ApiProperty({ example: '2026-06-22T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-22T12:30:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
  })
  deletedAt!: Date | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
