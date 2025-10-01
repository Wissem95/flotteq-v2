import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  Building2,
  CreditCard,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RevenueData {
  period: string;
  total_revenue: number;
  subscription_revenue: number;
  commission_revenue: number;
  other_revenue: number;
  growth_rate: number;
}

interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  yearly_revenue: number;
  growth_rate: number;
  average_monthly_growth: number;
  top_revenue_sources: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  revenue_by_plan: Array<{
    plan_name: string;
    revenue: number;
    subscribers: number;
  }>;
}

const FinanceRevenues: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('total');


  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Appel API réel pour les revenus
      const response = await fetch(`/api/financial/revenue?timeRange=${timeRange}`);
      const data = await response.json();
      
      setRevenueData(data.revenue_data || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
      setRevenueData([]);
      setStats(null);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données financières',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Revenus Globaux
          </h1>
          <p className="text-gray-600">Analyse financière de la plateforme FlotteQ</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 mois</SelectItem>
              <SelectItem value="6m">6 mois</SelectItem>
              <SelectItem value="12m">12 mois</SelectItem>
              <SelectItem value="24m">24 mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {formatPercentage(stats.growth_rate)} vs année précédente
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                {formatPercentage(stats.average_monthly_growth)} croissance moyenne
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus annuels</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.yearly_revenue)}</div>
              <p className="text-xs text-muted-foreground">Objectif: 1M€</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de croissance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(stats.growth_rate)}</div>
              <p className="text-xs text-muted-foreground">Objectif: +20%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Évolution des revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
            <CardDescription>Suivi mensuel par source de revenus</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k€`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="subscription_revenue" stackId="a" fill="#0088FE" name="Abonnements" />
                  <Bar dataKey="commission_revenue" stackId="a" fill="#00C49F" name="Commissions" />
                  <Bar dataKey="other_revenue" stackId="a" fill="#FFBB28" name="Autres" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Répartition des revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Sources de revenus</CardTitle>
            <CardDescription>Répartition par type de revenus</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats?.top_revenue_sources}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ source, percentage }) => `${source} ${percentage}%`}
                      >
                        {stats?.top_revenue_sources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {stats?.top_revenue_sources.map((source, index) => (
                    <div key={source.source} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="text-sm">
                        <div className="font-medium">{source.source}</div>
                        <div className="text-gray-500">{formatCurrency(source.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenus par plan */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus par plan d'abonnement</CardTitle>
          <CardDescription>Performance des différents plans tarifaires</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Revenus</TableHead>
                <TableHead>Abonnés</TableHead>
                <TableHead>Revenus par abonné</TableHead>
                <TableHead>Part des revenus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.revenue_by_plan.map((plan) => {
                const revenuePerSubscriber = plan.revenue / plan.subscribers;
                const totalRevenue = stats.revenue_by_plan.reduce((sum, p) => sum + p.revenue, 0);
                const revenueShare = (plan.revenue / totalRevenue) * 100;
                
                return (
                  <TableRow key={plan.plan_name}>
                    <TableCell>
                      <div className="font-medium">{plan.plan_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">{formatCurrency(plan.revenue)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        {plan.subscribers.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">{formatCurrency(revenuePerSubscriber)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${revenueShare}%` }}
                          />
                        </div>
                        <span className="text-sm">{revenueShare.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceRevenues;