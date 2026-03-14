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
exports.GuardianService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GuardianService = class GuardianService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const person = await this.prisma.person.findFirst({
            where: { id: dto.personId, tenantId },
        });
        if (!person) {
            throw new common_1.BadRequestException('Pessoa não encontrada nesta academia');
        }
        const existing = await this.prisma.guardian.findUnique({
            where: {
                tenantId_personId: {
                    tenantId,
                    personId: dto.personId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Esta pessoa já está cadastrada como responsável nesta academia');
        }
        return this.prisma.guardian.create({
            data: {
                tenantId,
                personId: dto.personId,
                isFinancialResponsible: dto.isFinancialResponsible ?? false,
                notes: dto.notes,
            },
            include: {
                person: {
                    select: {
                        id: true,
                        fullName: true,
                        cpf: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.guardian.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                person: {
                    select: {
                        id: true,
                        fullName: true,
                        cpf: true,
                        phone: true,
                        email: true,
                        photoUrl: true,
                    },
                },
                guardianStudentLinks: {
                    select: {
                        id: true,
                        relationshipType: true,
                        isFinancialResponsible: true,
                        student: {
                            select: {
                                id: true,
                                status: true,
                                person: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    async findById(tenantId, id) {
        const guardian = await this.prisma.guardian.findFirst({
            where: { id, tenantId },
            include: {
                person: true,
                guardianStudentLinks: {
                    include: {
                        student: {
                            include: {
                                person: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        cpf: true,
                                        birthDate: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!guardian) {
            throw new common_1.NotFoundException('Responsável não encontrado');
        }
        return guardian;
    }
    async update(tenantId, id, dto) {
        await this.findById(tenantId, id);
        return this.prisma.guardian.update({
            where: { id },
            data: dto,
            include: {
                person: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async deactivate(tenantId, id) {
        const guardian = await this.findById(tenantId, id);
        await this.prisma.person.update({
            where: { id: guardian.personId },
            data: { isActive: false },
        });
        return {
            id: guardian.id,
            message: 'Responsável desativado com sucesso',
        };
    }
};
exports.GuardianService = GuardianService;
exports.GuardianService = GuardianService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuardianService);
//# sourceMappingURL=guardian.service.js.map