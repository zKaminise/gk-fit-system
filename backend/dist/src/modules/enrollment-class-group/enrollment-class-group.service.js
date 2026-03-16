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
exports.EnrollmentClassGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EnrollmentClassGroupService = class EnrollmentClassGroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { id: dto.enrollmentId, tenantId },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('Matrícula não encontrada nesta academia');
        }
        if (enrollment.status !== 'active') {
            throw new common_1.BadRequestException('Matrícula não está ativa');
        }
        const classGroup = await this.prisma.classGroup.findFirst({
            where: { id: dto.classGroupId, tenantId },
        });
        if (!classGroup) {
            throw new common_1.BadRequestException('Turma não encontrada nesta academia');
        }
        if (!classGroup.isActive) {
            throw new common_1.BadRequestException('Turma não está ativa');
        }
        const existing = await this.prisma.enrollmentClassGroup.findUnique({
            where: {
                tenantId_enrollmentId_classGroupId: {
                    tenantId,
                    enrollmentId: dto.enrollmentId,
                    classGroupId: dto.classGroupId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Esta turma já está vinculada a esta matrícula');
        }
        return this.prisma.enrollmentClassGroup.create({
            data: {
                tenantId,
                enrollmentId: dto.enrollmentId,
                classGroupId: dto.classGroupId,
            },
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
                enrollment: {
                    select: {
                        id: true,
                        status: true,
                        student: {
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
        });
    }
    async findByEnrollment(tenantId, enrollmentId) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { id: enrollmentId, tenantId },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Matrícula não encontrada nesta academia');
        }
        return this.prisma.enrollmentClassGroup.findMany({
            where: { tenantId, enrollmentId },
            include: {
                classGroup: {
                    select: {
                        id: true,
                        name: true,
                        daysOfWeek: true,
                        startTime: true,
                        endTime: true,
                        location: true,
                        maxCapacity: true,
                        isActive: true,
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
        });
    }
    async findByClassGroup(tenantId, classGroupId) {
        const classGroup = await this.prisma.classGroup.findFirst({
            where: { id: classGroupId, tenantId },
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Turma não encontrada nesta academia');
        }
        return this.prisma.enrollmentClassGroup.findMany({
            where: { tenantId, classGroupId },
            include: {
                enrollment: {
                    include: {
                        student: {
                            include: {
                                person: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        cpf: true,
                                        phone: true,
                                        birthDate: true,
                                    },
                                },
                            },
                        },
                        plan: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
    }
    async remove(tenantId, id) {
        const link = await this.prisma.enrollmentClassGroup.findFirst({
            where: { id, tenantId },
        });
        if (!link) {
            throw new common_1.NotFoundException('Vínculo não encontrado');
        }
        await this.prisma.enrollmentClassGroup.delete({
            where: { id },
        });
        return { message: 'Turma desvinculada da matrícula com sucesso' };
    }
};
exports.EnrollmentClassGroupService = EnrollmentClassGroupService;
exports.EnrollmentClassGroupService = EnrollmentClassGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentClassGroupService);
//# sourceMappingURL=enrollment-class-group.service.js.map