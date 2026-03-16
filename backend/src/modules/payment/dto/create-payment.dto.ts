import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'chargeId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'chargeId é obrigatório' })
  chargeId: string;

  @IsInt({ message: 'Valor deve ser um inteiro (centavos)' })
  @Min(1, { message: 'Valor do pagamento deve ser pelo menos 1 centavo' })
  amountCents: number;

  @IsDateString({}, { message: 'Data do pagamento deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data do pagamento é obrigatória' })
  paymentDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Método de pagamento é obrigatório' })
  @IsIn(['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'], {
    message: 'Método deve ser: pix, cash, credit_card, debit_card, bank_transfer ou other',
  })
  paymentMethod: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
