import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { Role } from '../../common/enums/role.enum';

@Controller('attendances')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.TEACHER)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateAttendanceDto,
  ) {
    return this.attendanceService.create(tenantId, user.userId, dto);
  }

  @Post('batch')
  createBatch(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() records: CreateAttendanceDto[],
  ) {
    return this.attendanceService.createBatch(tenantId, user.userId, records);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('classGroupId') classGroupId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.attendanceService.findAll(tenantId, {
      classGroupId,
      studentId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get('sheet/:classGroupId/:date')
  getAttendanceSheet(
    @CurrentTenant() tenantId: string,
    @Param('classGroupId', ParseUUIDPipe) classGroupId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceService.getClassGroupAttendanceSheet(
      tenantId,
      classGroupId,
      date,
    );
  }

  @Get('summary/student/:studentId')
  getStudentSummary(
    @CurrentTenant() tenantId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('classGroupId') classGroupId?: string,
  ) {
    return this.attendanceService.getStudentAttendanceSummary(
      tenantId,
      studentId,
      classGroupId,
    );
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(tenantId, id, user.userId, dto);
  }
}
