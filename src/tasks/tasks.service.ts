import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Task } from './entities/task.entity';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectRole } from 'src/projects/project.constants';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    private readonly projectsService: ProjectsService,
  ) {}

  async createTask(body: CreateTaskDto, userId: string) {
    try {
      await this.validateAdminRole(body.project_id, userId);
      const task = this.taskRepo.create(body);
      return await this.taskRepo.save(task);
    } catch (error) {
      throw error;
    }
  }

  async getTasks(userId: string) {
    try {
      return await this.taskRepo
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .innerJoin(
          'project_members',
          'pm',
          'pm.project_id = task.project_id AND pm.user_id = :userId',
          { userId },
        )
        .andWhere('(pm.role = :adminRole OR task.assignee_id = :userId)', {
          adminRole: ProjectRole.ADMIN,
          userId,
        })
        .orderBy('task.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw error;
    }
  }

  async getTask(taskId: string, userId: string) {
    try {
      const task = await this.taskRepo.findOne({
        where: { id: taskId },
        relations: ['assignee'],
      });
      if (!task) throw new NotFoundException('Task not found');
      await this.validateTaskVisibility(task, userId);
      return task;
    } catch (error) {
      throw error;
    }
  }

  async updateTask(taskId: string, body: UpdateTaskDto, userId: string) {
    try {
      const task = await this.taskRepo.findOneBy({ id: taskId });
      if (!task) throw new NotFoundException('Task not found');

      const role = await this.validateProjectMembership(task.project_id, userId);
      await this.validateTaskUpdatePermissions(task, body, role, userId);

      Object.assign(task, body);
      return await this.taskRepo.save(task);
    } catch (error) {
      throw error;
    }
  }

  async removeTask(taskId: string, userId: string) {
    try {
      const task = await this.taskRepo.findOneBy({ id: taskId });
      if (!task) throw new NotFoundException('Task not found');

      await this.validateDeletePermission(task.project_id, userId);
      await this.taskRepo.remove(task);
      return { message: 'Deleted' };
    } catch (error) {
      throw error;
    }
  }

  private async validateTaskVisibility(task: Task, userId: string) {
    try {
      const role = await this.validateProjectMembership(task.project_id, userId);
      if (role === ProjectRole.MEMBER && task.assignee_id !== userId) {
        throw new ForbiddenException('Members can only view assigned tasks');
      }
    } catch (error) {
      throw error;
    }
  }

  private async validateProjectMembership(
    projectId: string,
    userId: string,
  ): Promise<ProjectRole> {
    try {
      const role = await this.projectsService.getUserRole(projectId, userId);
      if (!role) throw new ForbiddenException('Access denied');
      return role;
    } catch (error) {
      throw error;
    }
  }

  private async validateAdminRole(projectId: string, userId: string) {
    try {
      const role = await this.validateProjectMembership(projectId, userId);
      if (role !== ProjectRole.ADMIN) {
        throw new ForbiddenException('Only project admins can manage this action');
      }
    } catch (error) {
      throw error;
    }
  }

  private async validateTaskUpdatePermissions(
    task: Task,
    dto: UpdateTaskDto,
    role: ProjectRole,
    userId: string,
  ) {
    try {
      if (role === ProjectRole.MEMBER && task.assignee_id !== userId) {
        throw new ForbiddenException(
          'Members can only update their assigned tasks',
        );
      }

      if (
        role === ProjectRole.MEMBER &&
        dto.assignee_id &&
        dto.assignee_id !== task.assignee_id
      ) {
        throw new ForbiddenException('Members cannot reassign tasks');
      }

      if (role === ProjectRole.MEMBER) {
        const editableByMember: (keyof UpdateTaskDto)[] = ['status'];
        const dtoKeys = Object.keys(dto) as (keyof UpdateTaskDto)[];
        const invalidField = dtoKeys.find(
          (key) => !editableByMember.includes(key),
        );
        if (invalidField) {
          throw new BadRequestException('Members can only update task status');
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Kept for compatibility where specific delete wording is expected.
  private async validateDeletePermission(
    projectId: string,
    userId: string,
  ) {
    try {
      const role = await this.validateProjectMembership(projectId, userId);
      if (role !== ProjectRole.ADMIN) {
        throw new ForbiddenException('Only project admins can delete tasks');
      }
    } catch (error) {
      throw error;
    }
  }
}
