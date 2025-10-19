import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useWeeklyRevenue } from '../../hooks/useCommissions';
import { TrendingUp } from 'lucide-react';

export default function RevenueChart() {
  const { data, isLoading, error } = useWeeklyRevenue();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution du chiffre d'affaires</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution du chiffre d'affaires</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution du chiffre d'affaires</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">Pas encore de revenus enregistrés</p>
        </div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, week) => sum + week.amount, 0);
  const avgWeekly = totalRevenue / data.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Évolution du chiffre d'affaires</h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="text-sm font-semibold text-gray-600">4 dernières semaines</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}€`, 'Revenus']}
            labelStyle={{ color: '#111827' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar
            dataKey="amount"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Total (4 semaines)</p>
          <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Moyenne / semaine</p>
          <p className="text-2xl font-bold text-gray-900">{avgWeekly.toFixed(2)}€</p>
        </div>
      </div>
    </div>
  );
}
