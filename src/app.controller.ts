import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  @Public()
  @Get('healthz')
  @ApiOperation({ summary: 'Verificar a saude da aplicacao' })
  @ApiOkResponse({
    description: 'Aplicacao respondendo normalmente.',
    schema: {
      example: {
        status: HttpStatus.OK,
      },
    },
  })
  getHealthz() {
    return { status: HttpStatus.OK };
  }
}
