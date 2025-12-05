import { Eye, Car, User, Clock, Gauge, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Trip, TripStatus } from '@/types/trip.types';
import { Badge } from '@/components/ui/badge';

interface TripMobileCardProps {
  trip: Trip;
  onView?: (trip: Trip) => void;
}

export function TripMobileCard({ trip, onView }: TripMobileCardProps) {
  const getStatusBadge = (status: TripStatus) => {
    const config = {
      completed: { label: 'Terminé', className: 'bg-green-100 text-green-700' },
      in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
      cancelled: { label: 'Annulé', className: 'bg-gray-100 text-gray-700' },
    };
    const badge = config[status];
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const totalDefects = (trip.startDefects?.length || 0) + (trip.endDefects?.length || 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Car className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-base">
              {trip.vehicle?.registration}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {trip.vehicle?.brand} {trip.vehicle?.model}
          </p>
        </div>
        {getStatusBadge(trip.status)}
      </div>

      {/* Driver */}
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-gray-400" />
        <span className="text-gray-700">
          {trip.driver?.firstName} {trip.driver?.lastName}
        </span>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-gray-700">
          {format(new Date(trip.startedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
          {trip.endedAt && ` → ${format(new Date(trip.endedAt), 'HH:mm')}`}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div>
          <p className="text-xs text-gray-500 mb-1">Distance</p>
          <p className="text-sm font-semibold text-gray-900">
            {trip.distanceKm ? `${trip.distanceKm} km` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Durée</p>
          <p className="text-sm font-semibold text-gray-900">
            {trip.durationMinutes
              ? `${Math.floor(trip.durationMinutes / 60)}h${trip.durationMinutes % 60}m`
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">KM Début → Fin</p>
          <p className="text-sm font-semibold text-gray-900">
            {trip.startKm} → {trip.endKm || '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Carburant</p>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            {trip.startFuelLevel}% → {trip.endFuelLevel || '-'}%
          </p>
        </div>
      </div>

      {/* Defects Warning */}
      {totalDefects > 0 && (
        <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-xs font-medium text-orange-700">
            {totalDefects} défaut{totalDefects > 1 ? 's' : ''} signalé{totalDefects > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      {onView && (
        <button
          onClick={() => onView(trip)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          Voir les détails
        </button>
      )}
    </div>
  );
}
