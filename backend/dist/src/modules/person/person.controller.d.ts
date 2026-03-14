import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
export declare class PersonController {
    private readonly personService;
    constructor(personService: PersonService);
    create(tenantId: string, dto: CreatePersonDto): Promise<{
        id: string;
        fullName: string;
        birthDate: Date | null;
        cpf: string | null;
        rg: string | null;
        gender: string | null;
        email: string | null;
        phone: string | null;
        phoneSecondary: string | null;
        addressStreet: string | null;
        addressNumber: string | null;
        addressComplement: string | null;
        addressNeighborhood: string | null;
        addressCity: string | null;
        addressState: string | null;
        addressZip: string | null;
        medicalNotes: string | null;
        photoUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        fullName: string;
        birthDate: Date | null;
        cpf: string | null;
        rg: string | null;
        gender: string | null;
        email: string | null;
        phone: string | null;
        phoneSecondary: string | null;
        addressStreet: string | null;
        addressNumber: string | null;
        addressComplement: string | null;
        addressNeighborhood: string | null;
        addressCity: string | null;
        addressState: string | null;
        addressZip: string | null;
        medicalNotes: string | null;
        photoUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        fullName: string;
        birthDate: Date | null;
        cpf: string | null;
        rg: string | null;
        gender: string | null;
        email: string | null;
        phone: string | null;
        phoneSecondary: string | null;
        addressStreet: string | null;
        addressNumber: string | null;
        addressComplement: string | null;
        addressNeighborhood: string | null;
        addressCity: string | null;
        addressState: string | null;
        addressZip: string | null;
        medicalNotes: string | null;
        photoUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    update(tenantId: string, id: string, dto: UpdatePersonDto): Promise<{
        id: string;
        fullName: string;
        birthDate: Date | null;
        cpf: string | null;
        rg: string | null;
        gender: string | null;
        email: string | null;
        phone: string | null;
        phoneSecondary: string | null;
        addressStreet: string | null;
        addressNumber: string | null;
        addressComplement: string | null;
        addressNeighborhood: string | null;
        addressCity: string | null;
        addressState: string | null;
        addressZip: string | null;
        medicalNotes: string | null;
        photoUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    deactivate(tenantId: string, id: string): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
    }>;
}
