import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(tenantId: string, user: RequestUser, dto: CreatePaymentDto): Promise<{
        charge: {
            paidAmountCents: number;
            status: string;
            remainingCents: number;
            id: string;
            description: string | null;
            amountCents: number;
        };
        receivedByUser: {
            id: string;
            person: {
                fullName: string;
            } | null;
        };
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
    }>;
    findAll(tenantId: string, chargeId?: string, paymentMethod?: string, dateFrom?: string, dateTo?: string): Promise<({
        charge: {
            id: string;
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
            };
            status: string;
            description: string | null;
            amountCents: number;
            dueDate: Date;
            paidAmountCents: number;
        };
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
    })[]>;
    getSummary(tenantId: string, dateFrom?: string, dateTo?: string): Promise<{
        total: {
            count: number;
            totalCents: number;
        };
        byMethod: {
            method: string;
            count: number;
            totalCents: number;
        }[];
    }>;
    findById(tenantId: string, id: string): Promise<{
        charge: {
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
                };
            };
            payerPerson: {
                id: string;
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
        };
        receivedByUser: {
            id: string;
            email: string;
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
    }>;
}
