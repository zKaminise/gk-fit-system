import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlanController {
    private readonly planService;
    constructor(planService: PlanService);
    create(tenantId: string, dto: CreatePlanDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        priceCents: number;
        billingFrequency: string;
        durationMonths: number | null;
        enrollmentFeeCents: number;
        allowsPause: boolean;
        maxPauseDays: number | null;
    }>;
    findAll(tenantId: string, activeOnly?: string): Promise<({
        _count: {
            enrollments: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        priceCents: number;
        billingFrequency: string;
        durationMonths: number | null;
        enrollmentFeeCents: number;
        allowsPause: boolean;
        maxPauseDays: number | null;
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        _count: {
            enrollments: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        priceCents: number;
        billingFrequency: string;
        durationMonths: number | null;
        enrollmentFeeCents: number;
        allowsPause: boolean;
        maxPauseDays: number | null;
    }>;
    update(tenantId: string, id: string, dto: UpdatePlanDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        priceCents: number;
        billingFrequency: string;
        durationMonths: number | null;
        enrollmentFeeCents: number;
        allowsPause: boolean;
        maxPauseDays: number | null;
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
    }>;
}
