import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import { 
  Car, TrendingUp, TrendingDown, AlertTriangle, 
  Calendar, DollarSign, Activity, Users, 
  Fuel, Wrench, Clock, MapPin
} from 'lucide-react';
import { api } from '../lib/api';

const FleetStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 text-center">
          Erreur de connexion au backend: {error}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Vérifiez que le serveur backend est démarré sur le port 8000
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  // Déterminer si on affiche les stats véhicules ou utilisateurs basé sur l'URL
  const showUserStats = window.location.pathname.includes('/users/stats');
  
  const overviewStats = showUserStats ? [
    {
      title: 'Total Utilisateurs',
      value: stats.overview?.total_users ?? 0,
      change: stats.overview?.new_users_this_month ? `+${stats.overview.new_users_this_month}` : '+0',
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      title: 'Nouveaux ce mois',
      value: stats.overview?.new_users_this_month ?? 0,
      change: '+100%',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Véhicules par utilisateur',
      value: stats.overview?.total_users ? Math.round((stats.overview?.total_vehicles ?? 0) / stats.overview.total_users * 10) / 10 : 0,
      change: 'N/A',
      icon: Car,
      color: 'bg-blue-500',
    },
  ] : [
    {
      title: 'Véhicules Actifs',
      value: stats.overview?.active_vehicles ?? 0,
      change: stats.overview?.new_vehicles_this_month ? `+${stats.overview.new_vehicles_this_month}` : '+0',
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Véhicules',
      value: stats.overview?.total_vehicles ?? 0,
      change: stats.overview?.new_vehicles_this_month ? `+${stats.overview.new_vehicles_this_month}` : '+0',
      icon: Car,
      color: 'bg-green-500',
    },
    {
      title: 'Âge Moyen',
      value: `${stats.overview?.average_vehicle_age ?? 0} ans`,
      change: 'N/A',
      icon: Clock,
      color: 'bg-purple-500',
    },
  ];

  const vehicleUsageData = [
    { status: 'Actifs', count: stats.overview?.active_vehicles ?? 0 },
    { status: 'Inactifs', count: (stats.overview?.total_vehicles ?? 0) - (stats.overview?.active_vehicles ?? 0) },
  ];

  const vehicleTypeData = Object.entries(stats.distributions?.vehicles_by_fuel ?? {}).map(([fuel, count]) => ({
    name: fuel || 'Non spécifié',
    value: count,
    color: fuel === 'essence' ? '#3B82F6' : fuel === 'diesel' ? '#10B981' : fuel === 'électrique' ? '#F59E0B' : '#EF4444'
  }));

  const StatCard = ({ title, value, change, icon: Icon, color }) => {
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <div className={`flex items-center mt-2 text-sm ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}>
              {isPositive && <TrendingUp className="w-4 h-4 mr-1" />}
              {isNegative && <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{change} ce mois</span>
            </div>
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {showUserStats ? 'Statistiques des Utilisateurs' : 'Statistiques de la Flotte'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {showUserStats 
                  ? 'Analyse des utilisateurs et de leur activité' 
                  : 'Analyse des performances et coûts de votre flotte'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
                { id: 'vehicles', label: 'Véhicules', icon: Car },
                // { id: 'users', label: 'Utilisateurs', icon: Users }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Statut des véhicules */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Statut des Véhicules
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={vehicleUsageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({status, value}) => `${status}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {vehicleUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#EF4444'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Répartition par carburant */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Répartition par Carburant
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={vehicleTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, value}) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {vehicleTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Véhicules Actifs</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{stats.overview?.active_vehicles ?? 0}</p>
                    <p className="text-sm text-blue-600">sur {stats.overview?.total_vehicles ?? 0} total</p>
                  </div>
                  {/* <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Utilisateurs</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.overview?.total_users ?? 0}</p>
                    <p className="text-sm text-green-600">utilisateurs actifs</p>
                  </div> */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Âge Moyen</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{stats.overview?.average_vehicle_age ?? 0} ans</p>
                    <p className="text-sm text-purple-600">âge moyen de la flotte</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Détails des Véhicules
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Statut des véhicules</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.distributions?.vehicles_by_status ?? {}).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center p-2 bg-white rounded">
                            <span className="text-sm text-gray-600">{status}</span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Types de carburant</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.distributions?.vehicles_by_fuel ?? {}).map(([fuel, count]) => (
                          <div key={fuel} className="flex justify-between items-center p-2 bg-white rounded">
                            <span className="text-sm text-gray-600">{fuel || 'Non spécifié'}</span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Statistiques Utilisateurs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Nouveaux utilisateurs ce mois</h4>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.overview?.new_users_this_month ?? 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">utilisateurs ajoutés</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Total utilisateurs</h4>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.overview?.total_users ?? 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">utilisateurs actifs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetStatistics;