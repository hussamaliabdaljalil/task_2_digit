import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/decimal.transformer';
import { Course } from '../courses/course.entity';
import { Student } from '../students/student.entity';
import { EnrollmentStatus } from './enrollment-status.enum';

/**
 * Re-enrollment after cancellation IS allowed, so there is no plain unique
 * (studentId, courseId) constraint. Instead a *partial* unique index guarantees
 * at most one ACTIVE enrollment per student/course pair, even under concurrency.
 */
@Index('UQ_enrollment_active_student_course', ['studentId', 'courseId'], {
  unique: true,
  where: `"status" = 'ACTIVE'`,
})
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  courseId: number;

  @ManyToOne(() => Student, (s) => s.enrollments, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Course, (c) => c.enrollments, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  priceAtEnrollment: number;

  @Column({ type: 'simple-enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @CreateDateColumn()
  enrolledAt: Date;
}
