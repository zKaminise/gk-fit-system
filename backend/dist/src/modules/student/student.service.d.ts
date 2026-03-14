import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateStudentDto): Promise<{
        person: {
            id: string;
            email: string | null;
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
    }>;
    findAll(tenantId: string, status?: string): Promise<({
        guardianStudentLinks: {
            id: string;
            guardian: {
                id: string;
                person: {
                    id: string;
                    phone: string | null;
                    fullName: string;
                };
            };
            isFinancialResponsible: boolean;
            relationshipType: string;
        }[];
        person: {
            id: string;
            email: string | null;
            phone: string | null;
            fullName: string;
            birthDate: Date | null;
            cpf: string | null;
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
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        guardianStudentLinks: ({
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
        registrationCode: string | null;
        status: string;
        notes: string | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateStudentDto): Promise<{
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
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        person: {
            fullName: string;
        };
        status: string;
    }>;
}
