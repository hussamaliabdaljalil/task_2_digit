import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/db-errors';
import { calculateFinalPrice } from '../courses/course-pricing';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './enrollment.entity';
import { EnrollmentStatus } from './enrollment-status.enum';

const DUPLICATE_MSG = 'Student already has an active enrollment in this course';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private readonly repo: Repository<Enrollment>,
    private readonly students: StudentsService,
    private readonly courses: CoursesService,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    // 1. student exists (404)
    await this.students.findOne(dto.studentId);
    // 2. course exists (404) and is active (400)
    const course = await this.courses.findEntity(dto.courseId);
    if (!course.isActive) {
      throw new BadRequestException('Cannot enroll in an inactive course');
    }
    // 3. no duplicate ACTIVE enrollment (409). Cancelled ones don't block re-enrollment.
    await this.assertNoActiveEnrollment(dto.studentId, dto.courseId);
    // 4 + 5. price calculated on the backend, snapshotted on the enrollment
    const priceAtEnrollment = calculateFinalPrice(
      course.price, course.discountType, course.discountValue,
    );

    try {
      const saved = await this.repo.save(
        this.repo.create({
          studentId: dto.studentId,
          courseId: dto.courseId,
          priceAtEnrollment,
          status: EnrollmentStatus.ACTIVE,
        }),
      );
      // 6. 201 Created (default for @Post)
      return this.toResponse(saved);
    } catch (err) {
      // Concurrent request slipped past the check; the partial unique index caught it.
      if (isUniqueViolation(err)) throw new ConflictException(DUPLICATE_MSG);
      throw err;
    }
  }

  async findAll() {
    const rows = await this.repo.find({ order: { id: 'ASC' } });
    return rows.map((e) => this.toResponse(e));
  }

  async findOne(id: number) {
    return this.toResponse(await this.findEntity(id));
  }

  async update(id: number, dto: UpdateEnrollmentDto) {
    const enrollment = await this.findEntity(id);

    // Re-activating a cancelled enrollment must not create a second ACTIVE one.
    if (dto.status === EnrollmentStatus.ACTIVE && enrollment.status !== EnrollmentStatus.ACTIVE) {
      await this.assertNoActiveEnrollment(enrollment.studentId, enrollment.courseId);
    }
    enrollment.status = dto.status;
    try {
      return this.toResponse(await this.repo.save(enrollment));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException(DUPLICATE_MSG);
      throw err;
    }
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(await this.findEntity(id));
  }

  private async findEntity(id: number): Promise<Enrollment> {
    const enrollment = await this.repo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException(`Enrollment ${id} not found`);
    return enrollment;
  }

  private async assertNoActiveEnrollment(studentId: number, courseId: number) {
    const exists = await this.repo.exists({
      where: { studentId, courseId, status: EnrollmentStatus.ACTIVE },
    });
    if (exists) throw new ConflictException(DUPLICATE_MSG);
  }

  private toResponse(e: Enrollment) {
    return {
      id: e.id,
      studentId: e.studentId,
      courseId: e.courseId,
      priceAtEnrollment: e.priceAtEnrollment,
      status: e.status,
      enrolledAt: e.enrolledAt,
    };
  }
}
