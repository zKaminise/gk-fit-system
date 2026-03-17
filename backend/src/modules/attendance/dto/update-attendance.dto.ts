import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAttendanceDto {
  @IsString()
  @IsOptional()
  @IsIn(['present', 'absent', 'justified_absence', 'makeup'], {
    message: 'Status deve ser: present, absent, justified_absence ou makeup',
  })
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  notes?: string;
}
