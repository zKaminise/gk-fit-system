import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLevelDto) {
    // Verifica se a modalidade existe e pertence ao tenant
    const modality = await this.prisma.modality.findFirst({
      where: { id: dto.modalityId, tenantId },
    });
    if (!modality) {
      throw new BadRequestException('Modalidade não encontrada nesta academia');
    }

    // Verifica duplicidade de nome dentro da mesma modalidade e tenant
    const existing = await this.prisma.level.findUnique({
      where: {
        tenantId_modalityId_name: {
          tenantId,
          modalityId: dto.modalityId,
          name: dto.name,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Já existe um nível com este nome nesta modalidade');
    }

    return this.prisma.level.create({
      data: {
        tenantId,
        modalityId: dto.modalityId,
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
        color: dto.color,
      },
      include: {
        modality: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(tenantId: string, modalityId?: string) {
    const where: any = { tenantId };
    if (modalityId) {
      where.modalityId = modalityId;
    }

    return this.prisma.level.findMany({
      where,
      orderBy: [{ modality: { name: 'asc' } }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        modality: {
          select: { id: true, name: true },
        },
        _count: {
          select: { classGroups: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const level = await this.prisma.level.findFirst({
      where: { id, tenantId },
      include: {
        modality: {
          select: { id: true, name: true },
        },
        _count: {
          select: { classGroups: true },
        },
      },
    });
    if (!level) {
      throw new NotFoundException('Nível não encontrado');
    }
    return level;
  }

  async update(tenantId: string, id: string, dto: UpdateLevelDto) {
    const level = await this.findById(tenantId, id);

    // Se o nome mudou, verifica duplicidade na mesma modalidade
    if (dto.name && dto.name !== level.name) {
      const existing = await this.prisma.level.findFirst({
        where: {
          tenantId,
          modalityId: level.modalityId,
          name: dto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outro nível com este nome nesta modalidade');
      }
    }

    return this.prisma.level.update({
      where: { id },
      data: dto,
      include: {
        modality: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const level = await this.findById(tenantId, id);

    // Verifica se há turmas vinculadas a este nível
    if (level._count.classGroups > 0) {
      throw new ConflictException(
        `Não é possível remover este nível pois existem ${level._count.classGroups} turma(s) vinculada(s)`,
      );
    }

    await this.prisma.level.delete({ where: { id } });
    return { message: 'Nível removido com sucesso' };
  }
}
