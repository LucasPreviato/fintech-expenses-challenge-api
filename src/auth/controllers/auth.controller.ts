import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '../../users/entities/user.entity';

type RequestWithUser = Request & {
  user: UserEntity;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuario' })
  @ApiCreatedResponse({
    description: 'Usuario registrado e autenticado com sucesso.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para cadastro.' })
  @ApiTooManyRequestsResponse({
    description: 'Limite de tentativas excedido temporariamente.',
  })
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuario' })
  @ApiOkResponse({
    description: 'Login realizado com sucesso.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados invalidos para login.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais invalidas.' })
  @ApiTooManyRequestsResponse({
    description: 'Limite de tentativas excedido temporariamente.',
  })
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obter o usuario autenticado' })
  @ApiOkResponse({
    description: 'Perfil do usuario autenticado.',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
  me(@Req() request: RequestWithUser): Promise<UserEntity> {
    return this.authService.me(request.user.id);
  }
}
