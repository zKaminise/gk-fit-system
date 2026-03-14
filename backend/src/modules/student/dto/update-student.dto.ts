import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended', 'transferred'], {
    message: 'Status deve ser: active, inactive, suspended ou transferred',
  })
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
