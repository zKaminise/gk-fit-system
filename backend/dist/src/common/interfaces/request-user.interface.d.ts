export interface RequestUser {
    userId: string;
    email: string;
    role: string;
    tenantId: string | null;
    personId: string | null;
}
