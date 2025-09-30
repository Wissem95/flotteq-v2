import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Login pour obtenir un token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Nettoyer les véhicules de test
    if (dataSource) {
      await dataSource.query('DELETE FROM vehicles WHERE tenant_id = 1');
    }
    await app.close();
  });

  describe('POST /vehicles', () => {
    it('should create a new vehicle', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .send({
          registration: 'AB-123-CD',
          brand: 'Renault',
          model: 'Kangoo',
          year: 2023,
          vin: 'VF1234567890ABCDE',
          mileage: 5000,
          color: 'Blanc',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.registration).toBe('AB-123-CD');
          expect(response.body.brand).toBe('Renault');
          expect(response.body.status).toBe('available');
          vehicleId = response.body.id;
        });
    });

    it('should return 409 if registration already exists', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .send({
          registration: 'AB-123-CD',
          brand: 'Peugeot',
          model: 'Partner',
          year: 2022,
          vin: 'VF9876543210ZYXWV',
          mileage: 3000,
        })
        .expect(409);
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .send({
          registration: 'XY-999-ZZ',
          brand: 'Citroën',
          // model manquant
          year: 2021,
          vin: 'VF1111222333444555',
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .set('X-Tenant-ID', '1')
        .send({
          registration: 'NO-AUTH-01',
          brand: 'Renault',
          model: 'Clio',
          year: 2020,
          vin: 'VFNOAUTH123456789',
        })
        .expect(401);
    });
  });

  describe('GET /vehicles', () => {
    it('should return a list of vehicles with pagination', () => {
      return request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('page');
          expect(response.body).toHaveProperty('limit');
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    it('should filter vehicles by status', () => {
      return request(app.getHttpServer())
        .get('/vehicles?status=available')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200)
        .then((response) => {
          expect(response.body.data.every((v: any) => v.status === 'available')).toBe(true);
        });
    });

    it('should filter vehicles by brand', () => {
      return request(app.getHttpServer())
        .get('/vehicles?brand=Renault')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200)
        .then((response) => {
          expect(response.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /vehicles/stats', () => {
    it('should return vehicle statistics', () => {
      return request(app.getHttpServer())
        .get('/vehicles/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('byStatus');
          expect(response.body).toHaveProperty('averageMileage');
          expect(response.body).toHaveProperty('needingMaintenance');
          expect(Array.isArray(response.body.byStatus)).toBe(true);
        });
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return a vehicle by id', () => {
      return request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(vehicleId);
          expect(response.body.registration).toBe('AB-123-CD');
        });
    });

    it('should return 404 if vehicle not found', () => {
      return request(app.getHttpServer())
        .get('/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(404);
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/vehicles/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(400);
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('should update a vehicle', () => {
      return request(app.getHttpServer())
        .patch(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .send({
          mileage: 6000,
          status: 'in_use',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.mileage).toBe(6000);
          expect(response.body.status).toBe('in_use');
        });
    });

    it('should return 404 if vehicle not found', () => {
      return request(app.getHttpServer())
        .patch('/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .send({
          mileage: 7000,
        })
        .expect(404);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should delete a vehicle', () => {
      return request(app.getHttpServer())
        .delete(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200);
    });

    it('should return 404 if vehicle not found', () => {
      return request(app.getHttpServer())
        .delete('/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(404);
    });

    it('should return 404 when trying to get deleted vehicle', () => {
      return request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '1')
        .expect(404);
    });
  });
});