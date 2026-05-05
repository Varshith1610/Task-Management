import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { ProjectMember } from 'src/projects/entities/project-member.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProjectMember, (pm) => pm.user)
  projectMemberships: ProjectMember[];

  @OneToMany(() => Task, (t) => t.assignee)
  tasks: Task[];
}
