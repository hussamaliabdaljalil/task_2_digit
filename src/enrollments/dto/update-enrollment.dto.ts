import { IsEnum } from 'class-validator';
import { EnrollmentStatus } from '../enrollment-status.enum';

export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
