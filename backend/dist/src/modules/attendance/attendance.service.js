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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, userId, dto) {
        const classGroup = await this.prisma.classGroup.findFirst({
            where: { id: dto.classGroupId, tenantId },
        });
        if (!classGroup) {
            throw new common_1.BadRequestException('Turma não encontrada nesta academia');
        }
        const student = await this.prisma.student.findFirst({
            where: { id: dto.studentId, tenantId },
        });
        if (!student) {
            throw new common_1.BadRequestException('Aluno não encontrado nesta academia');
        }
        const enrollmentLink = await this.prisma.enrollmentClassGroup.findFirst({
            where: {
                tenantId,
                classGroupId: dto.classGroupId,
                enrollment: {
                    studentId: dto.studentId,
                    status: 'active',
                },
            },
        });
        if (!enrollmentLink) {
            throw new common_1.BadRequestException('Aluno não está matriculado nesta turma. Verifique se existe uma matrícula ativa com vínculo a esta turma.');
        }
        const existing = await this.prisma.attendance.findUnique({
            where: {
                tenantId_classGroupId_studentId_attendanceDate: {
                    tenantId,
                    classGroupId: dto.classGroupId,
                    studentId: dto.studentId,
                    attendanceDate: new Date(dto.attendanceDate),
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Já existe registro de presença para este aluno nesta turma nesta data');
        }
        return this.prisma.attendance.create({
            data: {
                tenantId,
                classGroupId: dto.classGroupId,
                studentId: dto.studentId,
                attendanceDate: new Date(dto.attendanceDate),
                status: dto.status,
                recordedByUserId: userId,
                notes: dto.notes,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
                classGroup: {
                    select: {
                        id: true,
                        name: true,
                        modality: { select: { id: true, name: true } },
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        person: {
                            select: { fullName: true },
                        },
                    },
                },
            },
        });
    }
    async createBatch(tenantId, userId, records) {
        const results = [];
        const errors = [];
        for (const dto of records) {
            try {
                const result = await this.create(tenantId, userId, dto);
                results.push(result);
            }
            catch (error) {
                errors.push({
                    studentId: dto.studentId,
                    classGroupId: dto.classGroupId,
                    attendanceDate: dto.attendanceDate,
                    error: error.message,
                });
            }
        }
        return {
            created: results.length,
            failed: errors.length,
            results,
            errors,
        };
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.classGroupId)
            where.classGroupId = filters.classGroupId;
        if (filters?.studentId)
            where.studentId = filters.studentId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.dateFrom || filters?.dateTo) {
            where.attendanceDate = {};
            if (filters.dateFrom)
                where.attendanceDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.attendanceDate.lte = new Date(filters.dateTo);
        }
        return this.prisma.attendance.findMany({
            where,
            orderBy: [{ attendanceDate: 'desc' }, { createdAt: 'desc' }],
            include: {
                student: {
                    select: {
                        id: true,
                        person: {
                            select: { id: true, fullName: true, photoUrl: true },
                        },
                    },
                },
                classGroup: {
                    select: {
                        id: true,
                        name: true,
                        modality: { select: { id: true, name: true } },
                        level: { select: { id: true, name: true, color: true } },
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        person: {
                            select: { fullName: true },
                        },
                    },
                },
            },
        });
    }
    async findById(tenantId, id) {
        const attendance = await this.prisma.attendance.findFirst({
            where: { id, tenantId },
            include: {
                student: {
                    select: {
                        id: true,
                        status: true,
                        person: {
                            select: {
                                id: true,
                                fullName: true,
                                cpf: true,
                                birthDate: true,
                                phone: true,
                                photoUrl: true,
                            },
                        },
                    },
                },
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
                                person: { select: { fullName: true } },
                            },
                        },
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        email: true,
                        person: {
                            select: { fullName: true },
                        },
                    },
                },
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Registro de presença não encontrado');
        }
        return attendance;
    }
    async update(tenantId, id, userId, dto) {
        await this.findById(tenantId, id);
        return this.prisma.attendance.update({
            where: { id },
            data: {
                ...dto,
                recordedByUserId: userId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        person: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
                classGroup: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        person: {
                            select: { fullName: true },
                        },
                    },
                },
            },
        });
    }
    async getClassGroupAttendanceSheet(tenantId, classGroupId, date) {
        const classGroup = await this.prisma.classGroup.findFirst({
            where: { id: classGroupId, tenantId },
            include: {
                modality: { select: { id: true, name: true } },
                level: { select: { id: true, name: true, color: true } },
                teacher: {
                    select: {
                        id: true,
                        person: { select: { fullName: true } },
                    },
                },
            },
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Turma não encontrada nesta academia');
        }
        const enrolledStudents = await this.prisma.enrollmentClassGroup.findMany({
            where: {
                tenantId,
                classGroupId,
                enrollment: {
                    status: 'active',
                },
            },
            include: {
                enrollment: {
                    select: {
                        id: true,
                        student: {
                            select: {
                                id: true,
                                status: true,
                                person: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        birthDate: true,
                                        photoUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const existingAttendances = await this.prisma.attendance.findMany({
            where: {
                tenantId,
                classGroupId,
                attendanceDate: new Date(date),
            },
            select: {
                id: true,
                studentId: true,
                status: true,
                notes: true,
                recordedBy: {
                    select: {
                        id: true,
                        person: { select: { fullName: true } },
                    },
                },
            },
        });
        const attendanceMap = new Map(existingAttendances.map((a) => [a.studentId, a]));
        const students = enrolledStudents.map((ecg) => {
            const student = ecg.enrollment.student;
            const attendance = attendanceMap.get(student.id);
            return {
                studentId: student.id,
                studentStatus: student.status,
                person: student.person,
                attendanceId: attendance?.id || null,
                attendanceStatus: attendance?.status || null,
                attendanceNotes: attendance?.notes || null,
                recordedBy: attendance?.recordedBy || null,
            };
        });
        students.sort((a, b) => a.person.fullName.localeCompare(b.person.fullName));
        return {
            classGroup: {
                id: classGroup.id,
                name: classGroup.name,
                modality: classGroup.modality,
                level: classGroup.level,
                teacher: classGroup.teacher,
            },
            date,
            totalStudents: students.length,
            recorded: existingAttendances.length,
            pending: students.length - existingAttendances.length,
            students,
        };
    }
    async getStudentAttendanceSummary(tenantId, studentId, classGroupId) {
        const student = await this.prisma.student.findFirst({
            where: { id: studentId, tenantId },
            include: {
                person: { select: { id: true, fullName: true } },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Aluno não encontrado nesta academia');
        }
        const where = { tenantId, studentId };
        if (classGroupId)
            where.classGroupId = classGroupId;
        const [present, absent, justifiedAbsence, makeup, total] = await Promise.all([
            this.prisma.attendance.count({ where: { ...where, status: 'present' } }),
            this.prisma.attendance.count({ where: { ...where, status: 'absent' } }),
            this.prisma.attendance.count({ where: { ...where, status: 'justified_absence' } }),
            this.prisma.attendance.count({ where: { ...where, status: 'makeup' } }),
            this.prisma.attendance.count({ where }),
        ]);
        const attendanceRate = total > 0 ? ((present + makeup) / total) * 100 : 0;
        return {
            student: {
                id: student.id,
                fullName: student.person.fullName,
            },
            classGroupId: classGroupId || 'all',
            summary: {
                total,
                present,
                absent,
                justifiedAbsence,
                makeup,
                attendanceRate: Math.round(attendanceRate * 100) / 100,
            },
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map