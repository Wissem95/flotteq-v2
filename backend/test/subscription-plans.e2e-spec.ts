import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Public subscription plans (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('exposes the commercial catalogue and limits used on the landing page', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/subscriptions/plans')
      .expect(200);

    const plans = response.body as Array<{
      name: string;
      price: number;
      maxVehicles: number;
      isActive: boolean;
    }>;

    expect(plans.map(({ name }) => name).sort()).toEqual([
      'Business',
      'Enterprise',
      'Pro',
      'Starter',
    ]);

    expect(plans).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Starter',
          price: 0,
          maxVehicles: 3,
          isActive: true,
        }),
        expect.objectContaining({
          name: 'Pro',
          price: 29,
          maxVehicles: 10,
          isActive: true,
        }),
        expect.objectContaining({
          name: 'Business',
          price: 79,
          maxVehicles: 50,
          isActive: true,
        }),
        expect.objectContaining({
          name: 'Enterprise',
          price: 0,
          maxVehicles: -1,
          isActive: true,
        }),
      ]),
    );
  });
});
