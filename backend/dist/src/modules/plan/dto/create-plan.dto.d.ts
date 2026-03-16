export declare class CreatePlanDto {
    name: string;
    description?: string;
    priceCents: number;
    billingFrequency?: string;
    durationMonths?: number;
    enrollmentFeeCents?: number;
    allowsPause?: boolean;
    maxPauseDays?: number;
}
