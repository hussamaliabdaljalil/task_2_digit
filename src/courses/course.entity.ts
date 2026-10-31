import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../common/decimal.transformer';
import { Enrollment } from '../enrollments/enrollment.entity';
import { DiscountType } from './discount-type.enum';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'simple-enum', enum: DiscountType, default: DiscountType.NONE })
  discountType: DiscountType;

  @Column({
    type: 'decimal', precision: 10, scale: 2, default: 0, transformer: decimalTransformer,
  })
  discountValue: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Enrollment, (e) => e.course)
  enrollments: Enrollment[];
}
