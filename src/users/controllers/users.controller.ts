import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { PaginatedResult, PaginationQueryDto } from '../../common/pagination';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios com paginacao' })
  @ApiPaginatedResponse(UserEntity, 'Usuarios listados com sucesso.')
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<UserEntity>> {
    return this.usersService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuario.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Usuario encontrado com sucesso.',
    type: UserEntity,
  })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  findOne(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuario.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Usuario atualizado com sucesso.',
    type: UserEntity,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para atualizacao.' })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuario.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Usuario removido com sucesso.',
    type: UserEntity,
  })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  remove(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.remove(id);
  }
}
