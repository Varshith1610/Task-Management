import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

type AuthenticatedRequest = ExpressRequest & { user: { id: string } };

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
      return await this.tasksService.createTask(createTaskDto, req.user.id);
    } 

  @Get()
  async getTasks(@Request() req: AuthenticatedRequest) {
      return await this.tasksService.getTasks(req.user.id);
  }

  @Get(':id')
  async getTask(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
      return await this.tasksService.getTask(id, req.user.id);
    }

  @Patch(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
      return await this.tasksService.updateTask(id, updateTaskDto, req.user.id);
    } 

  @Delete(':id')
  async removeTask(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
      return await this.tasksService.removeTask(id, req.user.id);
  }
}
