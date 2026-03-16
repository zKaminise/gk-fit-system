import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEnrollmentDto) {
    // Valida student pertence ao tenant
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new BadRequestException('Aluno não encontrado nesta academia');
    }
    if (student.status !== 'active') {
      throw new BadRequestException('Aluno não está ativo');
    }

    // Valida plan pertence ao tenant
    const plan = await this.prisma.plan.findFirst({
      where: { id: dto.planId, tenantId },
    });
    if (!plan) {
      throw new BadRequestException('Plano não encontrado nesta academia');
    }
    if (!plan.isActive) {
      throw new BadRequestException('Plano não está ativo');
    }

    // Calcula endDate a partir da duração do plano se não informado
    let endDate: Date | null = null;
    if (dto.endDate) {
      endDate = new Date(dto.endDate);
    } else if (plan.durationMonths) {
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

  async findAll(
    tenantId: string,
    filters?: {
      studentId?: string;
      planId?: string;
      status?: string;
    },
  ) {
    const where: any = { tenantId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.planId) where.planId = filters.planId;
    if (filters?.status) where.status = filters.status;

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

  async findById(tenantId: string, id: string) {
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
      throw new NotFoundException('Matrícula não encontrada');
    }
    return enrollment;
  }

  async update(tenantId: string, id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.findById(tenantId, id);

    // Se cancelando, exige data de cancelamento
    if (dto.status === 'cancelled' && !dto.cancellationDate && !enrollment.cancellationDate) {
      dto.cancellationDate = new Date().toISOString().split('T')[0];
    }

    const data: any = { ...dto };
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.cancellationDate) data.cancellationDate = new Date(dto.cancellationDate);

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
}
