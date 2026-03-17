import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID('4', { message: 'classGroupId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'classGroupId é obrigatório' })
  classGroupId: string;

  @IsUUID('4', { message: 'studentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'studentId é obrigatório' })
  studentId: string;

  @IsDateString({}, { message: 'Data da presença deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data da presença é obrigatória' })
  attendanceDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsIn(['present', 'absent', 'justified_absence', 'makeup'], {
    message: 'Status deve ser: present, absent, justified_absence ou makeup',
  })
  status: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  notes?: string;
}
