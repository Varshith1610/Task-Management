import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ProjectsService } from '../projects/projects.service';
import { Task, TaskStatus } from 'src/tasks/entities/task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    private readonly projectsService: ProjectsService,
  ) {}

  async getStats(projectId: string, userId: string) {
    const role = await this.projectsService.getUserRole(projectId, userId);
    if (!role) throw new ForbiddenException('Access denied');

    const today = new Date().toISOString().split('T')[0];

    const [total, byStatus, overdue, perUser] = await Promise.all([
      this.taskRepo.count({ where: { project_id: projectId } }),
      this.taskRepo
        .createQueryBuilder('t')
        .select('t.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('t.project_id = :projectId', { projectId })
        .groupBy('t.status')
        .getRawMany(),
      this.taskRepo.count({
        where: {
          project_id: projectId,
          dueDate: LessThan(today),
          status: TaskStatus.TODO,
        },
      }),
      this.taskRepo
        .createQueryBuilder('t')
        .select('u.name', 'name')
        .addSelect('COUNT(t.id)', 'taskCount')
        .leftJoin('t.assignee', 'u')
        .where('t.project_id = :projectId', { projectId })
        .groupBy('u.name')
        .getRawMany(),
    ]);

    return await { total, byStatus, overdue, perUser };
  }
}
