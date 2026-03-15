import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
export declare class ClassGroupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateClassGroupDto): Promise<{
        modality: {
            id: string;
            name: string;
        };
        level: {
            id: string;
            name: string;
            color: string | null;
        } | null;
        teacher: {
            id: string;
            person: {
                id: string;
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        modalityId: string;
        levelId: string | null;
        teacherId: string | null;
        daysOfWeek: string;
        startTime: string;
        endTime: string;
        location: string | null;
        maxCapacity: number;
    }>;
    findAll(tenantId: string, filters?: {
        modalityId?: string;
        levelId?: string;
        teacherId?: string;
        isActive?: boolean;
    }): Promise<({
        modality: {
            id: string;
            name: string;
        };
        level: {
            id: string;
            name: string;
            color: string | null;
        } | null;
        teacher: {
            id: string;
            person: {
                id: string;
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        modalityId: string;
        levelId: string | null;
        teacherId: string | null;
        daysOfWeek: string;
        startTime: string;
        endTime: string;
        location: string | null;
        maxCapacity: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        modality: {
            id: string;
            name: string;
        };
        level: {
            id: string;
            name: string;
            color: string | null;
        } | null;
        teacher: {
            id: string;
            email: string;
            person: {
                id: string;
                phone: string | null;
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        modalityId: string;
        levelId: string | null;
        teacherId: string | null;
        daysOfWeek: string;
        startTime: string;
        endTime: string;
        location: string | null;
        maxCapacity: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateClassGroupDto): Promise<{
        modality: {
            id: string;
            name: string;
        };
        level: {
            id: string;
            name: string;
            color: string | null;
        } | null;
        teacher: {
            id: string;
            person: {
                id: string;
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        modalityId: string;
        levelId: string | null;
        teacherId: string | null;
        daysOfWeek: string;
        startTime: string;
        endTime: string;
        location: string | null;
        maxCapacity: number;
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
    }>;
}
