import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';

@Injectable()
export class GuardianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateGuardianDto) {
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, tenantId },
    });

    if (!person) {
      throw new BadRequestException('Pessoa não encontrada nesta academia');
    }

    const existing = await this.prisma.guardian.findUnique({
      where: {
        tenantId_personId: {
          tenantId,
          personId: dto.personId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Esta pessoa já está cadastrada como responsável nesta academia',
      );
    }

    return this.prisma.guardian.create({
      data: {
        tenantId,
        personId: dto.personId,
        isFinancialResponsible: dto.isFinancialResponsible ?? false,
        notes: dto.notes,
      },
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
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.guardian.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
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
            student: {
              select: {
                id: true,
                status: true,
                person: {
                  select: {
                    id: true,
                    fullName: true,
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
    const guardian = await this.prisma.guardian.findFirst({
      where: { id, tenantId },
      include: {
        person: true,
        guardianStudentLinks: {
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
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException('Responsável não encontrado');
    }

    return guardian;
  }

  async update(tenantId: string, id: string, dto: UpdateGuardianDto) {
    await this.findById(tenantId, id);

    return this.prisma.guardian.update({
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
    const guardian = await this.findById(tenantId, id);

    await this.prisma.person.update({
      where: { id: guardian.personId },
      data: { isActive: false },
    });

    return {
      id: guardian.id,
      message: 'Responsável desativado com sucesso',
    };
  }
}