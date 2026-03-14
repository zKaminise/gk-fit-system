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
exports.GuardianStudentLinkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GuardianStudentLinkService = class GuardianStudentLinkService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const guardian = await this.prisma.guardian.findFirst({
            where: { id: dto.guardianId, tenantId },
        });
        if (!guardian) {
            throw new common_1.BadRequestException('Responsável não encontrado nesta academia');
        }
        const student = await this.prisma.student.findFirst({
            where: { id: dto.studentId, tenantId },
        });
        if (!student) {
            throw new common_1.BadRequestException('Aluno não encontrado nesta academia');
        }
        const existing = await this.prisma.guardianStudentLink.findUnique({
            where: {
                tenantId_guardianId_studentId: {
                    tenantId,
                    guardianId: dto.guardianId,
                    studentId: dto.studentId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Este vínculo entre responsável e aluno já existe');
        }
        return this.prisma.guardianStudentLink.create({
            data: {
                tenantId,
                guardianId: dto.guardianId,
                studentId: dto.studentId,
                relationshipType: dto.relationshipType,
                isFinancialResponsible: dto.isFinancialResponsible ?? false,
                isPrimaryContact: dto.isPrimaryContact ?? false,
            },
            include: {
                guardian: {
                    include: {
                        person: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
                student: {
                    include: {
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
            },
        });
    }
    async findByStudent(tenantId, studentId) {
        const student = await this.prisma.student.findFirst({
            where: { id: studentId, tenantId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Aluno não encontrado nesta academia');
        }
        return this.prisma.guardianStudentLink.findMany({
            where: { tenantId, studentId },
            include: {
                guardian: {
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
                },
            },
        });
    }
    async findByGuardian(tenantId, guardianId) {
        const guardian = await this.prisma.guardian.findFirst({
            where: { id: guardianId, tenantId },
        });
        if (!guardian) {
            throw new common_1.NotFoundException('Responsável não encontrado nesta academia');
        }
        return this.prisma.guardianStudentLink.findMany({
            where: { tenantId, guardianId },
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
        });
    }
    async findById(tenantId, id) {
        const link = await this.prisma.guardianStudentLink.findFirst({
            where: { id, tenantId },
            include: {
                guardian: {
                    include: {
                        person: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
                student: {
                    include: {
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Vínculo não encontrado');
        }
        return link;
    }
    async update(tenantId, id, dto) {
        await this.findById(tenantId, id);
        return this.prisma.guardianStudentLink.update({
            where: { id },
            data: dto,
            include: {
                guardian: {
                    include: {
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
                student: {
                    include: {
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
            },
        });
    }
    async remove(tenantId, id) {
        await this.findById(tenantId, id);
        await this.prisma.guardianStudentLink.delete({
            where: { id },
        });
        return { message: 'Vínculo removido com sucesso' };
    }
};
exports.GuardianStudentLinkService = GuardianStudentLinkService;
exports.GuardianStudentLinkService = GuardianStudentLinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuardianStudentLinkService);
//# sourceMappingURL=guardian-student-link.service.js.map