import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    create(tenantId: string, dto: CreateEnrollmentDto): Promise<{
        student: {
            person: {
                id: string;
                fullName: string;
                cpf: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            personId: string;
            registrationCode: string | null;
            status: string;
            notes: string | null;
        };
        plan: {
            id: string;
            name: string;
            priceCents: number;
            billingFrequency: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        cancellationDate: Date | null;
        cancellationReason: string | null;
    }>;
    findAll(tenantId: string, studentId?: string, planId?: string, status?: string): Promise<({
        classGroups: ({
            classGroup: {
                id: string;
                name: string;
                modality: {
                    id: string;
                    name: string;
                };
                daysOfWeek: string;
                startTime: string;
                endTime: string;
                location: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            tenantId: string;
            enrollmentId: string;
            classGroupId: string;
        })[];
        student: {
            person: {
                id: string;
                phone: string | null;
                fullName: string;
                cpf: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            personId: string;
            registrationCode: string | null;
            status: string;
            notes: string | null;
        };
        plan: {
            id: string;
            name: string;
            priceCents: number;
            billingFrequency: string;
        };
        _count: {
            classGroups: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        cancellationDate: Date | null;
        cancellationReason: string | null;
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        classGroups: ({
            classGroup: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            tenantId: string;
            enrollmentId: string;
            classGroupId: string;
        })[];
        student: {
            person: {
                id: string;
                email: string | null;
                phone: string | null;
                addressStreet: string | null;
                addressNumber: string | null;
                addressComplement: string | null;
                addressNeighborhood: string | null;
                addressCity: string | null;
                addressState: string | null;
                addressZip: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                fullName: string;
                birthDate: Date | null;
                cpf: string | null;
                rg: string | null;
                gender: string | null;
                phoneSecondary: string | null;
                medicalNotes: string | null;
                photoUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            personId: string;
            registrationCode: string | null;
            status: string;
            notes: string | null;
        };
        plan: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        cancellationDate: Date | null;
        cancellationReason: string | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateEnrollmentDto): Promise<{
        student: {
            person: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            personId: string;
            registrationCode: string | null;
            status: string;
            notes: string | null;
        };
        plan: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        cancellationDate: Date | null;
        cancellationReason: string | null;
    }>;
}
