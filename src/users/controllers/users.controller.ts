import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

type RequestWithUser = Request & {
  user: UserEntity;
};

@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Buscar o proprio usuario autenticado' })
  @ApiOkResponse({
    description: 'Usuario encontrado com sucesso.',
    type: UserEntity,
  })
  findMe(@Req() request: RequestWithUser): Promise<UserEntity> {
    return this.usersService.findOne(request.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar o proprio usuario autenticado' })
  @ApiOkResponse({
    description: 'Usuario atualizado com sucesso.',
    type: UserEntity,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para atualizacao.' })
  updateMe(
    @Req() request: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(request.user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Remover o proprio usuario autenticado' })
  @ApiOkResponse({
    description: 'Usuario removido com sucesso.',
    type: UserEntity,
  })
  removeMe(@Req() request: RequestWithUser): Promise<UserEntity> {
    return this.usersService.remove(request.user.id);
  }
}
