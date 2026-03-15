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
exports.ClassGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClassGroupService = class ClassGroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const modality = await this.prisma.modality.findFirst({
            where: { id: dto.modalityId, tenantId },
        });
        if (!modality) {
            throw new common_1.BadRequestException('Modalidade não encontrada nesta academia');
        }
        if (dto.levelId) {
            const level = await this.prisma.level.findFirst({
                where: { id: dto.levelId, tenantId, modalityId: dto.modalityId },
            });
            if (!level) {
                throw new common_1.BadRequestException('Nível não encontrado nesta academia ou não pertence à modalidade selecionada');
            }
        }
        if (dto.teacherId) {
            const teacher = await this.prisma.user.findFirst({
                where: { id: dto.teacherId, tenantId, role: 'TEACHER', isActive: true },
            });
            if (!teacher) {
                throw new common_1.BadRequestException('Professor não encontrado, inativo, ou não pertence a esta academia');
            }
        }
        if (dto.startTime >= dto.endTime) {
            throw new common_1.BadRequestException('Horário de início deve ser anterior ao horário de término');
        }
        return this.prisma.classGroup.create({
            data: {
                tenantId,
                modalityId: dto.modalityId,
                levelId: dto.levelId || null,
                teacherId: dto.teacherId || null,
                name: dto.name,
                daysOfWeek: dto.daysOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
                location: dto.location,
                maxCapacity: dto.maxCapacity ?? 20,
            },
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
        });
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.modalityId)
            where.modalityId = filters.modalityId;
        if (filters?.levelId)
            where.levelId = filters.levelId;
        if (filters?.teacherId)
            where.teacherId = filters.teacherId;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        return this.prisma.classGroup.findMany({
            where,
            orderBy: [{ name: 'asc' }],
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
        });
    }
    async findById(tenantId, id) {
        const classGroup = await this.prisma.classGroup.findFirst({
            where: { id, tenantId },
            include: {
                modality: { select: { id: true, name: true } },
                level: { select: { id: true, name: true, color: true } },
                teacher: {
                    select: {
                        id: true,
                        email: true,
                        person: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
            },
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Turma não encontrada');
        }
        return classGroup;
    }
    async update(tenantId, id, dto) {
        const classGroup = await this.findById(tenantId, id);
        if (dto.levelId) {
            const level = await this.prisma.level.findFirst({
                where: { id: dto.levelId, tenantId, modalityId: classGroup.modalityId },
            });
            if (!level) {
                throw new common_1.BadRequestException('Nível não encontrado nesta academia ou não pertence à modalidade da turma');
            }
        }
        if (dto.teacherId) {
            const teacher = await this.prisma.user.findFirst({
                where: { id: dto.teacherId, tenantId, role: 'TEACHER', isActive: true },
            });
            if (!teacher) {
                throw new common_1.BadRequestException('Professor não encontrado, inativo, ou não pertence a esta academia');
            }
        }
        const startTime = dto.startTime || classGroup.startTime;
        const endTime = dto.endTime || classGroup.endTime;
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Horário de início deve ser anterior ao horário de término');
        }
        const data = { ...dto };
        if (dto.levelId === null) {
            data.levelId = null;
        }
        if (dto.teacherId === null) {
            data.teacherId = null;
        }
        return this.prisma.classGroup.update({
            where: { id },
            data,
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
        });
    }
    async deactivate(tenantId, id) {
        await this.findById(tenantId, id);
        return this.prisma.classGroup.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, name: true, isActive: true },
        });
    }
};
exports.ClassGroupService = ClassGroupService;
exports.ClassGroupService = ClassGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassGroupService);
//# sourceMappingURL=class-group.service.js.map