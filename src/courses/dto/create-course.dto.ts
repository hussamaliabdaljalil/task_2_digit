import {
  IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';
import { DiscountType } from '../discount-type.enum';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
