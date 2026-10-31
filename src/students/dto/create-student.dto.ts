import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{6,25}$/, { message: 'phone must be a valid phone number' })
  phone?: string;
}
