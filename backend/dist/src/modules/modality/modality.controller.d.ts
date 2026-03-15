import { ModalityService } from './modality.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
export declare class ModalityController {
    private readonly modalityService;
    constructor(modalityService: ModalityService);
    create(tenantId: string, dto: CreateModalityDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        sortOrder: number;
    }>;
    findAll(tenantId: string, activeOnly?: string): Promise<({
        _count: {
            levels: number;
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
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        levels: {
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
        }[];
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
    }>;
    update(tenantId: string, id: string, dto: UpdateModalityDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        sortOrder: number;
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
    }>;
}
