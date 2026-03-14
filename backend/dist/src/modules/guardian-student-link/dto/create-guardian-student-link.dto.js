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
exports.CreateGuardianStudentLinkDto = void 0;
const class_validator_1 = require("class-validator");
class CreateGuardianStudentLinkDto {
    guardianId;
    studentId;
    relationshipType;
    isFinancialResponsible;
    isPrimaryContact;
}
exports.CreateGuardianStudentLinkDto = CreateGuardianStudentLinkDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'guardianId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'guardianId é obrigatório' }),
    __metadata("design:type", String)
], CreateGuardianStudentLinkDto.prototype, "guardianId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'studentId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'studentId é obrigatório' }),
    __metadata("design:type", String)
], CreateGuardianStudentLinkDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'relationshipType é obrigatório' }),
    (0, class_validator_1.IsIn)(['mother', 'father', 'grandparent', 'uncle_aunt', 'sibling', 'other'], {
        message: 'Parentesco deve ser: mother, father, grandparent, uncle_aunt, sibling ou other',
    }),
    __metadata("design:type", String)
], CreateGuardianStudentLinkDto.prototype, "relationshipType", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateGuardianStudentLinkDto.prototype, "isFinancialResponsible", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateGuardianStudentLinkDto.prototype, "isPrimaryContact", void 0);
//# sourceMappingURL=create-guardian-student-link.dto.js.map