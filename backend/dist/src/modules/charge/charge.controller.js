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
exports.ChargeController = void 0;
const common_1 = require("@nestjs/common");
const charge_service_1 = require("./charge.service");
const create_charge_dto_1 = require("./dto/create-charge.dto");
const update_charge_dto_1 = require("./dto/update-charge.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let ChargeController = class ChargeController {
    chargeService;
    constructor(chargeService) {
        this.chargeService = chargeService;
    }
    create(tenantId, dto) {
        return this.chargeService.create(tenantId, dto);
    }
    findAll(tenantId, enrollmentId, status, payerPersonId, dueDateFrom, dueDateTo, referenceMonth) {
        return this.chargeService.findAll(tenantId, {
            enrollmentId,
            status,
            payerPersonId,
            dueDateFrom,
            dueDateTo,
            referenceMonth,
        });
    }
    getSummary(tenantId) {
        return this.chargeService.getSummaryByTenant(tenantId);
    }
    findById(tenantId, id) {
        return this.chargeService.findById(tenantId, id);
    }
    update(tenantId, id, dto) {
        return this.chargeService.update(tenantId, id, dto);
    }
    cancel(tenantId, id) {
        return this.chargeService.cancel(tenantId, id);
    }
};
exports.ChargeController = ChargeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_charge_dto_1.CreateChargeDto]),
    __metadata("design:returntype", void 0)
], ChargeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('enrollmentId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('payerPersonId')),
    __param(4, (0, common_1.Query)('dueDateFrom')),
    __param(5, (0, common_1.Query)('dueDateTo')),
    __param(6, (0, common_1.Query)('referenceMonth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChargeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChargeController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChargeController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_charge_dto_1.UpdateChargeDto]),
    __metadata("design:returntype", void 0)
], ChargeController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChargeController.prototype, "cancel", null);
exports.ChargeController = ChargeController = __decorate([
    (0, common_1.Controller)('charges'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TENANT_ADMIN, role_enum_1.Role.SECRETARY, role_enum_1.Role.FINANCIAL),
    __metadata("design:paramtypes", [charge_service_1.ChargeService])
], ChargeController);
//# sourceMappingURL=charge.controller.js.map