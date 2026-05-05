import { PartialType } from '@nestjs/mapped-types';

export class CreateDashboardDto {}

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {}
