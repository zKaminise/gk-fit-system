import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
export declare class PersonService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreatePersonDto): Promise<{
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
    }>;
    findAll(tenantId: string, search?: string): Promise<({
        students: {
            id: string;
            registrationCode: string | null;
            status: string;
        }[];
        guardians: {
            id: string;
        }[];
    } & {
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
    })[]>;
    findById(tenantId: string, id: string): Promise<{
        users: {
            id: string;
            email: string;
            isActive: boolean;
            role: string;
        }[];
        students: {
            id: string;
            createdAt: Date;
            registrationCode: string | null;
            status: string;
        }[];
        guardians: {
            id: string;
        }[];
    } & {
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
    }>;
    update(tenantId: string, id: string, dto: UpdatePersonDto): Promise<{
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
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        isActive: boolean;
        fullName: string;
    }>;
}
