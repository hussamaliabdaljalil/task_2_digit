import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/db-errors';
import { toCourseResponse } from '../courses/course-pricing';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private readonly repo: Repository<Student>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    await this.assertEmailFree(dto.email);
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Email already in use');
      throw err;
    }
  }

  findAll(): Promise<Student[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.repo.findOne({ where: { id } });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    if (dto.email && dto.email !== student.email) await this.assertEmailFree(dto.email);
    Object.assign(student, dto);
    try {
      return await this.repo.save(student);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Email already in use');
      throw err;
    }
  }

  /** Blocked while the student has any enrollment records (history is kept). */
  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    const count = await this.enrollments.count({ where: { studentId: id } });
    if (count > 0) {
      throw new ConflictException(
        `Student ${id} has ${count} enrollment(s) and cannot be deleted`,
      );
    }
    await this.repo.remove(student);
  }

  /** Courses a student is enrolled in: course details, status, priceAtEnrollment. */
  async findEnrollments(id: number) {
    await this.findOne(id);
    const rows = await this.enrollments.find({
      where: { studentId: id },
      relations: { course: true },
      order: { id: 'ASC' },
    });
    return rows.map((e) => ({
      id: e.id,
      status: e.status,
      priceAtEnrollment: e.priceAtEnrollment,
      enrolledAt: e.enrolledAt,
      course: toCourseResponse(e.course),
    }));
  }

  private async assertEmailFree(email: string) {
    if (await this.repo.exists({ where: { email } })) {
      throw new ConflictException('Email already in use');
    }
  }
}
