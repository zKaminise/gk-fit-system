import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreatePaymentDto) {
    // Valida charge pertence ao tenant
    const charge = await this.prisma.charge.findFirst({
      where: { id: dto.chargeId, tenantId },
    });
    if (!charge) {
      throw new BadRequestException('Cobrança não encontrada nesta academia');
    }

    // Rejeita pagamento em cobrança cancelada
    if (charge.status === 'cancelled') {
      throw new BadRequestException('Não é possível registrar pagamento em cobrança cancelada');
    }

    // Rejeita pagamento em cobrança já paga
    if (charge.status === 'paid') {
      throw new BadRequestException('Esta cobrança já está totalmente paga');
    }

    // Calcula saldo restante
    const remainingCents = charge.amountCents - charge.paidAmountCents;

    // Rejeita pagamento que excede o saldo
    if (dto.amountCents > remainingCents) {
      throw new BadRequestException(
        `Valor do pagamento (${dto.amountCents}) excede o saldo restante (${remainingCents} centavos). ` +
        `Valor total: ${charge.amountCents}, já pago: ${charge.paidAmountCents}`,
      );
    }

    // Calcula novos totais
    const newPaidAmount = charge.paidAmountCents + dto.amountCents;
    const newStatus = newPaidAmount >= charge.amountCents ? 'paid' : 'partially_paid';

    // Cria payment e atualiza charge em transação
    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          tenantId,
          chargeId: dto.chargeId,
          amountCents: dto.amountCents,
          paymentDate: new Date(dto.paymentDate),
          paymentMethod: dto.paymentMethod,
          receivedByUserId: userId,
          notes: dto.notes,
        },
        include: {
          charge: {
            select: {
              id: true,
              description: true,
              amountCents: true,
              paidAmountCents: true,
              status: true,
            },
          },
          receivedByUser: {
            select: {
              id: true,
              person: {
                select: { fullName: true },
              },
            },
          },
        },
      }),
      this.prisma.charge.update({
        where: { id: dto.chargeId },
        data: {
          paidAmountCents: newPaidAmount,
          status: newStatus,
        },
      }),
    ]);

    // Retorna payment com dados atualizados da charge
    return {
      ...payment,
      charge: {
        ...payment.charge,
        paidAmountCents: newPaidAmount,
        status: newStatus,
        remainingCents: charge.amountCents - newPaidAmount,
      },
    };
  }

  async findAll(
    tenantId: string,
    filters?: {
      chargeId?: string;
      paymentMethod?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.chargeId) where.chargeId = filters.chargeId;
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;

    if (filters?.dateFrom || filters?.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) where.paymentDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.paymentDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        charge: {
          select: {
            id: true,
            description: true,
            amountCents: true,
            paidAmountCents: true,
            status: true,
            dueDate: true,
            enrollment: {
              select: {
                id: true,
                student: {
                  select: {
                    id: true,
                    person: {
                      select: { id: true, fullName: true, cpf: true },
                    },
                  },
                },
              },
            },
          },
        },
        receivedByUser: {
          select: {
            id: true,
            person: {
              select: { fullName: true },
            },
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        charge: {
          include: {
            enrollment: {
              select: {
                id: true,
                student: {
                  select: {
                    id: true,
                    person: true,
                  },
                },
                plan: {
                  select: { id: true, name: true },
                },
              },
            },
            payerPerson: {
              select: { id: true, fullName: true, cpf: true },
            },
          },
        },
        receivedByUser: {
          select: {
            id: true,
            email: true,
            person: {
              select: { fullName: true },
            },
          },
        },
      },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async getSummaryByTenant(tenantId: string, filters?: { dateFrom?: string; dateTo?: string }) {
    const where: any = { tenantId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) where.paymentDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.paymentDate.lte = new Date(filters.dateTo);
    }

    const byMethod = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: { amountCents: true },
      _count: true,
    });

    const total = await this.prisma.payment.aggregate({
      where,
      _sum: { amountCents: true },
      _count: true,
    });

    return {
      total: {
        count: total._count,
        totalCents: total._sum.amountCents || 0,
      },
      byMethod: byMethod.map((m) => ({
        method: m.paymentMethod,
        count: m._count,
        totalCents: m._sum.amountCents || 0,
      })),
    };
  }
}
