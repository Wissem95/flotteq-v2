import { useQuery } from '@tanstack/react-query';
import { vehiclesService } from '../../api/services/vehicles.service';

interface VehiclePhotosProps {
  vehicleId: string;
}

export default function VehiclePhotos({ vehicleId }: VehiclePhotosProps) {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesService.getVehicleById(vehicleId),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  const photos = vehicle?.photos || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos du véhicule</h3>

      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucune photo disponible</p>
          <p className="mt-1 text-xs text-gray-400">
            Fonctionnalité d'upload à venir (nécessite react-dropzone)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
