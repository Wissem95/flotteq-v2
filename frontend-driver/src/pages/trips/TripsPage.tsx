import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import { useTripHistory } from '../../hooks/useTrips';
import { TripDetailCard } from '../../components/trips/TripDetailCard';
import type { TripStatus } from '../../types/trip.types';

export const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useTripHistory({ limit: 100 });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');

  const trips = data?.data || [];

  // Filtrer les trips
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Filtre recherche
      const matchesSearch = searchQuery === '' ||
        trip.vehicle?.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle?.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre status
      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  // Calculer les stats globales
  const globalStats = useMemo(() => {
    const completed = trips.filter(t => t.status === 'completed');
    const totalKm = completed.reduce((sum, trip) => sum + (trip.distanceKm || 0), 0);
    const totalMinutes = completed.reduce((sum, trip) => sum + (trip.durationMinutes || 0), 0);

    return {
      totalTrips: completed.length,
      totalKm,
      totalHours: Math.round(totalMinutes / 60),
    };
  }, [trips]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Mes Trajets</h1>
              <p className="text-sm text-gray-600">{filteredTrips.length} résultat(s)</p>
            </div>
          </div>

          {/* Stats globales */}
          {globalStats.totalTrips > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">Missions</p>
                <p className="text-xl font-bold text-blue-900">{globalStats.totalTrips}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 mb-1">Distance totale</p>
                <p className="text-xl font-bold text-purple-900">
                  {globalStats.totalKm.toLocaleString()} km
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Temps total</p>
                <p className="text-xl font-bold text-green-900">{globalStats.totalHours}h</p>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="space-y-3">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par immatriculation, marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Filtre status */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TripStatus | 'all')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">Tous les status</option>
                <option value="completed">Terminés</option>
                <option value="in_progress">En cours</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucun résultat'
                : 'Aucune mission'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Vous n\'avez pas encore complété de mission'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripDetailCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
