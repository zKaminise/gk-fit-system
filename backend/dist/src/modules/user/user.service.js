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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const hash_util_1 = require("../../common/utils/hash.util");
let UserService = class UserService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Já existe um usuário com este email');
        }
        const saltRounds = this.configService.get('BCRYPT_SALT_ROUNDS') || 12;
        const passwordHash = await (0, hash_util_1.hashPassword)(dto.password, saltRounds);
        return this.prisma.user.create({
            data: {
                tenantId,
                email: dto.email,
                passwordHash,
                role: dto.role,
                personId: dto.personId || null,
            },
            select: {
                id: true,
                email: true,
                role: true,
                tenantId: true,
                personId: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    async findAllByTenant(tenantId) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                person: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenantId },
            select: {
                id: true,
                email: true,
                role: true,
                tenantId: true,
                personId: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                person: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async update(tenantId, id, dto) {
        await this.findById(tenantId, id);
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                personId: true,
                updatedAt: true,
            },
        });
    }
    async deactivate(tenantId, id) {
        await this.findById(tenantId, id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: {
                id: true,
                email: true,
                isActive: true,
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UserService);
//# sourceMappingURL=user.service.js.map