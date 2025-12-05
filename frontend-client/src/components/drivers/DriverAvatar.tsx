interface DriverAvatarProps {
  photoUrl?: string | null;
  photoThumbnail?: string | null;
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
};

export default function DriverAvatar({
  photoUrl,
  photoThumbnail,
  firstName,
  lastName,
  size = 'md',
  className = '',
}: DriverAvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`;

  // Utiliser thumbnail pour petites tailles, photoUrl pour grandes
  const imageUrl = size === 'sm' || size === 'md'
    ? photoThumbnail || photoUrl
    : photoUrl || photoThumbnail;

  const fullImageUrl = imageUrl
    ? `${import.meta.env.VITE_API_BASE}${imageUrl}`
    : null;

  if (fullImageUrl) {
    return (
      <img
        src={fullImageUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-flotteq-blue text-white flex items-center justify-center font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}
