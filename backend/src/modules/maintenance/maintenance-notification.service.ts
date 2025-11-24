import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaintenanceService } from './maintenance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity';

@Injectable()
export class MaintenanceNotificationService {
  private readonly logger = new Logger(MaintenanceNotificationService.name);

  constructor(
    private readonly maintenanceService: MaintenanceService,
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  /**
   * Cron job that runs every day at 8 AM to check for upcoming maintenances
   * Sends email alerts for maintenances within the next 7 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkUpcomingMaintenances() {
    this.logger.log('Running scheduled maintenance check...');

    try {
      // Get all unique tenant IDs
      const tenants = await this.maintenanceRepository
        .createQueryBuilder('m')
        .select('DISTINCT m.tenantId', 'tenantId')
        .getRawMany();

      for (const tenant of tenants) {
        const tenantId = tenant.tenantId;

        // Check date-based alerts
        const upcomingMaintenances =
          await this.maintenanceService.getUpcomingMaintenances(tenantId, 7);

        if (upcomingMaintenances.length > 0) {
          this.logger.log(
            `Found ${upcomingMaintenances.length} upcoming maintenances for tenant ${tenantId}`,
          );

          for (const maintenance of upcomingMaintenances) {
            await this.sendMaintenanceAlert(maintenance);
          }
        }

        // Check km-based alerts
        const kmAlerts =
          await this.maintenanceService.getMaintenancesByKmAlert(tenantId);

        if (kmAlerts.length > 0) {
          this.logger.log(
            `Found ${kmAlerts.length} km-based alerts for tenant ${tenantId}`,
          );

          for (const alert of kmAlerts) {
            await this.sendMaintenanceAlert(alert);
          }
        }
      }

      this.logger.log('Scheduled maintenance check completed');
    } catch (error) {
      this.logger.error('Error during scheduled maintenance check', error);
    }
  }

  /**
   * Send maintenance alert notification
   * In production, this would integrate with an email service (SendGrid, AWS SES, etc.)
   */
  private async sendMaintenanceAlert(alert: any): Promise<void> {
    this.logger.log(
      `Sending alert for maintenance ${alert.maintenanceId}: ${alert.alertReason}`,
    );

    // TODO: Integrate with email service
    // Example: await this.emailService.send({
    //   to: tenant.email,
    //   subject: `Maintenance Alert: ${alert.vehicleRegistration}`,
    //   template: 'maintenance-alert',
    //   context: alert,
    // });

    // For now, just log the alert
    this.logger.log(
      JSON.stringify({
        type: 'MAINTENANCE_ALERT',
        vehicleRegistration: alert.vehicleRegistration,
        maintenanceType: alert.type,
        alertReason: alert.alertReason,
        scheduledDate: alert.scheduledDate,
      }),
    );
  }

  /**
   * Manual trigger for sending alerts (useful for testing)
   */
  async sendManualAlert(
    maintenanceId: string,
    tenantId: number,
  ): Promise<void> {
    const maintenance = await this.maintenanceService.findOne(
      maintenanceId,
      tenantId,
    );

    const alert = {
      maintenanceId: maintenance.id,
      vehicleRegistration: maintenance.vehicle.registration,
      type: maintenance.type,
      scheduledDate: maintenance.scheduledDate,
      daysUntil: Math.ceil(
        (new Date(maintenance.scheduledDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      ),
      alertReason: 'Manual alert triggered',
    };

    await this.sendMaintenanceAlert(alert);
  }

  /**
   * Check overdue maintenances
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueMaintenances() {
    this.logger.log('Checking for overdue maintenances...');

    try {
      const tenants = await this.maintenanceRepository
        .createQueryBuilder('m')
        .select('DISTINCT m.tenantId', 'tenantId')
        .getRawMany();

      for (const tenant of tenants) {
        const overdueMaintenances =
          await this.maintenanceService.getUpcomingMaintenances(
            tenant.tenantId,
            -30,
          );

        const overdue = overdueMaintenances.filter((m) => m.daysUntil < 0);

        if (overdue.length > 0) {
          this.logger.warn(
            `Found ${overdue.length} overdue maintenances for tenant ${tenant.tenantId}`,
          );

          for (const maintenance of overdue) {
            await this.sendMaintenanceAlert({
              ...maintenance,
              alertReason: `OVERDUE: ${Math.abs(maintenance.daysUntil)} days overdue`,
            });
          }
        }
      }

      this.logger.log('Overdue maintenance check completed');
    } catch (error) {
      this.logger.error('Error during overdue maintenance check', error);
    }
  }
}
