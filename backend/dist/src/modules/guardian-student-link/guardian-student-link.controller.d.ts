import { GuardianStudentLinkService } from './guardian-student-link.service';
import { CreateGuardianStudentLinkDto } from './dto/create-guardian-student-link.dto';
import { UpdateGuardianStudentLinkDto } from './dto/update-guardian-student-link.dto';
export declare class GuardianStudentLinkController {
    private readonly linkService;
    constructor(linkService: GuardianStudentLinkService);
    create(tenantId: string, dto: CreateGuardianStudentLinkDto): Promise<{
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
        guardian: {
            person: {
                id: string;
                phone: string | null;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            personId: string;
            notes: string | null;
            isFinancialResponsible: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isFinancialResponsible: boolean;
        guardianId: string;
        studentId: string;
        relationshipType: string;
        isPrimaryContact: boolean;
    }>;
    findByStudent(tenantId: string, studentId: string): Promise<({
        guardian: {
            person: {
                id: string;
                email: string | null;
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
            notes: string | null;
            isFinancialResponsible: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isFinancialResponsible: boolean;
        guardianId: string;
        studentId: string;
        relationshipType: string;
        isPrimaryContact: boolean;
    })[]>;
    findByGuardian(tenantId: string, guardianId: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isFinancialResponsible: boolean;
        guardianId: string;
        studentId: string;
        relationshipType: string;
        isPrimaryContact: boolean;
    })[]>;
    findById(tenantId: string, id: string): Promise<{
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
        guardian: {
            person: {
                id: string;
                phone: string | null;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            personId: string;
            notes: string | null;
            isFinancialResponsible: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isFinancialResponsible: boolean;
        guardianId: string;
        studentId: string;
        relationshipType: string;
        isPrimaryContact: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateGuardianStudentLinkDto): Promise<{
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
        guardian: {
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
            notes: string | null;
            isFinancialResponsible: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isFinancialResponsible: boolean;
        guardianId: string;
        studentId: string;
        relationshipType: string;
        isPrimaryContact: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
