import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGuardianStudentLinkDto {
  @IsUUID('4', { message: 'guardianId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'guardianId é obrigatório' })
  guardianId: string;

  @IsUUID('4', { message: 'studentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'studentId é obrigatório' })
  studentId: string;

  @IsString()
  @IsNotEmpty({ message: 'relationshipType é obrigatório' })
  @IsIn(['mother', 'father', 'grandparent', 'uncle_aunt', 'sibling', 'other'], {
    message:
      'Parentesco deve ser: mother, father, grandparent, uncle_aunt, sibling ou other',
  })
  relationshipType: string;

  @IsBoolean()
  @IsOptional()
  isFinancialResponsible?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimaryContact?: boolean;
}