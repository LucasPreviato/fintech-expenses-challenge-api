import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDto {
  accessToken!: string;
  tokenType!: 'Bearer';
  expiresIn!: number;
  user!: UserEntity;
}
