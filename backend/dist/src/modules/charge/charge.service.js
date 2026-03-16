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
exports.ChargeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChargeService = class ChargeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { id: dto.enrollmentId, tenantId },
            include: {
                student: {
                    include: {
                        person: { select: { id: true, fullName: true } },
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('Matrícula não encontrada nesta academia');
        }
        if (enrollment.status === 'cancelled') {
            throw new common_1.BadRequestException('Não é possível gerar cobrança para matrícula cancelada');
        }
        if (dto.payerPersonId) {
            const payer = await this.prisma.person.findFirst({
                where: { id: dto.payerPersonId, tenantId },
            });
            if (!payer) {
                throw new common_1.BadRequestException('Pessoa pagadora não encontrada nesta academia');
            }
        }
        return this.prisma.charge.create({
            data: {
                tenantId,
                enrollmentId: dto.enrollmentId,
                payerPersonId: dto.payerPersonId || null,
                description: dto.description,
                amountCents: dto.amountCents,
                dueDate: new Date(dto.dueDate),
                referenceMonth: dto.referenceMonth,
            },
            include: {
                enrollment: {
                    select: {
                        id: true,
                        student: {
                            select: {
                                id: true,
                                person: {
                                    select: { id: true, fullName: true },
                                },
                            },
                        },
                        plan: {
                            select: { id: true, name: true },
                        },
                    },
                },
                payerPerson: {
                    select: { id: true, fullName: true, cpf: true, phone: true },
                },
            },
        });
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.enrollmentId)
            where.enrollmentId = filters.enrollmentId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.payerPersonId)
            where.payerPersonId = filters.payerPersonId;
        if (filters?.referenceMonth)
            where.referenceMonth = filters.referenceMonth;
        if (filters?.dueDateFrom || filters?.dueDateTo) {
            where.dueDate = {};
            if (filters.dueDateFrom)
                where.dueDate.gte = new Date(filters.dueDateFrom);
            if (filters.dueDateTo)
                where.dueDate.lte = new Date(filters.dueDateTo);
        }
        return this.prisma.charge.findMany({
            where,
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
            include: {
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
                        plan: {
                            select: { id: true, name: true },
                        },
                    },
                },
                payerPerson: {
                    select: { id: true, fullName: true, cpf: true, phone: true },
                },
                _count: {
                    select: { payments: true },
                },
            },
        });
    }
    async findById(tenantId, id) {
        const charge = await this.prisma.charge.findFirst({
            where: { id, tenantId },
            include: {
                enrollment: {
                    select: {
                        id: true,
                        status: true,
                        student: {
                            select: {
                                id: true,
                                person: true,
                            },
                        },
                        plan: true,
                    },
                },
                payerPerson: {
                    select: { id: true, fullName: true, cpf: true, phone: true, email: true },
                },
                payments: {
                    orderBy: { paymentDate: 'desc' },
                    include: {
                        receivedByUser: {
                            select: {
                                id: true,
                                person: {
                                    select: { fullName: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!charge) {
            throw new common_1.NotFoundException('Cobrança não encontrada');
        }
        return charge;
    }
    async update(tenantId, id, dto) {
        const charge = await this.findById(tenantId, id);
        if (charge.status === 'paid') {
            throw new common_1.BadRequestException('Não é possível editar uma cobrança já paga');
        }
        if (dto.amountCents && charge.paidAmountCents > 0) {
            if (dto.amountCents < charge.paidAmountCents) {
                throw new common_1.BadRequestException(`Novo valor (${dto.amountCents}) não pode ser menor que o valor já pago (${charge.paidAmountCents})`);
            }
        }
        if (dto.payerPersonId) {
            const payer = await this.prisma.person.findFirst({
                where: { id: dto.payerPersonId, tenantId },
            });
            if (!payer) {
                throw new common_1.BadRequestException('Pessoa pagadora não encontrada nesta academia');
            }
        }
        const data = { ...dto };
        if (dto.dueDate)
            data.dueDate = new Date(dto.dueDate);
        if (dto.payerPersonId === null)
            data.payerPersonId = null;
        if (dto.amountCents && charge.paidAmountCents > 0) {
            if (charge.paidAmountCents >= dto.amountCents) {
                data.status = 'paid';
            }
            else {
                data.status = 'partially_paid';
            }
        }
        return this.prisma.charge.update({
            where: { id },
            data,
            include: {
                enrollment: {
                    select: {
                        id: true,
                        student: {
                            select: {
                                id: true,
                                person: { select: { id: true, fullName: true } },
                            },
                        },
                    },
                },
                payerPerson: {
                    select: { id: true, fullName: true },
                },
            },
        });
    }
    async cancel(tenantId, id) {
        const charge = await this.findById(tenantId, id);
        if (charge.status === 'paid') {
            throw new common_1.BadRequestException('Não é possível cancelar uma cobrança já paga integralmente');
        }
        if (charge.status === 'cancelled') {
            throw new common_1.BadRequestException('Cobrança já está cancelada');
        }
        const warningMessage = charge.paidAmountCents > 0
            ? `Cobrança cancelada. Atenção: existem R$ ${(charge.paidAmountCents / 100).toFixed(2)} em pagamentos registrados.`
            : 'Cobrança cancelada com sucesso';
        await this.prisma.charge.update({
            where: { id },
            data: { status: 'cancelled' },
        });
        return {
            id: charge.id,
            status: 'cancelled',
            message: warningMessage,
        };
    }
    async getSummaryByTenant(tenantId) {
        const [pending, overdue, paid, cancelled] = await Promise.all([
            this.prisma.charge.aggregate({
                where: { tenantId, status: 'pending' },
                _sum: { amountCents: true },
                _count: true,
            }),
            this.prisma.charge.aggregate({
                where: { tenantId, status: 'overdue' },
                _sum: { amountCents: true },
                _count: true,
            }),
            this.prisma.charge.aggregate({
                where: { tenantId, status: 'paid' },
                _sum: { amountCents: true },
                _count: true,
            }),
            this.prisma.charge.aggregate({
                where: { tenantId, status: 'cancelled' },
                _sum: { amountCents: true },
                _count: true,
            }),
        ]);
        const partiallyPaid = await this.prisma.charge.aggregate({
            where: { tenantId, status: 'partially_paid' },
            _sum: { amountCents: true, paidAmountCents: true },
            _count: true,
        });
        return {
            pending: {
                count: pending._count,
                totalCents: pending._sum.amountCents || 0,
            },
            overdue: {
                count: overdue._count,
                totalCents: overdue._sum.amountCents || 0,
            },
            partiallyPaid: {
                count: partiallyPaid._count,
                totalCents: partiallyPaid._sum.amountCents || 0,
                paidCents: partiallyPaid._sum.paidAmountCents || 0,
            },
            paid: {
                count: paid._count,
                totalCents: paid._sum.amountCents || 0,
            },
            cancelled: {
                count: cancelled._count,
                totalCents: cancelled._sum.amountCents || 0,
            },
        };
    }
};
exports.ChargeService = ChargeService;
exports.ChargeService = ChargeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChargeService);
//# sourceMappingURL=charge.service.js.map