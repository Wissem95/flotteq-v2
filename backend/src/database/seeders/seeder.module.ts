import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederService } from './seeder.service';
import { Tenant } from '../../entities/tenant.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'flotteq123'),
        database: configService.get('DB_NAME', 'flotteq_dev'),
        entities: [Tenant, User, Vehicle, Driver],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([Tenant, User, Vehicle, Driver]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
