"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentService = class PaymentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, userId, dto) {
        const charge = await this.prisma.charge.findFirst({
            where: { id: dto.chargeId, tenantId },
        });
        if (!charge) {
            throw new common_1.BadRequestException('Cobrança não encontrada nesta academia');
        }
        if (charge.status === 'cancelled') {
            throw new common_1.BadRequestException('Não é possível registrar pagamento em cobrança cancelada');
        }
        if (charge.status === 'paid') {
            throw new common_1.BadRequestException('Esta cobrança já está totalmente paga');
        }
        const remainingCents = charge.amountCents - charge.paidAmountCents;
        if (dto.amountCents > remainingCents) {
            throw new common_1.BadRequestException(`Valor do pagamento (${dto.amountCents}) excede o saldo restante (${remainingCents} centavos). ` +
                `Valor total: ${charge.amountCents}, já pago: ${charge.paidAmountCents}`);
        }
        const newPaidAmount = charge.paidAmountCents + dto.amountCents;
        const newStatus = newPaidAmount >= charge.amountCents ? 'paid' : 'partially_paid';
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
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.chargeId)
            where.chargeId = filters.chargeId;
        if (filters?.paymentMethod)
            where.paymentMethod = filters.paymentMethod;
        if (filters?.dateFrom || filters?.dateTo) {
            where.paymentDate = {};
            if (filters.dateFrom)
                where.paymentDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.paymentDate.lte = new Date(filters.dateTo);
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
    async findById(tenantId, id) {
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
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        return payment;
    }
    async getSummaryByTenant(tenantId, filters) {
        const where = { tenantId };
        if (filters?.dateFrom || filters?.dateTo) {
            where.paymentDate = {};
            if (filters.dateFrom)
                where.paymentDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.paymentDate.lte = new Date(filters.dateTo);
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map