import { Module } from '@nestjs/common';
import { GuardianStudentLinkService } from './guardian-student-link.service';
import { GuardianStudentLinkController } from './guardian-student-link.controller';

@Module({
  controllers: [GuardianStudentLinkController],
  providers: [GuardianStudentLinkService],
  exports: [GuardianStudentLinkService],
})
export class GuardianStudentLinkModule {}