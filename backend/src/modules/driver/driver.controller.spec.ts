import { DriverController } from './driver.controller';
import { DriverStatus } from '../../entities/driver.entity';

describe('DriverController', () => {
  describe('getProfile', () => {
    it('renvoie les champs personnels persistés nécessaires au formulaire conducteur', async () => {
      const driver = {
        id: '4d6e66c6-829f-4dd8-80e8-8e6ed0e9c0d4',
        firstName: 'QA',
        lastName: 'Driver',
        email: 'qa@example.test',
        phone: '+33600000000',
        licenseNumber: 'QA-LICENSE',
        licenseExpiryDate: new Date('2036-10-06'),
        status: DriverStatus.ACTIVE,
        address: '1 rue Test',
        city: 'Paris',
        postalCode: '75001',
        emergencyContact: 'Contact QA',
        emergencyPhone: '+33611111111',
        birthDate: new Date('1990-01-01'),
        profilePhotoUrl: '/uploads/profile.jpg',
        profilePhotoThumbnail: '/uploads/profile-thumb.jpg',
        tenantId: 234,
        createdAt: new Date('2026-10-07T10:00:00.000Z'),
      };
      const driverRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
      };
      const driversService = {
        getDriverVehicles: jest.fn().mockResolvedValue([]),
      };
      const controller = new DriverController(
        driversService as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        driverRepository as any,
        {} as any,
        {} as any,
      );

      const result = await controller.getProfile({
        user: { email: driver.email, tenantId: 234 },
      } as any);

      expect(result).toMatchObject({
        address: '1 rue Test',
        city: 'Paris',
        postalCode: '75001',
        emergencyContact: 'Contact QA',
        emergencyPhone: '+33611111111',
        birthDate: new Date('1990-01-01'),
        profilePhotoUrl: '/uploads/profile.jpg',
        profilePhotoThumbnail: '/uploads/profile-thumb.jpg',
      });
    });
  });
});
