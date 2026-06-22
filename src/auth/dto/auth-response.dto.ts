import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo.assinatura',
    description: 'Token JWT para autenticacao nas rotas protegidas.',
  })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({
    example: 86400,
    description: 'Tempo de expiracao do token em segundos.',
  })
  expiresIn!: number;

  @ApiProperty({ type: () => UserEntity })
  user!: UserEntity;
}
