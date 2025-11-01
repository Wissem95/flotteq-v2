import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, Calendar, MapPin, AlertTriangle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import { useTripsHistory, useMonthlyStats } from '../../hooks/useTrips';
import { TripDetailModal } from '../../components/trips/TripDetailModal';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { TripsStatsChart } from '../../components/trips/TripsStatsChart';
import { TripsMap } from '../../components/trips/TripsMap';
import { exportTripsToPDF } from '../../utils/pdf/tripsPdfExport';
import type { Trip, TripStatus } from '../../types/trip.types';

export const TripsHistoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 29));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const { data, isLoading } = useTripsHistory({
    limit: 100,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
  });

  const { data: monthlyStats } = useMonthlyStats(
    startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate ? format(endDate, 'yyyy-MM-dd') : undefined
  );

  const trips = data?.data || [];

  // Filtrer les trips
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Filtre recherche (immat, driver, véhicule)
      const matchesSearch = searchQuery === '' ||
        trip.vehicle?.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle?.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.driver?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.driver?.lastName.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre status
      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  // Stats globales
  const globalStats = useMemo(() => {
    const completed = trips.filter(t => t.status === 'completed');
    const totalKm = completed.reduce((sum, trip) => sum + (trip.distanceKm || 0), 0);
    const totalMinutes = completed.reduce((sum, trip) => sum + (trip.durationMinutes || 0), 0);
    const totalDefects = completed.reduce(
      (sum, trip) => sum + (trip.startDefects?.length || 0) + (trip.endDefects?.length || 0),
      0
    );

    return {
      totalTrips: completed.length,
      totalKm,
      totalHours: Math.round(totalMinutes / 60),
      totalDefects,
      activeTrips: trips.filter(t => t.status === 'in_progress').length,
    };
  }, [trips]);

  const getStatusBadge = (status: TripStatus) => {
    const config = {
      completed: { label: 'Terminé', class: 'bg-green-100 text-green-700' },
      in_progress: { label: 'En cours', class: 'bg-blue-100 text-blue-700' },
      cancelled: { label: 'Annulé', class: 'bg-gray-100 text-gray-700' },
    };
    const cfg = config[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.class}`}>
        {cfg.label}
      </span>
    );
  };

  const handleExportPDF = () => {
    exportTripsToPDF({
      trips: filteredTrips,
      totalKm: globalStats.totalKm,
      totalTrips: globalStats.totalTrips,
      totalHours: globalStats.totalHours,
      filters: {
        startDate,
        endDate,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      },
    });
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Trajets</h1>
          <p className="text-gray-600">Vue globale des trajets de tous les conducteurs</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/trips-reports"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Rapports</span>
          </Link>
          <button
            onClick={handleExportPDF}
            disabled={filteredTrips.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total missions</p>
          <p className="text-2xl font-bold text-gray-900">{globalStats.totalTrips}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">En cours</p>
          <p className="text-2xl font-bold text-blue-600">{globalStats.activeTrips}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Distance totale</p>
          <p className="text-2xl font-bold text-purple-600">
            {globalStats.totalKm.toLocaleString()} km
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Temps total</p>
          <p className="text-2xl font-bold text-green-600">{globalStats.totalHours}h</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Défauts</p>
          <p className="text-2xl font-bold text-orange-600">{globalStats.totalDefects}</p>
        </div>
      </div>

      {/* Charts & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution sur la période</h3>
          <TripsStatsChart data={monthlyStats || []} type="line" />
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Carte des trajets</h3>
          <TripsMap trips={filteredTrips.filter(t => t.status === 'completed')} height={320} />
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Date Range Picker */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

        {/* Autres filtres */}
        <div className="flex items-center gap-4 flex-wrap pt-4 border-t border-gray-200">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par conducteur, immatriculation..."
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">Tous les status</option>
              <option value="completed">Terminés</option>
              <option value="in_progress">En cours</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun trajet trouvé</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Aucun trajet n\'a encore été enregistré'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conducteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Défauts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.map((trip) => {
                  const startDate = new Date(trip.startedAt);
                  const defectsCount = (trip.startDefects?.length || 0) + (trip.endDefects?.length || 0);

                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {startDate.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {trip.driver?.firstName} {trip.driver?.lastName}
                          </p>
                          <p className="text-gray-500 text-xs">{trip.driver?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{trip.vehicle?.registration}</p>
                          <p className="text-gray-500 text-xs">
                            {trip.vehicle?.brand} {trip.vehicle?.model}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.distanceKm ? `${trip.distanceKm.toLocaleString()} km` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.durationMinutes
                          ? `${Math.floor(trip.durationMinutes / 60)}h${(trip.durationMinutes % 60)
                              .toString()
                              .padStart(2, '0')}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(trip.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {defectsCount > 0 ? (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">{defectsCount}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrip(trip);
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Voir</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}
    </div>
  );
};
