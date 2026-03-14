import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGuardianDto {
  @IsUUID('4', { message: 'personId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'personId é obrigatório' })
  personId: string;

  @IsBoolean()
  @IsOptional()
  isFinancialResponsible?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}