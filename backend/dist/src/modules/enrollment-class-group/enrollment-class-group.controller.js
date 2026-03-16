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
exports.EnrollmentClassGroupController = void 0;
const common_1 = require("@nestjs/common");
const enrollment_class_group_service_1 = require("./enrollment-class-group.service");
const create_enrollment_class_group_dto_1 = require("./dto/create-enrollment-class-group.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let EnrollmentClassGroupController = class EnrollmentClassGroupController {
    ecgService;
    constructor(ecgService) {
        this.ecgService = ecgService;
    }
    create(tenantId, dto) {
        return this.ecgService.create(tenantId, dto);
    }
    findByEnrollment(tenantId, enrollmentId) {
        return this.ecgService.findByEnrollment(tenantId, enrollmentId);
    }
    findByClassGroup(tenantId, classGroupId) {
        return this.ecgService.findByClassGroup(tenantId, classGroupId);
    }
    remove(tenantId, id) {
        return this.ecgService.remove(tenantId, id);
    }
};
exports.EnrollmentClassGroupController = EnrollmentClassGroupController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_enrollment_class_group_dto_1.CreateEnrollmentClassGroupDto]),
    __metadata("design:returntype", void 0)
], EnrollmentClassGroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('by-enrollment/:enrollmentId'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('enrollmentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EnrollmentClassGroupController.prototype, "findByEnrollment", null);
__decorate([
    (0, common_1.Get)('by-class-group/:classGroupId'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('classGroupId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EnrollmentClassGroupController.prototype, "findByClassGroup", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EnrollmentClassGroupController.prototype, "remove", null);
exports.EnrollmentClassGroupController = EnrollmentClassGroupController = __decorate([
    (0, common_1.Controller)('enrollment-class-groups'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TENANT_ADMIN, role_enum_1.Role.SECRETARY),
    __metadata("design:paramtypes", [enrollment_class_group_service_1.EnrollmentClassGroupService])
], EnrollmentClassGroupController);
//# sourceMappingURL=enrollment-class-group.controller.js.map