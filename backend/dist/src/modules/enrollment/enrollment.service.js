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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EnrollmentService = class EnrollmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const student = await this.prisma.student.findFirst({
            where: { id: dto.studentId, tenantId },
        });
        if (!student) {
            throw new common_1.BadRequestException('Aluno não encontrado nesta academia');
        }
        if (student.status !== 'active') {
            throw new common_1.BadRequestException('Aluno não está ativo');
        }
        const plan = await this.prisma.plan.findFirst({
            where: { id: dto.planId, tenantId },
        });
        if (!plan) {
            throw new common_1.BadRequestException('Plano não encontrado nesta academia');
        }
        if (!plan.isActive) {
            throw new common_1.BadRequestException('Plano não está ativo');
        }
        let endDate = null;
        if (dto.endDate) {
            endDate = new Date(dto.endDate);
        }
        else if (plan.durationMonths) {
            const start = new Date(dto.startDate);
            endDate = new Date(start);
            endDate.setMonth(endDate.getMonth() + plan.durationMonths);
        }
        return this.prisma.enrollment.create({
            data: {
                tenantId,
                studentId: dto.studentId,
                planId: dto.planId,
                startDate: new Date(dto.startDate),
                endDate,
                notes: dto.notes,
            },
            include: {
                student: {
                    include: {
                        person: {
                            select: { id: true, fullName: true, cpf: true },
                        },
                    },
                },
                plan: {
                    select: {
                        id: true,
                        name: true,
                        priceCents: true,
                        billingFrequency: true,
                    },
                },
            },
        });
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.studentId)
            where.studentId = filters.studentId;
        if (filters?.planId)
            where.planId = filters.planId;
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.enrollment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                student: {
                    include: {
                        person: {
                            select: { id: true, fullName: true, cpf: true, phone: true },
                        },
                    },
                },
                plan: {
                    select: {
                        id: true,
                        name: true,
                        priceCents: true,
                        billingFrequency: true,
                    },
                },
                classGroups: {
                    include: {
                        classGroup: {
                            select: {
                                id: true,
                                name: true,
                                daysOfWeek: true,
                                startTime: true,
                                endTime: true,
                                location: true,
                                modality: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
                _count: {
                    select: { classGroups: true },
                },
            },
        });
    }
    async findById(tenantId, id) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { id, tenantId },
            include: {
                student: {
                    include: {
                        person: true,
                    },
                },
                plan: true,
                classGroups: {
                    include: {
                        classGroup: {
                            include: {
                                modality: { select: { id: true, name: true } },
                                level: { select: { id: true, name: true, color: true } },
                                teacher: {
                                    select: {
                                        id: true,
                                        person: {
                                            select: { id: true, fullName: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Matrícula não encontrada');
        }
        return enrollment;
    }
    async update(tenantId, id, dto) {
        const enrollment = await this.findById(tenantId, id);
        if (dto.status === 'cancelled' && !dto.cancellationDate && !enrollment.cancellationDate) {
            dto.cancellationDate = new Date().toISOString().split('T')[0];
        }
        const data = { ...dto };
        if (dto.endDate)
            data.endDate = new Date(dto.endDate);
        if (dto.cancellationDate)
            data.cancellationDate = new Date(dto.cancellationDate);
        return this.prisma.enrollment.update({
            where: { id },
            data,
            include: {
                student: {
                    include: {
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
                plan: {
                    select: { id: true, name: true },
                },
            },
        });
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map