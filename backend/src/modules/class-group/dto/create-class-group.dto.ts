import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassGroupDto {
  @IsUUID('4', { message: 'modalityId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'modalityId é obrigatório' })
  modalityId: string;

  @IsUUID('4', { message: 'levelId deve ser um UUID válido' })
  @IsOptional()
  levelId?: string;

  @IsUUID('4', { message: 'teacherId deve ser um UUID válido' })
  @IsOptional()
  teacherId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome da turma é obrigatório' })
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Dias da semana são obrigatórios' })
  @MaxLength(30)
  @Matches(/^(mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*$/, {
    message: 'Dias devem ser: mon,tue,wed,thu,fri,sat,sun separados por vírgula',
  })
  daysOfWeek: string;

  @IsString()
  @IsNotEmpty({ message: 'Horário de início é obrigatório' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de início deve ser no formato HH:mm (ex: 08:00, 14:30)',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Horário de término é obrigatório' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de término deve ser no formato HH:mm (ex: 09:00, 15:30)',
  })
  endTime: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsInt()
  @Min(1, { message: 'Capacidade mínima é 1' })
  @Max(200, { message: 'Capacidade máxima é 200' })
  @IsOptional()
  maxCapacity?: number;
}
