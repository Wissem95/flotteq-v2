export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  birthDate?: string;
  profilePhotoUrl?: string | null;
  profilePhotoThumbnail?: string | null;
}

export function buildProfileUpdatePayload(profile: ProfileData) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    postalCode: profile.postalCode,
    emergencyContact: profile.emergencyContact,
    emergencyPhone: profile.emergencyPhone,
    ...(profile.birthDate ? { birthDate: profile.birthDate } : {}),
  };
}
