"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardianController = void 0;
const common_1 = require("@nestjs/common");
const guardian_service_1 = require("./guardian.service");
const create_guardian_dto_1 = require("./dto/create-guardian.dto");
const update_guardian_dto_1 = require("./dto/update-guardian.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let GuardianController = class GuardianController {
    guardianService;
    constructor(guardianService) {
        this.guardianService = guardianService;
    }
    create(tenantId, dto) {
        return this.guardianService.create(tenantId, dto);
    }
    findAll(tenantId) {
        return this.guardianService.findAll(tenantId);
    }
    findById(tenantId, id) {
        return this.guardianService.findById(tenantId, id);
    }
    update(tenantId, id, dto) {
        return this.guardianService.update(tenantId, id, dto);
    }
    deactivate(tenantId, id) {
        return this.guardianService.deactivate(tenantId, id);
    }
};
exports.GuardianController = GuardianController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_guardian_dto_1.CreateGuardianDto]),
    __metadata("design:returntype", void 0)
], GuardianController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GuardianController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuardianController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_guardian_dto_1.UpdateGuardianDto]),
    __metadata("design:returntype", void 0)
], GuardianController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuardianController.prototype, "deactivate", null);
exports.GuardianController = GuardianController = __decorate([
    (0, common_1.Controller)('guardians'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TENANT_ADMIN, role_enum_1.Role.SECRETARY, role_enum_1.Role.FINANCIAL),
    __metadata("design:paramtypes", [guardian_service_1.GuardianService])
], GuardianController);
//# sourceMappingURL=guardian.controller.js.map