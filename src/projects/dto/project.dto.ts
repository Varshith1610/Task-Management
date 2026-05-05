import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
