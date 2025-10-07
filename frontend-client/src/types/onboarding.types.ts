export interface OnboardingProfile {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyCountry: string;
  fleetSize: number;
}

export interface OnboardingVehicle {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  vin?: string;
}

export interface OnboardingDriver {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
}

export interface OnboardingData {
  profile: OnboardingProfile;
  vehicle?: OnboardingVehicle;
  driver?: OnboardingDriver;
}
