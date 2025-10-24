import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { CommissionEvolution } from '@/api/types/commission.types';

interface CommissionsChartProps {
  data: CommissionEvolution[];
}

export const CommissionsChart = ({ data }: CommissionsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Évolution Commissions vs CA (12 derniers mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => `€${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="commissions"
              stroke="#2463b0"
              strokeWidth={3}
              name="Commissions"
              dot={{ fill: '#2463b0', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#14b8a6"
              strokeWidth={3}
              name="CA Total"
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
