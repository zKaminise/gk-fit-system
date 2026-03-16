import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateChargeDto {
  @IsUUID('4', { message: 'enrollmentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'enrollmentId é obrigatório' })
  enrollmentId: string;

  @IsUUID('4', { message: 'payerPersonId deve ser um UUID válido' })
  @IsOptional()
  payerPersonId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(255)
  description: string;

  @IsInt({ message: 'Valor deve ser um inteiro (centavos)' })
  @Min(1, { message: 'Valor deve ser pelo menos 1 centavo' })
  amountCents: number;

  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  dueDate: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Mês de referência deve ser no formato AAAA-MM (ex: 2026-04)',
  })
  referenceMonth?: string;
}
