import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug é obrigatório' })
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  document?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  addressStreet?: string;

  @IsString()
  @IsOptional()
  addressNumber?: string;

  @IsString()
  @IsOptional()
  addressComplement?: string;

  @IsString()
  @IsOptional()
  addressNeighborhood?: string;

  @IsString()
  @IsOptional()
  addressCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  addressState?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  addressZip?: string;
}
