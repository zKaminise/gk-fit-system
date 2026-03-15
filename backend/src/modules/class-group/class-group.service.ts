import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';

@Injectable()
export class ClassGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateClassGroupDto) {
    // Valida modalidade pertence ao tenant
    const modality = await this.prisma.modality.findFirst({
      where: { id: dto.modalityId, tenantId },
    });
    if (!modality) {
      throw new BadRequestException('Modalidade não encontrada nesta academia');
    }

    // Valida nível pertence ao tenant e à modalidade (se fornecido)
    if (dto.levelId) {
      const level = await this.prisma.level.findFirst({
        where: { id: dto.levelId, tenantId, modalityId: dto.modalityId },
      });
      if (!level) {
        throw new BadRequestException(
          'Nível não encontrado nesta academia ou não pertence à modalidade selecionada',
        );
      }
    }

    // Valida professor pertence ao tenant (se fornecido)
    if (dto.teacherId) {
      const teacher = await this.prisma.user.findFirst({
        where: { id: dto.teacherId, tenantId, role: 'TEACHER', isActive: true },
      });
      if (!teacher) {
        throw new BadRequestException(
          'Professor não encontrado, inativo, ou não pertence a esta academia',
        );
      }
    }

    // Valida que horário de início é antes do término
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Horário de início deve ser anterior ao horário de término');
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

  async findAll(
    tenantId: string,
    filters?: {
      modalityId?: string;
      levelId?: string;
      teacherId?: string;
      isActive?: boolean;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.modalityId) where.modalityId = filters.modalityId;
    if (filters?.levelId) where.levelId = filters.levelId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

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

  async findById(tenantId: string, id: string) {
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
      throw new NotFoundException('Turma não encontrada');
    }
    return classGroup;
  }

  async update(tenantId: string, id: string, dto: UpdateClassGroupDto) {
    const classGroup = await this.findById(tenantId, id);

    // Valida nível se fornecido (e não null)
    if (dto.levelId) {
      const level = await this.prisma.level.findFirst({
        where: { id: dto.levelId, tenantId, modalityId: classGroup.modalityId },
      });
      if (!level) {
        throw new BadRequestException(
          'Nível não encontrado nesta academia ou não pertence à modalidade da turma',
        );
      }
    }

    // Valida professor se fornecido (e não null)
    if (dto.teacherId) {
      const teacher = await this.prisma.user.findFirst({
        where: { id: dto.teacherId, tenantId, role: 'TEACHER', isActive: true },
      });
      if (!teacher) {
        throw new BadRequestException(
          'Professor não encontrado, inativo, ou não pertence a esta academia',
        );
      }
    }

    // Valida horários se ambos fornecidos
    const startTime = dto.startTime || classGroup.startTime;
    const endTime = dto.endTime || classGroup.endTime;
    if (startTime >= endTime) {
      throw new BadRequestException('Horário de início deve ser anterior ao horário de término');
    }

    // Monta o data object, tratando null explícito para levelId e teacherId
    const data: any = { ...dto };

    // Se levelId é explicitamente null, desvincula o nível
    if (dto.levelId === null) {
      data.levelId = null;
    }
    // Se teacherId é explicitamente null, desvincula o professor
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

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.classGroup.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
