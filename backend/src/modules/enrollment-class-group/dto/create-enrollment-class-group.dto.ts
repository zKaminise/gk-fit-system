import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentClassGroupDto {
  @IsUUID('4', { message: 'enrollmentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'enrollmentId é obrigatório' })
  enrollmentId: string;

  @IsUUID('4', { message: 'classGroupId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'classGroupId é obrigatório' })
  classGroupId: string;
}