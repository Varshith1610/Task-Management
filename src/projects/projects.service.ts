import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/project.dto';
import { ProjectMember } from './entities/project-member.entity';
import { Project } from './entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ProjectRole } from './project.constants';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepo: Repository<ProjectMember>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async createProject(userId: string, body: CreateProjectDto) {
    try {
      const project = this.projectRepo.create({ ...body, created_by: userId });
      await this.projectRepo.save(project);
      const member = this.memberRepo.create({
        project_id: project.id,
        user_id: userId,
        role: ProjectRole.ADMIN,
      });
      await this.memberRepo.save(member);
      return project;
    } catch {
      throw new Error('Failed to create project');
    }
  }

  async getAllUserProjects(userId: string) {
    const memberships = await this.memberRepo.find({
      where: { user_id: userId },
      relations: ['project'],
    });
    return memberships.map((membership) => membership.project);
  }

  async getProject(projectId: string, userId: string) {
    const membership = await this.memberRepo.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    if (!membership) throw new ForbiddenException('Access denied');

    return this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.user', 'createdBy'],
    });
  }

  async getTasksForProject(projectId: string, userId: string) {
    const role = await this.getUserRole(projectId, userId);
    if (!role) throw new ForbiddenException('Access denied');

    if (role === ProjectRole.ADMIN) {
      return this.taskRepo.find({
        where: { project_id: projectId },
        relations: ['assignee'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.taskRepo.find({
      where: { project_id: projectId, assignee_id: userId },
      relations: ['assignee'],
      order: { createdAt: 'DESC' },
    });
  }

  async addMember(projectId: string, adminId: string, targetEmail: string) {
    await this.assertAdmin(projectId, adminId);
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const user = await this.userRepo.findOne({ where: { email: targetEmail } });
    if (!user) throw new NotFoundException('User not found');

    const exists = await this.memberRepo.findOne({
      where: { project_id: projectId, user_id: user.id },
    });
    if (exists) throw new ConflictException('User is already a member');

    const member = this.memberRepo.create({
      project_id: projectId,
      user_id: user.id,
      role: ProjectRole.MEMBER,
    });
    await this.memberRepo.save(member);

    return {
      message: 'Member added',
      member: {
        user_id: user.id,
        email: user.email,
        name: user.name,
        role: member.role,
      },
    };
  }

  async removeMember(projectId: string, adminId: string, targetUserId: string) {
    await this.assertAdmin(projectId, adminId);
    if (targetUserId === adminId) {
      throw new ForbiddenException('Admin cannot remove themselves');
    }
    const membership = await this.memberRepo.findOne({
      where: { project_id: projectId, user_id: targetUserId },
    });
    if (!membership) throw new NotFoundException('Member not found');
    await this.memberRepo.delete({
      project_id: projectId,
      user_id: targetUserId,
    });
    return { message: 'Member removed' };
  }

  async getUserRole(
    projectId: string,
    userId: string,
  ): Promise<ProjectRole | null> {
    const m = await this.memberRepo.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    return m?.role ?? null;
  }

  private async assertAdmin(projectId: string, userId: string) {
    const role = await this.getUserRole(projectId, userId);
    if (role !== ProjectRole.ADMIN)
      throw new ForbiddenException('Admin access required');
  }
}
