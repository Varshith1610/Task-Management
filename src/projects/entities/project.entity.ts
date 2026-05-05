import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ProjectMember } from './project-member.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column()
  created_by: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
  members: ProjectMember[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
