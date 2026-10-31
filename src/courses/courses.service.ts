import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from './course.entity';
import { toCourseResponse, validatePricing } from './course-pricing';
import { DiscountType } from './discount-type.enum';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private readonly repo: Repository<Course>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
  ) {}

  async create(dto: CreateCourseDto) {
    const type = dto.discountType ?? DiscountType.NONE;
    const value = validatePricing(dto.price, type, dto.discountValue ?? 0);
    const course = await this.repo.save(
      this.repo.create({
        title: dto.title,
        description: dto.description ?? null,
        price: dto.price,
        discountType: type,
        discountValue: value,
        isActive: dto.isActive ?? true,
      }),
    );
    return toCourseResponse(course);
  }

  async findAll() {
    const courses = await this.repo.find({ order: { id: 'ASC' } });
    return courses.map(toCourseResponse);
  }

  async findOne(id: number) {
    return toCourseResponse(await this.findEntity(id));
  }

  /** Entity (without finalPrice) – used internally, e.g. by EnrollmentsService. */
  async findEntity(id: number): Promise<Course> {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.findEntity(id);

    // Validate the *resulting* combination, not just the supplied fields.
    const price = dto.price ?? course.price;
    const type = dto.discountType ?? course.discountType;
    const rawValue =
      dto.discountValue ?? (dto.discountType === DiscountType.NONE ? 0 : course.discountValue);
    const value = validatePricing(price, type, rawValue);

    if (dto.title !== undefined) course.title = dto.title;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.isActive !== undefined) course.isActive = dto.isActive;
    course.price = price;
    course.discountType = type;
    course.discountValue = value;

    return toCourseResponse(await this.repo.save(course));
  }

  /** Blocked while the course has any enrollment records (history is kept). */
  async remove(id: number): Promise<void> {
    const course = await this.findEntity(id);
    const count = await this.enrollments.count({ where: { courseId: id } });
    if (count > 0) {
      throw new ConflictException(
        `Course ${id} has ${count} enrollment(s) and cannot be deleted; set isActive=false instead`,
      );
    }
    await this.repo.remove(course);
  }

  /** Students enrolled in a course: enrollment data, student details, status, price. */
  async findEnrollments(id: number) {
    await this.findEntity(id);
    const rows = await this.enrollments.find({
      where: { courseId: id },
      relations: { student: true },
      order: { id: 'ASC' },
    });
    return rows.map((e) => {
      const { enrollments: _ignored, ...student } = e.student;
      return {
        id: e.id,
        status: e.status,
        priceAtEnrollment: e.priceAtEnrollment,
        enrolledAt: e.enrolledAt,
        student,
      };
    });
  }
}
