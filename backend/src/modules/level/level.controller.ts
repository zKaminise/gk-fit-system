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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('levels')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateLevelDto,
  ) {
    return this.levelService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('modalityId') modalityId?: string,
  ) {
    return this.levelService.findAll(tenantId, modalityId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.levelService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLevelDto,
  ) {
    return this.levelService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.levelService.remove(tenantId, id);
  }
}
