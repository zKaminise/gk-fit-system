import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateAttendanceDto) {
    // 1. Valida classGroup pertence ao tenant
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id: dto.classGroupId, tenantId },
    });
    if (!classGroup) {
      throw new BadRequestException('Turma não encontrada nesta academia');
    }

    // 2. Valida student pertence ao tenant
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new BadRequestException('Aluno não encontrado nesta academia');
    }

    // 3. Valida que o aluno está vinculado à turma via Enrollment → EnrollmentClassGroup
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
      throw new BadRequestException(
        'Aluno não está matriculado nesta turma. Verifique se existe uma matrícula ativa com vínculo a esta turma.',
      );
    }

    // 4. Verifica duplicidade (mesmo aluno + turma + data)
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
      throw new ConflictException(
        'Já existe registro de presença para este aluno nesta turma nesta data',
      );
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

  async createBatch(tenantId: string, userId: string, records: CreateAttendanceDto[]) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const dto of records) {
      try {
        const result = await this.create(tenantId, userId, dto);
        results.push(result);
      } catch (error) {
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

  async findAll(
    tenantId: string,
    filters?: {
      classGroupId?: string;
      studentId?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.classGroupId) where.classGroupId = filters.classGroupId;
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.status) where.status = filters.status;

    if (filters?.dateFrom || filters?.dateTo) {
      where.attendanceDate = {};
      if (filters.dateFrom) where.attendanceDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.attendanceDate.lte = new Date(filters.dateTo);
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

  async findById(tenantId: string, id: string) {
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
      throw new NotFoundException('Registro de presença não encontrado');
    }
    return attendance;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateAttendanceDto) {
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

  async getClassGroupAttendanceSheet(
    tenantId: string,
    classGroupId: string,
    date: string,
  ) {
    // Valida turma pertence ao tenant
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
      throw new NotFoundException('Turma não encontrada nesta academia');
    }

    // Busca todos os alunos vinculados à turma via matrícula ativa
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

    // Busca presenças já registradas nesta data
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

    // Monta mapa de presenças por studentId
    const attendanceMap = new Map(
      existingAttendances.map((a) => [a.studentId, a]),
    );

    // Monta lista combinada
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

    // Ordena por nome
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

  async getStudentAttendanceSummary(tenantId: string, studentId: string, classGroupId?: string) {
    // Valida student pertence ao tenant
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        person: { select: { id: true, fullName: true } },
      },
    });
    if (!student) {
      throw new NotFoundException('Aluno não encontrado nesta academia');
    }

    const where: any = { tenantId, studentId };
    if (classGroupId) where.classGroupId = classGroupId;

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
}
