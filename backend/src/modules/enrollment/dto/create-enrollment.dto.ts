import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID('4', { message: 'studentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'studentId é obrigatório' })
  studentId: string;

  @IsUUID('4', { message: 'planId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'planId é obrigatório' })
  planId: string;

  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  startDate: string;

  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
