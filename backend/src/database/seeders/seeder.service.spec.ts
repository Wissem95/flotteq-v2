import { SeederService } from './seeder.service';

describe('SeederService', () => {
  const originalEnvironment = process.env;

  afterEach(() => {
    process.env = originalEnvironment;
    jest.restoreAllMocks();
  });

  it('refuse le seed avant toute suppression quand les secrets sont absents', async () => {
    process.env = {
      ...originalEnvironment,
      NODE_ENV: 'test',
    };
    delete process.env.SEED_SUPER_ADMIN_PASSWORD;
    delete process.env.SEED_DEMO_PASSWORD;

    const dataSource = {
      createQueryRunner: jest.fn(),
    };
    const service = new SeederService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      dataSource as never,
    );

    await expect(service.seedAll()).rejects.toThrow(
      'SEED_SUPER_ADMIN_PASSWORD',
    );
    expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
  });
});
