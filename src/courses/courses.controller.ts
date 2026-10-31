import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courses.create(dto);
  }

  @Get()
  findAll() {
    return this.courses.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courses.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.courses.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courses.remove(id);
  }

  @Get(':id/enrollments')
  findEnrollments(@Param('id', ParseIntPipe) id: number) {
    return this.courses.findEnrollments(id);
  }
}
