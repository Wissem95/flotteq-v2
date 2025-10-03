import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MRRChartProps {
  data: Array<{
    month: string;
    mrr: number;
    newMrr: number;
    churnedMrr: number;
  }>;
}

export const MRRChart = ({ data }: MRRChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Évolution MRR (12 derniers mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2463b0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2463b0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`€${value.toFixed(2)}`, 'MRR']}
              labelFormatter={(label) => `Mois: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="#2463b0"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMrr)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
