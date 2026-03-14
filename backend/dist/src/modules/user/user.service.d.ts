import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    create(tenantId: string, dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string | null;
        personId: string | null;
        role: string;
    }>;
    findAllByTenant(tenantId: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        person: {
            id: string;
            phone: string | null;
            fullName: string;
        } | null;
        role: string;
        lastLoginAt: Date | null;
    }[]>;
    findById(tenantId: string, id: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string | null;
        person: {
            id: string;
            email: string | null;
            phone: string | null;
            fullName: string;
        } | null;
        personId: string | null;
        role: string;
        lastLoginAt: Date | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        updatedAt: Date;
        personId: string | null;
        role: string;
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
    }>;
}
