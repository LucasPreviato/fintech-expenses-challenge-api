import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from '../../users/entities/user.entity';
import { GetDashboardQueryDto } from '../dto/get-dashboard-query.dto';
import { DashboardEntity } from '../entities/dashboard.entity';
import { DashboardService } from '../services/dashboard.service';

type RequestWithUser = Request & {
  user: UserEntity;
};

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @Req() request: RequestWithUser,
    @Query() query: GetDashboardQueryDto,
  ): Promise<DashboardEntity> {
    return this.dashboardService.getDashboard(request.user.id, query);
  }
}
