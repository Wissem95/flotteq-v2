import { describe, it, expect, beforeEach, vi } from 'vitest';
import { driversService } from './drivers.service';
import api from '@/config/api';
import { DriverStatus } from '@/types/driver.types';

vi.mock('@/config/api');

describe('driversService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDrivers', () => {
    it('should fetch drivers with filters', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@test.com',
              status: DriverStatus.ACTIVE,
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await driversService.getDrivers({ page: 1, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/drivers?page=1&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle status filter', async () => {
      const mockResponse = { data: { data: [], total: 0, page: 1, limit: 10 } };
      (api.get as any).mockResolvedValue(mockResponse);

      await driversService.getDrivers({ page: 1, limit: 10, status: DriverStatus.ACTIVE });

      expect(api.get).toHaveBeenCalledWith('/drivers?page=1&limit=10&status=active');
    });
  });

  describe('getDriver', () => {
    it('should fetch a single driver', async () => {
      const mockDriver = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        status: DriverStatus.ACTIVE,
      };

      (api.get as any).mockResolvedValue({ data: mockDriver });

      const result = await driversService.getDriver('1');

      expect(api.get).toHaveBeenCalledWith('/drivers/1');
      expect(result).toEqual(mockDriver);
    });
  });

  describe('createDriver', () => {
    it('should create a new driver', async () => {
      const newDriver = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        phone: '+33612345678',
        licenseNumber: 'FR123456',
        licenseExpiryDate: '2025-12-31',
      };

      const mockResponse = { data: { id: '2', ...newDriver } };
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await driversService.createDriver(newDriver);

      expect(api.post).toHaveBeenCalledWith('/drivers', newDriver);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateDriver', () => {
    it('should update a driver', async () => {
      const updateData = { firstName: 'John Updated' };
      const mockResponse = { data: { id: '1', ...updateData } };

      (api.patch as any).mockResolvedValue(mockResponse);

      const result = await driversService.updateDriver('1', updateData);

      expect(api.patch).toHaveBeenCalledWith('/drivers/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteDriver', () => {
    it('should delete a driver', async () => {
      (api.delete as any).mockResolvedValue({});

      await driversService.deleteDriver('1');

      expect(api.delete).toHaveBeenCalledWith('/drivers/1');
    });
  });

  describe('getAvailableDrivers', () => {
    it('should fetch available drivers', async () => {
      const mockDrivers = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' },
      ];

      (api.get as any).mockResolvedValue({ data: mockDrivers });

      const result = await driversService.getAvailableDrivers();

      expect(api.get).toHaveBeenCalledWith('/drivers/available');
      expect(result).toEqual(mockDrivers);
    });
  });

  describe('getExpiringLicenses', () => {
    it('should fetch drivers with expiring licenses', async () => {
      const mockDrivers = [
        { id: '1', firstName: 'John', licenseExpiryDate: '2025-11-01' },
      ];

      (api.get as any).mockResolvedValue({ data: mockDrivers });

      const result = await driversService.getExpiringLicenses(30);

      expect(api.get).toHaveBeenCalledWith('/drivers/expiring-licenses?days=30');
      expect(result).toEqual(mockDrivers);
    });

    it('should use default 30 days', async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      await driversService.getExpiringLicenses();

      expect(api.get).toHaveBeenCalledWith('/drivers/expiring-licenses?days=30');
    });
  });

  describe('assignVehicle', () => {
    it('should assign a vehicle to driver', async () => {
      const mockResponse = { data: { id: '1', vehicles: ['v1'] } };
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await driversService.assignVehicle('1', { vehicleId: 'v1' });

      expect(api.post).toHaveBeenCalledWith('/drivers/1/assign-vehicle', { vehicleId: 'v1' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('unassignVehicle', () => {
    it('should unassign a vehicle from driver', async () => {
      const mockResponse = { data: { id: '1', vehicles: [] } };
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await driversService.unassignVehicle('1', { vehicleId: 'v1' });

      expect(api.post).toHaveBeenCalledWith('/drivers/1/unassign-vehicle', { vehicleId: 'v1' });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
