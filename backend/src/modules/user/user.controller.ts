import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.TENANT_ADMIN)
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.create(tenantId, dto);
  }

  @Get()
  @Roles(Role.TENANT_ADMIN)
  findAll(@CurrentTenant() tenantId: string) {
    return this.userService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles(Role.TENANT_ADMIN)
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.userService.findById(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.TENANT_ADMIN)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.TENANT_ADMIN)
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.userService.deactivate(tenantId, id);
  }
}
