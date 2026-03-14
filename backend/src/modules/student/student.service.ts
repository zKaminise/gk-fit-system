import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStudentDto) {
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, tenantId },
    });

    if (!person) {
      throw new BadRequestException('Pessoa não encontrada nesta academia');
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
      throw new ConflictException(
        'Esta pessoa já está cadastrada como aluno nesta academia',
      );
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

  async findAll(tenantId: string, status?: string) {
    const where: Record<string, unknown> = { tenantId };

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

  async findById(tenantId: string, id: string) {
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
      throw new NotFoundException('Aluno não encontrado');
    }

    return student;
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
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

  async deactivate(tenantId: string, id: string) {
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
}