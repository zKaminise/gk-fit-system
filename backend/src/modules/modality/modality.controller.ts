import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ModalityService } from './modality.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('modalities')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class ModalityController {
  constructor(private readonly modalityService: ModalityService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateModalityDto,
  ) {
    return this.modalityService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.modalityService.findAll(tenantId, activeOnly === 'true');
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.modalityService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModalityDto,
  ) {
    return this.modalityService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.modalityService.deactivate(tenantId, id);
  }
}
