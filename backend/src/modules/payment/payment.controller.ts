import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { Role } from '../../common/enums/role.enum';

@Controller('payments')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.create(tenantId, user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('chargeId') chargeId?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.paymentService.findAll(tenantId, {
      chargeId,
      paymentMethod,
      dateFrom,
      dateTo,
    });
  }

  @Get('summary')
  getSummary(
    @CurrentTenant() tenantId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.paymentService.getSummaryByTenant(tenantId, { dateFrom, dateTo });
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentService.findById(tenantId, id);
  }
}
