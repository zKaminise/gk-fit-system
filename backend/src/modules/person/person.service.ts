import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePersonDto) {
    if (dto.cpf) {
      const existing = await this.prisma.person.findFirst({
        where: { tenantId, cpf: dto.cpf },
      });

      if (existing) {
        throw new ConflictException(
          'Já existe uma pessoa com este CPF nesta academia',
        );
      }
    }

    return this.prisma.person.create({
      data: {
        tenantId,
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async findAll(tenantId: string, search?: string) {
    const where: Record<string, unknown> = { tenantId };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.person.findMany({
      where,
      orderBy: { fullName: 'asc' },
      include: {
        students: {
          select: { id: true, status: true, registrationCode: true },
        },
        guardians: {
          select: { id: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const person = await this.prisma.person.findFirst({
      where: { id, tenantId },
      include: {
        students: {
          select: {
            id: true,
            status: true,
            registrationCode: true,
            createdAt: true,
          },
        },
        guardians: {
          select: { id: true },
        },
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    return person;
  }

  async update(tenantId: string, id: string, dto: UpdatePersonDto) {
    await this.findById(tenantId, id);

    if (dto.cpf) {
      const existing = await this.prisma.person.findFirst({
        where: {
          tenantId,
          cpf: dto.cpf,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Já existe outra pessoa com este CPF nesta academia',
        );
      }
    }

    return this.prisma.person.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    return this.prisma.person.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, fullName: true, isActive: true },
    });
  }
}