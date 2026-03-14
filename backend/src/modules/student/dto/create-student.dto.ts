import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsUUID('4', { message: 'personId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'personId é obrigatório' })
  personId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'registrationCode deve ter no máximo 50 caracteres' })
  registrationCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'status deve ter no máximo 20 caracteres' })
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}