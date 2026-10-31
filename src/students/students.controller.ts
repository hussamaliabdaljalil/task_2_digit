import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.students.create(dto);
  }

  @Get()
  findAll() {
    return this.students.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.students.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.students.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.students.remove(id);
  }

  @Get(':id/enrollments')
  findEnrollments(@Param('id', ParseIntPipe) id: number) {
    return this.students.findEnrollments(id);
  }
}
