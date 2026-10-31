import { IsInt, IsPositive } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt()
  @IsPositive()
  studentId: number;

  @IsInt()
  @IsPositive()
  courseId: number;
}
