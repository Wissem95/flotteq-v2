import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async check() {
    const startTime = Date.now();

    try {
      // Check Database
      const dbStatus = await this.checkDatabase();

      // Check Redis (optionnel si activé)
      const redisStatus = await this.checkRedis();

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: this.configService.get('NODE_ENV', 'development'),
        version: '2.0.0',
        database: dbStatus,
        redis: redisStatus,
        responseTime: `${responseTime}ms`,
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async checkDatabase(): Promise<string> {
    try {
      // Simple query pour vérifier la connexion
      await this.dataSource.query('SELECT 1');
      return 'connected';
    } catch (error) {
      return `disconnected: ${error.message}`;
    }
  }

  private async checkRedis(): Promise<string> {
    const redisEnabled = this.configService.get('REDIS_ENABLED', 'false');

    if (redisEnabled !== 'true') {
      return 'disabled';
    }

    // TODO: Ajouter vérification Redis si module installé
    // Pour l'instant, retourner "not_checked"
    return 'not_checked';
  }
}
