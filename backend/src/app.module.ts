import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { PersonModule } from './modules/person/person.module';
import { StudentModule } from './modules/student/student.module';
import { GuardianModule } from './modules/guardian/guardian.module';
import { GuardianStudentLinkModule } from './modules/guardian-student-link/guardian-student-link.module';
import { ModalityModule } from './modules/modality/modality.module';
import { LevelModule } from './modules/level/level.module';
import { ClassGroupModule } from './modules/class-group/class-group.module';
import { PlanModule } from './modules/plan/plan.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { EnrollmentClassGroupModule } from './modules/enrollment-class-group/enrollment-class-group.module';
import { ChargeModule } from './modules/charge/charge.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    TenantModule,
    UserModule,
    HealthModule,
    PersonModule,
    StudentModule,
    GuardianModule,
    GuardianStudentLinkModule,
    ModalityModule,
    LevelModule,
    ClassGroupModule,
    PlanModule,
    EnrollmentModule,
    EnrollmentClassGroupModule,
    ChargeModule,
    PaymentModule,
    AttendanceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}