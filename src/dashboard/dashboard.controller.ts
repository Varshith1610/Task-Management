import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

type AuthenticatedRequest = ExpressRequest & { user: { id: string } };

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':projectId')
  async getStats(@Param('projectId') projectId: string, @Request() req: AuthenticatedRequest) {
    return await this.dashboardService.getStats(projectId, req.user.id);
  }
}
