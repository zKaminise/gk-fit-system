import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuardianStudentLinkDto } from './dto/create-guardian-student-link.dto';
import { UpdateGuardianStudentLinkDto } from './dto/update-guardian-student-link.dto';

@Injectable()
export class GuardianStudentLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateGuardianStudentLinkDto) {
    const guardian = await this.prisma.guardian.findFirst({
      where: { id: dto.guardianId, tenantId },
    });

    if (!guardian) {
      throw new BadRequestException('Responsável não encontrado nesta academia');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new BadRequestException('Aluno não encontrado nesta academia');
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
      throw new ConflictException(
        'Este vínculo entre responsável e aluno já existe',
      );
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

  async findByStudent(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado nesta academia');
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

  async findByGuardian(tenantId: string, guardianId: string) {
    const guardian = await this.prisma.guardian.findFirst({
      where: { id: guardianId, tenantId },
    });

    if (!guardian) {
      throw new NotFoundException('Responsável não encontrado nesta academia');
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

  async findById(tenantId: string, id: string) {
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
      throw new NotFoundException('Vínculo não encontrado');
    }

    return link;
  }

  async update(tenantId: string, id: string, dto: UpdateGuardianStudentLinkDto) {
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

  async remove(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    await this.prisma.guardianStudentLink.delete({
      where: { id },
    });

    return { message: 'Vínculo removido com sucesso' };
  }
}