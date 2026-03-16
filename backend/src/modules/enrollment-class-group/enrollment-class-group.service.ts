import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentClassGroupDto } from './dto/create-enrollment-class-group.dto';

@Injectable()
export class EnrollmentClassGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEnrollmentClassGroupDto) {
    // Valida enrollment pertence ao tenant
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: dto.enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new BadRequestException('Matrícula não encontrada nesta academia');
    }
    if (enrollment.status !== 'active') {
      throw new BadRequestException('Matrícula não está ativa');
    }

    // Valida classGroup pertence ao tenant
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id: dto.classGroupId, tenantId },
    });
    if (!classGroup) {
      throw new BadRequestException('Turma não encontrada nesta academia');
    }
    if (!classGroup.isActive) {
      throw new BadRequestException('Turma não está ativa');
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
      throw new ConflictException('Esta turma já está vinculada a esta matrícula');
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

  async findByEnrollment(tenantId: string, enrollmentId: string) {
    // Valida enrollment pertence ao tenant
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada nesta academia');
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

  async findByClassGroup(tenantId: string, classGroupId: string) {
    // Valida classGroup pertence ao tenant
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id: classGroupId, tenantId },
    });
    if (!classGroup) {
      throw new NotFoundException('Turma não encontrada nesta academia');
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

  async remove(tenantId: string, id: string) {
    const link = await this.prisma.enrollmentClassGroup.findFirst({
      where: { id, tenantId },
    });
    if (!link) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    await this.prisma.enrollmentClassGroup.delete({
      where: { id },
    });

    return { message: 'Turma desvinculada da matrícula com sucesso' };
  }
}
