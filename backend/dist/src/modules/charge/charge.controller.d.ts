import { ChargeService } from './charge.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
export declare class ChargeController {
    private readonly chargeService;
    constructor(chargeService: ChargeService);
    create(tenantId: string, dto: CreateChargeDto): Promise<{
        enrollment: {
            id: string;
            student: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                };
            };
            plan: {
                id: string;
                name: string;
            };
        };
        payerPerson: {
            id: string;
            phone: string | null;
            fullName: string;
            cpf: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        description: string | null;
        enrollmentId: string;
        payerPersonId: string | null;
        amountCents: number;
        dueDate: Date;
        referenceMonth: string | null;
        paidAmountCents: number;
    }>;
    findAll(tenantId: string, enrollmentId?: string, status?: string, payerPersonId?: string, dueDateFrom?: string, dueDateTo?: string, referenceMonth?: string): Promise<({
        enrollment: {
            id: string;
            student: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                    cpf: string | null;
                };
            };
            plan: {
                id: string;
                name: string;
            };
        };
        _count: {
            payments: number;
        };
        payerPerson: {
            id: string;
            phone: string | null;
            fullName: string;
            cpf: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        description: string | null;
        enrollmentId: string;
        payerPersonId: string | null;
        amountCents: number;
        dueDate: Date;
        referenceMonth: string | null;
        paidAmountCents: number;
    })[]>;
    getSummary(tenantId: string): Promise<{
        pending: {
            count: number;
            totalCents: number;
        };
        overdue: {
            count: number;
            totalCents: number;
        };
        partiallyPaid: {
            count: number;
            totalCents: number;
            paidCents: number;
        };
        paid: {
            count: number;
            totalCents: number;
        };
        cancelled: {
            count: number;
            totalCents: number;
        };
    }>;
    findById(tenantId: string, id: string): Promise<{
        payments: ({
            receivedByUser: {
                id: string;
                person: {
                    fullName: string;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            amountCents: number;
            paymentDate: Date;
            chargeId: string;
            receivedByUserId: string;
            paymentMethod: string;
        })[];
        enrollment: {
            id: string;
            student: {
                id: string;
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
            status: string;
        };
        payerPerson: {
            id: string;
            email: string | null;
            phone: string | null;
            fullName: string;
            cpf: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        description: string | null;
        enrollmentId: string;
        payerPersonId: string | null;
        amountCents: number;
        dueDate: Date;
        referenceMonth: string | null;
        paidAmountCents: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateChargeDto): Promise<{
        enrollment: {
            id: string;
            student: {
                id: string;
                person: {
                    id: string;
                    fullName: string;
                };
            };
        };
        payerPerson: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        description: string | null;
        enrollmentId: string;
        payerPersonId: string | null;
        amountCents: number;
        dueDate: Date;
        referenceMonth: string | null;
        paidAmountCents: number;
    }>;
    cancel(tenantId: string, id: string): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
}
