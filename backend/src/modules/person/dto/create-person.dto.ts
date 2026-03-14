import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @MaxLength(255)
  fullName: string;

  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida' })
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(14)
  cpf?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  rg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1)
  gender?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneSecondary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressStreet?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  addressNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressComplement?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressNeighborhood?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  addressState?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  addressZip?: string;

  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  photoUrl?: string;
}
