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
exports.PlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PlanService = class PlanService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.plan.findUnique({
            where: {
                tenantId_name: { tenantId, name: dto.name },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Já existe um plano com este nome nesta academia');
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
    async findAll(tenantId, activeOnly) {
        const where = { tenantId };
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
    async findById(tenantId, id) {
        const plan = await this.prisma.plan.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { enrollments: true },
                },
            },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        return plan;
    }
    async update(tenantId, id, dto) {
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
                throw new common_1.ConflictException('Já existe outro plano com este nome nesta academia');
            }
        }
        return this.prisma.plan.update({
            where: { id },
            data: dto,
        });
    }
    async deactivate(tenantId, id) {
        await this.findById(tenantId, id);
        return this.prisma.plan.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, name: true, isActive: true },
        });
    }
};
exports.PlanService = PlanService;
exports.PlanService = PlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanService);
//# sourceMappingURL=plan.service.js.map