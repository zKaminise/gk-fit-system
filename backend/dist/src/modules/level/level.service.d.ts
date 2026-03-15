import { PrismaService } from '../../prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
export declare class LevelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateLevelDto): Promise<{
        modality: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        sortOrder: number;
        modalityId: string;
        color: string | null;
    }>;
    findAll(tenantId: string, modalityId?: string): Promise<({
        modality: {
            id: string;
            name: string;
        };
        _count: {
            classGroups: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        sortOrder: number;
        modalityId: string;
        color: string | null;
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        modality: {
            id: string;
            name: string;
        };
        _count: {
            classGroups: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        sortOrder: number;
        modalityId: string;
        color: string | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateLevelDto): Promise<{
        modality: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        sortOrder: number;
        modalityId: string;
        color: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
