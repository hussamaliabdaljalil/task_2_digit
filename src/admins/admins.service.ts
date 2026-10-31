import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/db-errors';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(@InjectRepository(Admin) private readonly repo: Repository<Admin>) {}

  async create(dto: CreateAdminDto): Promise<Admin> {
    await this.assertEmailFree(dto.email);
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Email already in use');
      throw err;
    }
  }

  findAll(): Promise<Admin[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.repo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin ${id} not found`);
    return admin;
  }

  async update(id: number, dto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);
    if (dto.email && dto.email !== admin.email) await this.assertEmailFree(dto.email);
    Object.assign(admin, dto);
    try {
      return await this.repo.save(admin);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Email already in use');
      throw err;
    }
  }

  async remove(id: number): Promise<void> {
    const admin = await this.findOne(id);
    await this.repo.remove(admin);
  }

  private async assertEmailFree(email: string) {
    if (await this.repo.exists({ where: { email } })) {
      throw new ConflictException('Email already in use');
    }
  }
}
