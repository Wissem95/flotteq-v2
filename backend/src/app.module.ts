import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './test/test.controller';
import { TenantModule } from './core/tenant/tenant.module';
import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { TenantGuard } from './core/tenant/tenant.guard';
import { TenantInterceptor } from './core/tenant/tenant.interceptor';
import { AuthModule } from './core/auth/auth.module';
import { HybridAuthGuard } from './core/auth/guards/hybrid-auth.guard';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DriversModule } from './modules/drivers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OnboardingModule } from './core/onboarding/onboarding.module';
import { AuditModule } from './modules/audit/audit.module';
import { PartnersModule } from './modules/partners/partners.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { AvailabilitiesModule } from './modules/availabilities/availabilities.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { DriverModule } from './modules/driver/driver.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TripsModule } from './modules/trips/trips.module';
// import { StripeModule } from './stripe/stripe.module';
// import stripeConfig from './config/stripe.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // load: [stripeConfig],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'flotteq123'),
        database: configService.get('DB_NAME', 'flotteq_dev'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        migrations: ['dist/migrations/*.js'],
        migrationsRun: configService.get('NODE_ENV') === 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TenantModule,
    AuthModule,
    OnboardingModule,
    // StripeModule,  // Temporairement désactivé - nécessite clé Stripe valide
    AuditModule,
    PartnersModule,
    BookingsModule,
    CommissionsModule,
    AvailabilitiesModule,
    RatingsModule,
    DriverModule,
    ReportsModule,
    TripsModule,
    SubscriptionsModule,
    UsersModule,
    MaintenanceModule,
    VehiclesModule,
    DriversModule,
    DashboardModule,
    DocumentsModule,
    NotificationsModule,
  ],
  controllers: [AppController, TestController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: HybridAuthGuard, // Auth d'abord (accepte tenant ET partner tokens)
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard, // Puis tenant filtering
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        '/api/auth/(.*)',
        '/auth/(.*)',
        '/health',
        '/api/docs(.*)',
        '/api/tenants(.*)',
        '/api/onboarding/(.*)',
        '/api/stripe/webhook',
        '/api/availabilities/:partnerId', // Public: voir schedule partner
        '/api/availabilities/:partnerId/slots', // Public: rechercher créneaux
      )
      .forRoutes('*');
  }
}
