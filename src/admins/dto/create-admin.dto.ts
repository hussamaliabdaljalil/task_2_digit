import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;
}
