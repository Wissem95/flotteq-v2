import { differenceInDays, parseISO } from 'date-fns';

interface DriverExpiringBadgeProps {
  licenseExpiryDate: string;
  className?: string;
}

export default function DriverExpiringBadge({ licenseExpiryDate, className = '' }: DriverExpiringBadgeProps) {
  const expiryDate = parseISO(licenseExpiryDate);
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());

  if (daysUntilExpiry < 0) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>
        Permis expiré
      </span>
    );
  }

  if (daysUntilExpiry <= 30) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ${className}`}>
        Expire dans {daysUntilExpiry}j
      </span>
    );
  }

  if (daysUntilExpiry <= 60) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${className}`}>
        Expire dans {daysUntilExpiry}j
      </span>
    );
  }

  return null;
}
