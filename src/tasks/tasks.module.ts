import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), ProjectsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
