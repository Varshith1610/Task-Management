import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Task } from '../tasks/entities/task.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), ProjectsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
