import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { createConnection } from 'node:net';
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
      if (dbStatus !== 'connected') {
        throw new Error('PostgreSQL indisponible');
      }

      // Check Redis (optionnel si activé)
      const redisStatus = await this.checkRedis();
      if (redisStatus !== 'connected' && redisStatus !== 'disabled') {
        throw new Error('Redis indisponible');
      }

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: this.configService.get('NODE_ENV', 'development'),
        version: '2.0.0',
        build: this.configService.get('BUILD_SHA', 'unknown'),
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

    const host = this.configService.get('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get('REDIS_PORT', '6379'));
    const password = this.configService.get<string>('REDIS_PASSWORD');

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return 'disconnected';
    }

    const command = password
      ? `${this.toRedisCommand(['AUTH', password])}${this.toRedisCommand(['PING'])}`
      : this.toRedisCommand(['PING']);

    return new Promise((resolve) => {
      const socket = createConnection({ host, port });
      let response = '';
      let settled = false;

      const finish = (status: string) => {
        if (settled) {
          return;
        }
        settled = true;
        socket.destroy();
        resolve(status);
      };

      socket.setTimeout(1500, () => finish('disconnected'));
      socket.once('error', () => finish('disconnected'));
      socket.once('connect', () => socket.write(command));
      socket.on('data', (data) => {
        response += data.toString('utf8');
        if (response.includes('+PONG\r\n')) {
          finish('connected');
        } else if (response.startsWith('-')) {
          finish('disconnected');
        }
      });
    });
  }

  private toRedisCommand(parts: string[]): string {
    return `*${parts.length}\r\n${parts
      .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
      .join('')}`;
  }
}
