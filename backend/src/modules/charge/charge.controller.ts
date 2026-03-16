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
import { ChargeService } from './charge.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('charges')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateChargeDto,
  ) {
    return this.chargeService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('enrollmentId') enrollmentId?: string,
    @Query('status') status?: string,
    @Query('payerPersonId') payerPersonId?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
    @Query('referenceMonth') referenceMonth?: string,
  ) {
    return this.chargeService.findAll(tenantId, {
      enrollmentId,
      status,
      payerPersonId,
      dueDateFrom,
      dueDateTo,
      referenceMonth,
    });
  }

  @Get('summary')
  getSummary(@CurrentTenant() tenantId: string) {
    return this.chargeService.getSummaryByTenant(tenantId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chargeService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChargeDto,
  ) {
    return this.chargeService.update(tenantId, id, dto);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chargeService.cancel(tenantId, id);
  }
}
