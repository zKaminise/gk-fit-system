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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StudentService = class StudentService {
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
        const existing = await this.prisma.student.findUnique({
            where: {
                tenantId_personId: {
                    tenantId,
                    personId: dto.personId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Esta pessoa já está cadastrada como aluno nesta academia');
        }
        return this.prisma.student.create({
            data: {
                tenantId,
                personId: dto.personId,
                registrationCode: dto.registrationCode,
                status: dto.status ?? 'active',
                notes: dto.notes,
            },
            include: {
                person: {
                    select: {
                        id: true,
                        fullName: true,
                        cpf: true,
                        birthDate: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(tenantId, status) {
        const where = { tenantId };
        if (status) {
            where.status = status;
        }
        return this.prisma.student.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                person: {
                    select: {
                        id: true,
                        fullName: true,
                        cpf: true,
                        birthDate: true,
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
                        guardian: {
                            select: {
                                id: true,
                                person: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        phone: true,
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
        const student = await this.prisma.student.findFirst({
            where: { id, tenantId },
            include: {
                person: true,
                guardianStudentLinks: {
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
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Aluno não encontrado');
        }
        return student;
    }
    async update(tenantId, id, dto) {
        await this.findById(tenantId, id);
        return this.prisma.student.update({
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
        await this.findById(tenantId, id);
        return this.prisma.student.update({
            where: { id },
            data: { status: 'inactive' },
            select: {
                id: true,
                status: true,
                person: {
                    select: { fullName: true },
                },
            },
        });
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.js.map