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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAttendanceDto = void 0;
const class_validator_1 = require("class-validator");
class CreateAttendanceDto {
    classGroupId;
    studentId;
    attendanceDate;
    status;
    notes;
}
exports.CreateAttendanceDto = CreateAttendanceDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'classGroupId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'classGroupId é obrigatório' }),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "classGroupId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'studentId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'studentId é obrigatório' }),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Data da presença deve ser uma data válida' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Data da presença é obrigatória' }),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "attendanceDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Status é obrigatório' }),
    (0, class_validator_1.IsIn)(['present', 'absent', 'justified_absence', 'makeup'], {
        message: 'Status deve ser: present, absent, justified_absence ou makeup',
    }),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "notes", void 0);
//# sourceMappingURL=create-attendance.dto.js.map