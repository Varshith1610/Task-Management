import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from 'src/users/entities/user.entity';
import { ProjectRole } from '../project.constants';



@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string;

  @ManyToOne(() => User, (user) => user.projectMemberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: ProjectRole, default: ProjectRole.MEMBER })
  role: ProjectRole;

  @CreateDateColumn()
  joinedAt: Date;
}
