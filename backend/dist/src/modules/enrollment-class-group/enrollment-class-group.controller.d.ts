import { EnrollmentClassGroupService } from './enrollment-class-group.service';
import { CreateEnrollmentClassGroupDto } from './dto/create-enrollment-class-group.dto';
export declare class EnrollmentClassGroupController {
    private readonly ecgService;
    constructor(ecgService: EnrollmentClassGroupService);
    create(tenantId: string, dto: CreateEnrollmentClassGroupDto): Promise<{
        classGroup: {
            id: string;
            name: string;
            modality: {
                id: string;
                name: string;
            };
            level: {
                id: string;
                name: string;
                color: string | null;
            } | null;
            daysOfWeek: string;
            startTime: string;
            endTime: string;
            location: string | null;
            teacher: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                } | null;
            } | null;
        };
        enrollment: {
            id: string;
            student: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                };
            };
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        enrollmentId: string;
        classGroupId: string;
    }>;
    findByEnrollment(tenantId: string, enrollmentId: string): Promise<({
        classGroup: {
            id: string;
            name: string;
            isActive: boolean;
            modality: {
                id: string;
                name: string;
            };
            level: {
                id: string;
                name: string;
                color: string | null;
            } | null;
            daysOfWeek: string;
            startTime: string;
            endTime: string;
            location: string | null;
            maxCapacity: number;
            teacher: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                } | null;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        enrollmentId: string;
        classGroupId: string;
    })[]>;
    findByClassGroup(tenantId: string, classGroupId: string): Promise<({
        enrollment: {
            student: {
                person: {
                    id: string;
                    phone: string | null;
                    fullName: string;
                    birthDate: Date | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        enrollmentId: string;
        classGroupId: string;
    })[]>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
