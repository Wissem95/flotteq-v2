import { createServer, Server } from 'node:net';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let redisServer: Server;
  let redisPort: number;

  beforeEach(async () => {
    redisServer = createServer((socket) => {
      socket.on('data', (data) => {
        const command = data.toString('utf8');
        if (
          command.includes('AUTH') &&
          command.includes('health-test-password') &&
          command.includes('PING')
        ) {
          socket.write('+OK\r\n+PONG\r\n');
        } else {
          socket.write('-NOAUTH Authentication required.\r\n');
        }
      });
    });

    await new Promise<void>((resolve) => redisServer.listen(0, '127.0.0.1', resolve));
    const address = redisServer.address();
    if (!address || typeof address === 'string') {
      throw new Error('Le serveur Redis de test n’a pas démarré');
    }
    redisPort = address.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      redisServer.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it('signale Redis connecté lorsque le serveur répond PONG', async () => {
    const config = {
      get: (key: string, defaultValue?: string) =>
        (
          {
            NODE_ENV: 'test',
            BUILD_SHA: 'unit-sha',
            REDIS_ENABLED: 'true',
            REDIS_HOST: '127.0.0.1',
            REDIS_PORT: String(redisPort),
            REDIS_PASSWORD: 'health-test-password',
          } as Record<string, string>
        )[key] ?? defaultValue,
    };
    const dataSource = { query: jest.fn().mockResolvedValue(undefined) };
    const service = new HealthService(dataSource as never, config as never);

    await expect(service.check()).resolves.toMatchObject({
      status: 'ok',
      build: 'unit-sha',
      database: 'connected',
      redis: 'connected',
    });
  });

  it('renvoie une indisponibilité lorsque PostgreSQL ne répond pas', async () => {
    const config = {
      get: (_key: string, defaultValue?: string) => defaultValue,
    };
    const dataSource = { query: jest.fn().mockRejectedValue(new Error('DB indisponible')) };
    const service = new HealthService(dataSource as never, config as never);

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
