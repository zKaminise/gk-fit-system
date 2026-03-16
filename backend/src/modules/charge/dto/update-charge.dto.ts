import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateChargeDto {
  @IsUUID('4', { message: 'payerPersonId deve ser um UUID válido' })
  @IsOptional()
  payerPersonId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsInt({ message: 'Valor deve ser um inteiro (centavos)' })
  @Min(1)
  @IsOptional()
  amountCents?: number;

  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida' })
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'overdue', 'cancelled'], {
    message: 'Status permitido para edição manual: pending, overdue ou cancelled',
  })
  status?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Mês de referência deve ser no formato AAAA-MM',
  })
  referenceMonth?: string;
}
