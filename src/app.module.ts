import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AdminsModule } from './admins/admins.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const common = {
          autoLoadEntities: true,
          // Auto schema sync is for development only; use migrations in production.
          synchronize: config.get('DB_SYNCHRONIZE', 'true') === 'true',
        };
        // sqlite is only used by the e2e tests (no Postgres needed to run them)
        if (config.get('DB_TYPE') === 'sqlite') {
          return { type: 'better-sqlite3', database: config.get('task2_database', ':memory:'), ...common };
        }
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 5432)),
          username: config.get('DB_USER', 'postgres'),
          password: config.get('DB_PASSWORD', '12345'),
          database: config.get('DB_NAME', 'task2_database'),
          ...common,
        };
      },
    }),
    AdminsModule,
    StudentsModule,
    CoursesModule,
    EnrollmentsModule,
  ],
})
export class AppModule {}
