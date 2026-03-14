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
exports.PersonService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PersonService = class PersonService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        if (dto.cpf) {
            const existing = await this.prisma.person.findFirst({
                where: { tenantId, cpf: dto.cpf },
            });
            if (existing) {
                throw new common_1.ConflictException('Já existe uma pessoa com este CPF nesta academia');
            }
        }
        return this.prisma.person.create({
            data: {
                tenantId,
                ...dto,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            },
        });
    }
    async findAll(tenantId, search) {
        const where = { tenantId };
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { cpf: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.person.findMany({
            where,
            orderBy: { fullName: 'asc' },
            include: {
                students: {
                    select: { id: true, status: true, registrationCode: true },
                },
                guardians: {
                    select: { id: true },
                },
            },
        });
    }
    async findById(tenantId, id) {
        const person = await this.prisma.person.findFirst({
            where: { id, tenantId },
            include: {
                students: {
                    select: {
                        id: true,
                        status: true,
                        registrationCode: true,
                        createdAt: true,
                    },
                },
                guardians: {
                    select: { id: true },
                },
                users: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!person) {
            throw new common_1.NotFoundException('Pessoa não encontrada');
        }
        return person;
    }
    async update(tenantId, id, dto) {
        await this.findById(tenantId, id);
        if (dto.cpf) {
            const existing = await this.prisma.person.findFirst({
                where: {
                    tenantId,
                    cpf: dto.cpf,
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Já existe outra pessoa com este CPF nesta academia');
            }
        }
        return this.prisma.person.update({
            where: { id },
            data: {
                ...dto,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            },
        });
    }
    async deactivate(tenantId, id) {
        await this.findById(tenantId, id);
        return this.prisma.person.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, fullName: true, isActive: true },
        });
    }
};
exports.PersonService = PersonService;
exports.PersonService = PersonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonService);
//# sourceMappingURL=person.service.js.map