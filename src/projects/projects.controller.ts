import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

type AuthenticatedRequest = ExpressRequest & { user: { id: string } };

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createproject(@Request() req: AuthenticatedRequest, @Body() body: CreateProjectDto) {
    return this.projectsService.createProject(req.user.id, body);
  }

  @Get()
  async getAllUserProjects(@Request() req: AuthenticatedRequest) {
    return await this.projectsService.getAllUserProjects(req.user.id);
  }

  @Get(':id')
  async getProject(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return await this.projectsService.getProject(id, req.user.id);
  }

  @Get(':id/tasks')
  async getTasksForProject(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return await this.projectsService.getTasksForProject(id, req.user.id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body('email') email: string,
  ) {
    return await this.projectsService.addMember(id, req.user.id, email);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.removeMember(id, req.user.id, userId);
  }
}
