import { IsOptional, IsString } from 'class-validator';

export class UpdateGuardianDto {
  @IsString()
  @IsOptional()
  notes?: string;
}