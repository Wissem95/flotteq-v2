import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface StatusData {
  status: string;
  count: number;
  color: string;
}

interface StatusDistributionProps {
  data: StatusData[];
  isLoading?: boolean;
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({
  data,
  isLoading = false,
}) => {
  const COLORS = {
    'En service': '#10B981',
    'Hors service': '#EF4444',
    'En maintenance': '#F59E0B',
    'À inspecter': '#3B82F6',
  };

  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || '#6B7280',
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition des statuts</CardTitle>
          <CardDescription>Distribution de la flotte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            Chargement du graphique...
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-slate-600">
            <span style={{ color: data.color }}>●</span> {data.value} véhicule{data.value > 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des statuts</CardTitle>
        <CardDescription>Distribution de la flotte par statut</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;