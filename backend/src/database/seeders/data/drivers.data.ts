import { Driver, DriverStatus } from '../../../entities/driver.entity';

// Transport Express Drivers
export const DRIVERS_TRANSPORT_EXPRESS: Partial<Driver>[] = [
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'driver1@transport-express.fr',
    phone: '+33 6 11 22 33 44',
    licenseNumber: 'LIC001TE',
    licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status: DriverStatus.ACTIVE,
    address: '12 Rue Victor Hugo',
    city: 'Lyon',
    postalCode: '69003',
  },
  {
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'driver2@transport-express.fr',
    phone: '+33 6 55 66 77 88',
    licenseNumber: 'LIC002TE',
    licenseExpiryDate: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000),
    status: DriverStatus.ACTIVE,
    address: '34 Avenue Jean Jaurès',
    city: 'Lyon',
    postalCode: '69007',
  },
];

// LogisTrans Drivers
export const DRIVERS_LOGISTRANS: Partial<Driver>[] = [
  {
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'driver@logistrans.com',
    phone: '+33 6 99 88 77 66',
    licenseNumber: 'LIC001LT',
    licenseExpiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
    status: DriverStatus.ACTIVE,
    address: '56 Rue de la République',
    city: 'Marseille',
    postalCode: '13002',
  },
];
