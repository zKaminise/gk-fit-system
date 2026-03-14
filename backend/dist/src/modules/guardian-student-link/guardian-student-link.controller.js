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
exports.GuardianStudentLinkController = void 0;
const common_1 = require("@nestjs/common");
const guardian_student_link_service_1 = require("./guardian-student-link.service");
const create_guardian_student_link_dto_1 = require("./dto/create-guardian-student-link.dto");
const update_guardian_student_link_dto_1 = require("./dto/update-guardian-student-link.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let GuardianStudentLinkController = class GuardianStudentLinkController {
    linkService;
    constructor(linkService) {
        this.linkService = linkService;
    }
    create(tenantId, dto) {
        return this.linkService.create(tenantId, dto);
    }
    findByStudent(tenantId, studentId) {
        return this.linkService.findByStudent(tenantId, studentId);
    }
    findByGuardian(tenantId, guardianId) {
        return this.linkService.findByGuardian(tenantId, guardianId);
    }
    findById(tenantId, id) {
        return this.linkService.findById(tenantId, id);
    }
    update(tenantId, id, dto) {
        return this.linkService.update(tenantId, id, dto);
    }
    remove(tenantId, id) {
        return this.linkService.remove(tenantId, id);
    }
};
exports.GuardianStudentLinkController = GuardianStudentLinkController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_guardian_student_link_dto_1.CreateGuardianStudentLinkDto]),
    __metadata("design:returntype", void 0)
], GuardianStudentLinkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('by-student/:studentId'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuardianStudentLinkController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('by-guardian/:guardianId'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('guardianId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuardianStudentLinkController.prototype, "findByGuardian", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuardianStudentLinkController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_guardian_student_link_dto_1.UpdateGuardianStudentLinkDto]),
    __metadata("design:returntype", void 0)
], GuardianStudentLinkController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuardianStudentLinkController.prototype, "remove", null);
exports.GuardianStudentLinkController = GuardianStudentLinkController = __decorate([
    (0, common_1.Controller)('guardian-student-links'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TENANT_ADMIN, role_enum_1.Role.SECRETARY, role_enum_1.Role.FINANCIAL),
    __metadata("design:paramtypes", [guardian_student_link_service_1.GuardianStudentLinkService])
], GuardianStudentLinkController);
//# sourceMappingURL=guardian-student-link.controller.js.map