import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome do plano é obrigatório' })
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Preço deve ser um inteiro (centavos)' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  priceCents: number;

  @IsString()
  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'semiannual', 'annual'], {
    message: 'Frequência deve ser: monthly, quarterly, semiannual ou annual',
  })
  billingFrequency?: string;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  durationMonths?: number;

  @IsInt({ message: 'Taxa de matrícula deve ser um inteiro (centavos)' })
  @Min(0)
  @IsOptional()
  enrollmentFeeCents?: number;

  @IsBoolean()
  @IsOptional()
  allowsPause?: boolean;

  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  maxPauseDays?: number;
}
