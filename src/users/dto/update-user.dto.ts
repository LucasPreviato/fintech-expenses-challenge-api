import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { MatchesProperty } from '../../common/validators/matches-property.decorator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'Demo@123456',
    description:
      'Confirmacao obrigatoria ao enviar uma nova senha para atualizacao.',
  })
  @ValidateIf((object: UpdateUserDto) => object.password !== undefined)
  @IsDefined({
    message: 'confirmPassword is required when password is provided',
  })
  @IsString({ message: 'confirmPassword must be a string' })
  @IsNotEmpty({ message: 'confirmPassword should not be empty' })
  @MatchesProperty<UpdateUserDto>('password', {
    message: 'password and confirmPassword must match',
  })
  confirmPassword?: string;
}
