import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: {
        tenantId_name: { tenantId, name: dto.name },
      },
    });
    if (existing) {
      throw new ConflictException('Já existe um plano com este nome nesta academia');
    }

    return this.prisma.plan.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        priceCents: dto.priceCents,
        billingFrequency: dto.billingFrequency ?? 'monthly',
        durationMonths: dto.durationMonths,
        enrollmentFeeCents: dto.enrollmentFeeCents ?? 0,
        allowsPause: dto.allowsPause ?? false,
        maxPauseDays: dto.maxPauseDays,
      },
    });
  }

  async findAll(tenantId: string, activeOnly?: boolean) {
    const where: any = { tenantId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.plan.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }
    return plan;
  }

  async update(tenantId: string, id: string, dto: UpdatePlanDto) {
    await this.findById(tenantId, id);

    if (dto.name) {
      const existing = await this.prisma.plan.findFirst({
        where: {
          tenantId,
          name: dto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outro plano com este nome nesta academia');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
