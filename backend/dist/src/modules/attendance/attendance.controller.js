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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const create_attendance_dto_1 = require("./dto/create-attendance.dto");
const update_attendance_dto_1 = require("./dto/update-attendance.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    create(tenantId, user, dto) {
        return this.attendanceService.create(tenantId, user.userId, dto);
    }
    createBatch(tenantId, user, records) {
        return this.attendanceService.createBatch(tenantId, user.userId, records);
    }
    findAll(tenantId, classGroupId, studentId, status, dateFrom, dateTo) {
        return this.attendanceService.findAll(tenantId, {
            classGroupId,
            studentId,
            status,
            dateFrom,
            dateTo,
        });
    }
    getAttendanceSheet(tenantId, classGroupId, date) {
        return this.attendanceService.getClassGroupAttendanceSheet(tenantId, classGroupId, date);
    }
    getStudentSummary(tenantId, studentId, classGroupId) {
        return this.attendanceService.getStudentAttendanceSummary(tenantId, studentId, classGroupId);
    }
    findById(tenantId, id) {
        return this.attendanceService.findById(tenantId, id);
    }
    update(tenantId, user, id, dto) {
        return this.attendanceService.update(tenantId, id, user.userId, dto);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_attendance_dto_1.CreateAttendanceDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('batch'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createBatch", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('classGroupId')),
    __param(2, (0, common_1.Query)('studentId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('dateFrom')),
    __param(5, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('sheet/:classGroupId/:date'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('classGroupId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getAttendanceSheet", null);
__decorate([
    (0, common_1.Get)('summary/student/:studentId'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('classGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getStudentSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, update_attendance_dto_1.UpdateAttendanceDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "update", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendances'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.TENANT_ADMIN, role_enum_1.Role.SECRETARY, role_enum_1.Role.TEACHER),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map