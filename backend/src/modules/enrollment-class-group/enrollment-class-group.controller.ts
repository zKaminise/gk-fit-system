import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EnrollmentClassGroupService } from './enrollment-class-group.service';
import { CreateEnrollmentClassGroupDto } from './dto/create-enrollment-class-group.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('enrollment-class-groups')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class EnrollmentClassGroupController {
  constructor(
    private readonly ecgService: EnrollmentClassGroupService,
  ) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateEnrollmentClassGroupDto,
  ) {
    return this.ecgService.create(tenantId, dto);
  }

  @Get('by-enrollment/:enrollmentId')
  findByEnrollment(
    @CurrentTenant() tenantId: string,
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
  ) {
    return this.ecgService.findByEnrollment(tenantId, enrollmentId);
  }

  @Get('by-class-group/:classGroupId')
  findByClassGroup(
    @CurrentTenant() tenantId: string,
    @Param('classGroupId', ParseUUIDPipe) classGroupId: string,
  ) {
    return this.ecgService.findByClassGroup(tenantId, classGroupId);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ecgService.remove(tenantId, id);
  }
}
