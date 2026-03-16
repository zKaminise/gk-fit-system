import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'suspended', 'cancelled', 'completed'], {
    message: 'Status deve ser: active, suspended, cancelled ou completed',
  })
  status?: string;

  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @IsOptional()
  endDate?: string;

  @IsDateString({}, { message: 'Data de cancelamento deve ser uma data válida' })
  @IsOptional()
  cancellationDate?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
