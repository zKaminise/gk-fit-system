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
exports.CreateChargeDto = void 0;
const class_validator_1 = require("class-validator");
class CreateChargeDto {
    enrollmentId;
    payerPersonId;
    description;
    amountCents;
    dueDate;
    referenceMonth;
}
exports.CreateChargeDto = CreateChargeDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'enrollmentId deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'enrollmentId é obrigatório' }),
    __metadata("design:type", String)
], CreateChargeDto.prototype, "enrollmentId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'payerPersonId deve ser um UUID válido' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateChargeDto.prototype, "payerPersonId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Descrição é obrigatória' }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateChargeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Valor deve ser um inteiro (centavos)' }),
    (0, class_validator_1.Min)(1, { message: 'Valor deve ser pelo menos 1 centavo' }),
    __metadata("design:type", Number)
], CreateChargeDto.prototype, "amountCents", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Data de vencimento deve ser uma data válida' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Data de vencimento é obrigatória' }),
    __metadata("design:type", String)
], CreateChargeDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'Mês de referência deve ser no formato AAAA-MM (ex: 2026-04)',
    }),
    __metadata("design:type", String)
], CreateChargeDto.prototype, "referenceMonth", void 0);
//# sourceMappingURL=create-charge.dto.js.map