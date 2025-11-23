import React, { useState } from 'react';
import { subMonths, format } from 'date-fns';
import { BarChart3, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { TripsStatsChart } from '../../components/trips/TripsStatsChart';
import { useMonthlyStats, useDriversPerformance } from '../../hooks/useTrips';

export const TripsReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const { data: monthlyStats, isLoading: loadingMonthly } = useMonthlyStats(
    startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate ? format(endDate, 'yyyy-MM-dd') : undefined
  );

  const { data: driversPerformance, isLoading: loadingDrivers } = useDriversPerformance(
    startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate ? format(endDate, 'yyyy-MM-dd') : undefined
  );

  const isLoading = loadingMonthly || loadingDrivers;

  // Calculate summary stats
  const summaryStats = monthlyStats?.reduce(
    (acc, month) => ({
      totalTrips: acc.totalTrips + month.tripCount,
      totalKm: acc.totalKm + month.totalKm,
    }),
    { totalTrips: 0, totalKm: 0 }
  ) || { totalTrips: 0, totalKm: 0 };

  const avgKmPerTrip = summaryStats.totalTrips > 0
    ? Math.round(summaryStats.totalKm / summaryStats.totalTrips)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports & Statistiques</h1>
          <p className="text-gray-600">Analyses détaillées des trajets et performances</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => window.print()}
        >
          <Download className="w-5 h-5" />
          <span>Exporter</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Trajets</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{summaryStats.totalTrips}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Distance Totale</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {summaryStats.totalKm.toLocaleString()} <span className="text-lg text-gray-600">km</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Heures Totales</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            - <span className="text-lg text-gray-600">h</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Moy. km/trajet</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {avgKmPerTrip} <span className="text-lg text-gray-600">km</span>
          </p>
        </div>
      </div>

      {/* Monthly Stats Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Évolution Mensuelle</h2>
            <p className="text-sm text-gray-600">Distance, trajets et heures par mois</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Courbe
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Barres
            </button>
          </div>
        </div>
        <TripsStatsChart data={monthlyStats || []} type={chartType} />
      </div>

      {/* Drivers Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Performance des Conducteurs</h2>
            <p className="text-sm text-gray-600">Statistiques détaillées par conducteur</p>
          </div>
        </div>

        {!driversPerformance || driversPerformance.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune donnée de performance disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conducteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trajets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moy. km/trajet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Défauts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driversPerformance
                  .sort((a, b) => b.totalKm - a.totalKm)
                  .map((driver) => (
                    <tr key={driver.driverId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{driver.driverName}</p>
                          <p className="text-sm text-gray-500">ID: {driver.driverId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.tripCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {driver.totalKm.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.avgKmPerTrip} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {driver.totalDefects > 0 ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            {driver.totalDefects} défauts
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Aucun défaut
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
