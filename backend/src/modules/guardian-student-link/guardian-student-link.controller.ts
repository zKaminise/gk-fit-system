import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GuardianStudentLinkService } from './guardian-student-link.service';
import { CreateGuardianStudentLinkDto } from './dto/create-guardian-student-link.dto';
import { UpdateGuardianStudentLinkDto } from './dto/update-guardian-student-link.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('guardian-student-links')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class GuardianStudentLinkController {
  constructor(private readonly linkService: GuardianStudentLinkService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateGuardianStudentLinkDto,
  ) {
    return this.linkService.create(tenantId, dto);
  }

  @Get('by-student/:studentId')
  findByStudent(
    @CurrentTenant() tenantId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.linkService.findByStudent(tenantId, studentId);
  }

  @Get('by-guardian/:guardianId')
  findByGuardian(
    @CurrentTenant() tenantId: string,
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
  ) {
    return this.linkService.findByGuardian(tenantId, guardianId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.linkService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuardianStudentLinkDto,
  ) {
    return this.linkService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.linkService.remove(tenantId, id);
  }
}
