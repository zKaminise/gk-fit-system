import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';

@Injectable()
export class ModalityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateModalityDto) {
    const existing = await this.prisma.modality.findUnique({
      where: {
        tenantId_name: { tenantId, name: dto.name },
      },
    });
    if (existing) {
      throw new ConflictException('Já existe uma modalidade com este nome nesta academia');
    }

    return this.prisma.modality.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAll(tenantId: string, activeOnly?: boolean) {
    const where: any = { tenantId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.modality.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            levels: true,
            classGroups: true,
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const modality = await this.prisma.modality.findFirst({
      where: { id, tenantId },
      include: {
        levels: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            classGroups: true,
          },
        },
      },
    });
    if (!modality) {
      throw new NotFoundException('Modalidade não encontrada');
    }
    return modality;
  }

  async update(tenantId: string, id: string, dto: UpdateModalityDto) {
    await this.findById(tenantId, id);

    // Se o nome mudou, verifica duplicidade
    if (dto.name) {
      const existing = await this.prisma.modality.findFirst({
        where: {
          tenantId,
          name: dto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outra modalidade com este nome nesta academia');
      }
    }

    return this.prisma.modality.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.modality.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
