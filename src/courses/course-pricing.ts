import { BadRequestException } from '@nestjs/common';
import { Course } from './course.entity';
import { DiscountType } from './discount-type.enum';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Validates a (price, discountType, discountValue) combination and returns the
 * normalised discount value (NONE always becomes 0). Throws 400 on invalid input.
 */
export function validatePricing(price: number, type: DiscountType, value: number): number {
  if (price < 0) throw new BadRequestException('price must not be negative');
  if (value < 0) throw new BadRequestException('discountValue must not be negative');

  switch (type) {
    case DiscountType.NONE:
      return 0;
    case DiscountType.PERCENTAGE:
      if (value > 100) {
        throw new BadRequestException('Percentage discountValue must be between 0 and 100');
      }
      return value;
    case DiscountType.FIXED:
      if (value > price) {
        throw new BadRequestException('Fixed discountValue must not exceed the course price');
      }
      return value;
    default:
      throw new BadRequestException(`Unknown discountType "${type as string}"`);
  }
}

/** finalPrice per the discount rules table in the spec. */
export function calculateFinalPrice(price: number, type: DiscountType, value: number): number {
  switch (type) {
    case DiscountType.PERCENTAGE:
      return round2(price - (price * value) / 100);
    case DiscountType.FIXED:
      return round2(price - value);
    default:
      return round2(price);
  }
}

export function toCourseResponse(course: Course) {
  const { enrollments: _ignored, ...rest } = course;
  return {
    ...rest,
    finalPrice: calculateFinalPrice(course.price, course.discountType, course.discountValue),
  };
}
