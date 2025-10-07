import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardService } from '@/api/services/dashboard.service';
import type { CostAnalysis } from '@/types/dashboard.types';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FormattedData {
  month: string;
  monthLabel: string;
  cost: number;
  count: number;
}

export default function CostsChart() {
  const [data, setData] = useState<FormattedData[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getCosts();
      setCostAnalysis(response);

      // Format data for chart
      const formatted = response.monthlyMaintenanceCosts.map(item => {
        const date = parse(item.month, 'yyyy-MM', new Date());
        return {
          ...item,
          monthLabel: format(date, 'MMM yyyy', { locale: fr }),
        };
      });

      setData(formatted);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coûts de maintenance</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coûts de maintenance</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coûts de maintenance</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">Pas encore de données de maintenance</p>
        </div>
      </div>
    );
  }

  const currentMonthTotal = costAnalysis?.currentMonthTotal || 0;
  const lastMonthTotal = costAnalysis?.lastMonthTotal || 0;
  const difference = currentMonthTotal - lastMonthTotal;
  const percentageChange = lastMonthTotal > 0
    ? Math.abs((difference / lastMonthTotal) * 100)
    : 0;
  const isIncrease = difference > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Coûts de maintenance</h2>
        {costAnalysis && (
          <div className="flex items-center gap-2">
            {isIncrease ? (
              <TrendingUp className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-500" />
            )}
            <span className={`text-sm font-semibold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
              {isIncrease ? '+' : '-'}{percentageChange.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}€`, 'Coût']}
            labelStyle={{ color: '#111827' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Mois dernier</p>
          <p className="text-2xl font-bold text-gray-900">{lastMonthTotal.toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Mois actuel</p>
          <p className="text-2xl font-bold text-gray-900">{currentMonthTotal.toFixed(2)}€</p>
        </div>
      </div>

      {costAnalysis && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Coût total:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {costAnalysis.totalMaintenanceCost.toFixed(2)}€
              </span>
            </div>
            <div>
              <span className="text-gray-500">Moyenne/véhicule:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {costAnalysis.avgMaintenanceCostPerVehicle.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
