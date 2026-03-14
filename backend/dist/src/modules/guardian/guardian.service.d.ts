import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
export declare class GuardianService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateGuardianDto): Promise<{
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
    }>;
    findAll(tenantId: string): Promise<({
        guardianStudentLinks: {
            id: string;
            student: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                };
                status: string;
            };
            isFinancialResponsible: boolean;
            relationshipType: string;
        }[];
        person: {
            id: string;
            email: string | null;
            phone: string | null;
            fullName: string;
            cpf: string | null;
            photoUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        personId: string;
        notes: string | null;
        isFinancialResponsible: boolean;
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        guardianStudentLinks: ({
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
        })[];
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
        notes: string | null;
        isFinancialResponsible: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateGuardianDto): Promise<{
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
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        message: string;
    }>;
}
