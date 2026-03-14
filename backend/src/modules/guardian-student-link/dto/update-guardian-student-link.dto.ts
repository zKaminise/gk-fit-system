import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateGuardianStudentLinkDto {
  @IsString()
  @IsOptional()
  @IsIn(['mother', 'father', 'grandparent', 'uncle_aunt', 'sibling', 'other'], {
    message: 'Parentesco deve ser: mother, father, grandparent, uncle_aunt, sibling ou other',
  })
  relationship?: string;

  @IsBoolean()
  @IsOptional()
  isFinancialResponsible?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimaryContact?: boolean;
}
