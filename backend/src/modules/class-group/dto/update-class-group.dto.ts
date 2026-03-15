import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateClassGroupDto {
  @IsUUID('4', { message: 'levelId deve ser um UUID válido' })
  @IsOptional()
  levelId?: string | null;

  @IsUUID('4', { message: 'teacherId deve ser um UUID válido' })
  @IsOptional()
  teacherId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  @Matches(/^(mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*$/, {
    message: 'Dias devem ser: mon,tue,wed,thu,fri,sat,sun separados por vírgula',
  })
  daysOfWeek?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário deve ser no formato HH:mm',
  })
  startTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário deve ser no formato HH:mm',
  })
  endTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxCapacity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
