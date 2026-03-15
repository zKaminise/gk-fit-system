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
exports.LevelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LevelService = class LevelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const modality = await this.prisma.modality.findFirst({
            where: { id: dto.modalityId, tenantId },
        });
        if (!modality) {
            throw new common_1.BadRequestException('Modalidade não encontrada nesta academia');
        }
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
            throw new common_1.ConflictException('Já existe um nível com este nome nesta modalidade');
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
    async findAll(tenantId, modalityId) {
        const where = { tenantId };
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
    async findById(tenantId, id) {
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
            throw new common_1.NotFoundException('Nível não encontrado');
        }
        return level;
    }
    async update(tenantId, id, dto) {
        const level = await this.findById(tenantId, id);
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
                throw new common_1.ConflictException('Já existe outro nível com este nome nesta modalidade');
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
    async remove(tenantId, id) {
        const level = await this.findById(tenantId, id);
        if (level._count.classGroups > 0) {
            throw new common_1.ConflictException(`Não é possível remover este nível pois existem ${level._count.classGroups} turma(s) vinculada(s)`);
        }
        await this.prisma.level.delete({ where: { id } });
        return { message: 'Nível removido com sucesso' };
    }
};
exports.LevelService = LevelService;
exports.LevelService = LevelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LevelService);
//# sourceMappingURL=level.service.js.map