import { Module } from '@nestjs/common';
import { EnrollmentClassGroupService } from './enrollment-class-group.service';
import { EnrollmentClassGroupController } from './enrollment-class-group.controller';

@Module({
  controllers: [EnrollmentClassGroupController],
  providers: [EnrollmentClassGroupService],
  exports: [EnrollmentClassGroupService],
})
export class EnrollmentClassGroupModule {}