import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { MatchesProperty } from '../../common/validators/matches-property.decorator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({
    example: 'Demo@123456',
    description: 'Confirmacao da senha informada no cadastro.',
  })
  @IsString({ message: 'confirmPassword must be a string' })
  @IsNotEmpty({ message: 'confirmPassword should not be empty' })
  @MatchesProperty<RegisterDto>('password', {
    message: 'password and confirmPassword must match',
  })
  confirmPassword!: string;
}
