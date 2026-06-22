import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserEntity } from '../../users/entities/user.entity';
import { GetDashboardQueryDto } from '../dto/get-dashboard-query.dto';
import { DashboardEntity } from '../entities/dashboard.entity';
import { DashboardService } from '../services/dashboard.service';

type RequestWithUser = Request & {
  user: UserEntity;
};

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obter indicadores consolidados do dashboard' })
  @ApiOkResponse({
    description: 'Indicadores consolidados retornados com sucesso.',
    type: DashboardEntity,
  })
  getDashboard(
    @Req() request: RequestWithUser,
    @Query() query: GetDashboardQueryDto,
  ): Promise<DashboardEntity> {
    return this.dashboardService.getDashboard(request.user.id, query);
  }
}
