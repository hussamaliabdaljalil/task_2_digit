import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { EnrollmentsController } from './enrollments.controller';
import { Enrollment } from './enrollment.entity';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment]), StudentsModule, CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
