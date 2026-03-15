import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLevelDto {
  @IsUUID('4', { message: 'modalityId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'modalityId é obrigatório' })
  modalityId: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome do nível é obrigatório' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um hex válido, ex: #3B82F6' })
  color?: string;
}
