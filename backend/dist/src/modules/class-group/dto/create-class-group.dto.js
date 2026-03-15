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
exports.CreateClassGroupDto = void 0;
const class_validator_1 = require("class-validator");
class CreateClassGroupDto {
    modalityId;
    levelId;
    teacherId;
    name;
    daysOfWeek;
    startTime;
    endTime;
    location;
    maxCapacity;
}
exports.CreateClassGroupDto = CreateClassGroupDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'modalityId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'modalityId é obrigatório' }),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "modalityId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'levelId deve ser um UUID válido' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "levelId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'teacherId deve ser um UUID válido' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome da turma é obrigatório' }),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Dias da semana são obrigatórios' }),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^(mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*$/, {
        message: 'Dias devem ser: mon,tue,wed,thu,fri,sat,sun separados por vírgula',
    }),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "daysOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Horário de início é obrigatório' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'Horário de início deve ser no formato HH:mm (ex: 08:00, 14:30)',
    }),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Horário de término é obrigatório' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'Horário de término deve ser no formato HH:mm (ex: 09:00, 15:30)',
    }),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'Capacidade mínima é 1' }),
    (0, class_validator_1.Max)(200, { message: 'Capacidade máxima é 200' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateClassGroupDto.prototype, "maxCapacity", void 0);
//# sourceMappingURL=create-class-group.dto.js.map