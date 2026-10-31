import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Enrollment, (e) => e.student)
  enrollments: Enrollment[];
}
