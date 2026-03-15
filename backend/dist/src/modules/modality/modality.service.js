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
exports.ModalityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ModalityService = class ModalityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.modality.findUnique({
            where: {
                tenantId_name: { tenantId, name: dto.name },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Já existe uma modalidade com este nome nesta academia');
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
    async findAll(tenantId, activeOnly) {
        const where = { tenantId };
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
    async findById(tenantId, id) {
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
            throw new common_1.NotFoundException('Modalidade não encontrada');
        }
        return modality;
    }
    async update(tenantId, id, dto) {
        await this.findById(tenantId, id);
        if (dto.name) {
            const existing = await this.prisma.modality.findFirst({
                where: {
                    tenantId,
                    name: dto.name,
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Já existe outra modalidade com este nome nesta academia');
            }
        }
        return this.prisma.modality.update({
            where: { id },
            data: dto,
        });
    }
    async deactivate(tenantId, id) {
        await this.findById(tenantId, id);
        return this.prisma.modality.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, name: true, isActive: true },
        });
    }
};
exports.ModalityService = ModalityService;
exports.ModalityService = ModalityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModalityService);
//# sourceMappingURL=modality.service.js.map