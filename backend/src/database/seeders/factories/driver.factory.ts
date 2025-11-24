import { Driver, DriverStatus } from '../../../entities/driver.entity';

export class DriverFactory {
  static create(data: Partial<Driver> = {}): Driver {
    const driver = new Driver();
    driver.firstName = data.firstName || 'Jean';
    driver.lastName = data.lastName || 'Dupont';
    driver.licenseNumber =
      data.licenseNumber || `LIC${Math.floor(Math.random() * 100000)}`;
    driver.licenseExpiryDate =
      data.licenseExpiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    driver.phone =
      data.phone || `+33 6 ${Math.floor(Math.random() * 100000000)}`;
    driver.email = data.email || `driver${Math.random()}@example.com`;
    driver.status = data.status || DriverStatus.ACTIVE;
    driver.tenantId = data.tenantId!;
    return Object.assign(driver, data);
  }
}
