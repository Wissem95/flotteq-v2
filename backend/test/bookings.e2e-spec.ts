import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { BookingStatus } from '../src/entities/booking.entity';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let tenantId: number;
  let createdBookingId: string;
  let partnerId: string;
  let serviceId: string;
  let vehicleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // TODO: Setup test data (tenant, partner, vehicle, service)
    // For now, using mock IDs
    tenantId = 1;
    partnerId = 'mock-partner-id';
    serviceId = 'mock-service-id';
    vehicleId = 'mock-vehicle-id';
    jwtToken = 'mock-jwt-token'; // In real tests, get this from login endpoint
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', () => {
      const createBookingDto = {
        partnerId,
        vehicleId,
        serviceId,
        scheduledDate: '2025-11-01',
        scheduledTime: '14:00',
        endTime: '16:00',
        customerNotes: 'Please check brakes',
      };

      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createBookingDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.booking).toBeDefined();
          expect(res.body.booking.status).toBe(BookingStatus.PENDING);
          createdBookingId = res.body.booking.id;
        });
    });

    it('should fail with 400 if required fields are missing', () => {
      const invalidDto = {
        partnerId,
        // missing vehicleId, serviceId, etc.
      };

      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if scheduled date is in the past', () => {
      const pastBookingDto = {
        partnerId,
        vehicleId,
        serviceId,
        scheduledDate: '2020-01-01',
        scheduledTime: '14:00',
        endTime: '16:00',
      };

      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(pastBookingDto)
        .expect(400);
    });

    it('should fail with 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/api/bookings')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/bookings', () => {
    it('should return list of bookings with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ page: 1, limit: 20 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.total).toBeDefined();
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(20);
          expect(res.body.totalPages).toBeDefined();
        });
    });

    it('should filter bookings by status', () => {
      return request(app.getHttpServer())
        .get('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ status: BookingStatus.PENDING })
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((booking: any) => {
            expect(booking.status).toBe(BookingStatus.PENDING);
          });
        });
    });

    it('should filter bookings by date range', () => {
      return request(app.getHttpServer())
        .get('/api/bookings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          startDate: '2025-10-01',
          endDate: '2025-10-31',
        })
        .expect(200);
    });
  });

  describe('GET /api/bookings/upcoming', () => {
    it('should return upcoming confirmed bookings', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/upcoming')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.count).toBeDefined();
          expect(res.body.bookings).toBeInstanceOf(Array);
        });
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return a booking by id', async () => {
      if (!createdBookingId) {
        return; // Skip if no booking created
      }

      return request(app.getHttpServer())
        .get(`/api/bookings/${createdBookingId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.booking.id).toBe(createdBookingId);
        });
    });

    it('should return 404 if booking not found', () => {
      return request(app.getHttpServer())
        .get('/api/bookings/nonexistent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/bookings/:id/confirm', () => {
    it('should confirm a booking (partner only)', async () => {
      if (!createdBookingId) {
        return;
      }

      // Note: This test assumes the JWT token has partnerId
      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/confirm`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.booking.status).toBe(BookingStatus.CONFIRMED);
          expect(res.body.booking.confirmedAt).toBeDefined();
        });
    });

    it('should fail with 400 if booking cannot be confirmed', async () => {
      // Assuming booking is already confirmed or in wrong status
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/confirm`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/bookings/:id/reject', () => {
    it('should reject a booking with reason', async () => {
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/reject`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ reason: 'Not available at this time' })
        .expect(200)
        .expect((res) => {
          expect(res.body.booking.status).toBe(BookingStatus.REJECTED);
          expect(res.body.booking.rejectionReason).toBe(
            'Not available at this time',
          );
        });
    });
  });

  describe('PATCH /api/bookings/:id/reschedule', () => {
    it('should reschedule a booking', async () => {
      if (!createdBookingId) {
        return;
      }

      const rescheduleDto = {
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        endTime: '12:00',
      };

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/reschedule`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(rescheduleDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.booking.scheduledTime).toBe('10:00');
        });
    });

    it('should fail with 400 if new date is in the past', async () => {
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/reschedule`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          scheduledDate: '2020-01-01',
          scheduledTime: '10:00',
          endTime: '12:00',
        })
        .expect(400);
    });
  });

  describe('PATCH /api/bookings/:id/start', () => {
    it('should start work on a confirmed booking', async () => {
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/start`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.booking.status).toBe(BookingStatus.IN_PROGRESS);
        });
    });
  });

  describe('PATCH /api/bookings/:id/complete', () => {
    it('should complete a booking and calculate commission', async () => {
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/complete`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ partnerNotes: 'Work completed successfully' })
        .expect(200)
        .expect((res) => {
          expect(res.body.booking.status).toBe(BookingStatus.COMPLETED);
          expect(res.body.booking.completedAt).toBeDefined();
          expect(res.body.booking.commissionAmount).toBeGreaterThan(0);
          expect(res.body.commission).toBeDefined();
        });
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/api/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ reason: 'Customer changed plans' })
        .expect(200)
        .expect((res) => {
          expect(res.body.booking.status).toBe(BookingStatus.CANCELLED);
          expect(res.body.booking.cancellationReason).toBe(
            'Customer changed plans',
          );
        });
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should soft delete a booking', async () => {
      if (!createdBookingId) {
        return;
      }

      return request(app.getHttpServer())
        .delete(`/api/bookings/${createdBookingId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(204);
    });
  });
});
