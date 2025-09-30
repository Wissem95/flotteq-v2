import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Euro, 
  FileText, 
  Wrench, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { financesService, FinancialOverview, MonthlyData, ExpenseBreakdown, TopExpensiveVehicle, MaintenanceStats, ExpenseHistoryItem, FinancialAlert } from "@/services/financesService";
import { toast } from "@/hooks/use-toast";

// Utilitaires sécurisés
import { safeArray, safeLength, safeNumber } from "@/utils/safeData";

const FinancialStatusDashboard: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown | null>(null);
  const [topVehicles, setTopVehicles] = useState<TopExpensiveVehicle[]>([]);
  const [maintenanceStats, setMaintenanceStats] = useState<MaintenanceStats | null>(null);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseHistoryItem[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      
      const [
        overviewData,
        monthlyChartData,
        breakdownData,
        topVehiclesData,
        maintenanceStatsData,
        historyData,
        alertsData
      ] = await Promise.all([
        financesService.getOverview(),
        financesService.getMonthlyChart(),
        financesService.getExpenseBreakdown(),
        financesService.getTopExpensiveVehicles(),
        financesService.getMaintenanceStats(),
        financesService.getExpenseHistory(1, 5),
        financesService.getFinancialAlerts(),
      ]);

      setOverview(overviewData);
      setMonthlyData(safeArray(monthlyChartData.monthly_data));
      setExpenseBreakdown(breakdownData);
      setTopVehicles(safeArray(topVehiclesData.top_vehicles));
      setMaintenanceStats(maintenanceStatsData);
      setExpenseHistory(safeArray(historyData.expenses));
      setAlerts(safeArray(alertsData.alerts));
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données financières",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getEvolutionIcon = (percentage: number) => {
    if (percentage > 0) {
      return <ArrowUpRight className="ml-1 text-red-500" size={16} />;
    } else if (percentage < 0) {
      return <ArrowDownRight className="ml-1 text-green-500" size={16} />;
    }
    return null;
  };

  const getEvolutionColor = (percentage: number) => {
    if (percentage > 0) return "text-red-500";
    if (percentage < 0) return "text-green-500";
    return "text-slate-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">État financier</h1>
        <p className="text-gray-600 mt-2">Coûts, dépenses et analyse financière de votre flotte</p>
      </div>

      {/* Alertes financières */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              alert.severity === 'error' ? 'border-red-200 bg-red-50' :
              alert.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{alert.message}</h4>
                  <p className="text-sm text-slate-600 mt-1">{alert.details}</p>
                </div>
                <Badge variant={alert.severity === 'error' ? 'destructive' : 'secondary'}>
                  {alert.severity === 'error' ? 'Critique' : 
                   alert.severity === 'warning' ? 'Attention' : 'Info'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Euro className="mr-2 text-green-600" size={20} />
              Coût mensuel
            </CardTitle>
            <CardDescription>Mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(overview?.monthly_metrics.current_month_cost || 0)}
            </div>
            <div className={`mt-2 text-sm flex items-center ${getEvolutionColor(overview?.monthly_metrics.evolution_percentage || 0)}`}>
              {overview?.monthly_metrics.evolution_percentage !== undefined && (
                <>
                  {Math.abs(overview.monthly_metrics.evolution_percentage)}%
                  {getEvolutionIcon(overview.monthly_metrics.evolution_percentage)}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 text-amber-600" size={20} />
              Factures en attente
            </CardTitle>
            <CardDescription>À traiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview?.monthly_metrics.pending_invoices || 0}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-amber-500 font-medium">En attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wrench className="mr-2 text-blue-600" size={20} />
              Entretien moyen
            </CardTitle>
            <CardDescription>Par intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(overview?.monthly_metrics.average_maintenance_cost || 0)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-blue-500 font-medium">Moyenne</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 text-purple-600" size={20} />
              Évolution
            </CardTitle>
            <CardDescription>vs mois précédent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getEvolutionColor(overview?.monthly_metrics.evolution_percentage || 0)}`}>
              {overview?.monthly_metrics.evolution_percentage !== undefined && (
                <>
                  {overview.monthly_metrics.evolution_percentage > 0 ? '+' : ''}
                  {overview.monthly_metrics.evolution_percentage}%
                </>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-purple-500 font-medium">
                {(overview?.monthly_metrics.evolution_percentage || 0) > 0 ? 'Hausse' : 
                 (overview?.monthly_metrics.evolution_percentage || 0) < 0 ? 'Baisse' : 'Stable'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble financière */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble financière</CardTitle>
          <CardDescription>Cumul et moyennes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(overview?.cumulated_overview.total_cost || 0)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Coût cumulé total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overview?.cumulated_overview.total_maintenances || 0}
              </div>
              <div className="text-sm text-slate-500 mt-1">Entretiens effectués</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(overview?.cumulated_overview.total_repairs_cost || 0)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Total réparations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(overview?.cumulated_overview.monthly_average || 0)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Moyenne mensuelle</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(overview?.cumulated_overview.highest_cost.cost || 0)}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Coût le plus élevé ({overview?.cumulated_overview.highest_cost.type})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des dépenses mensuelles */}
        <Card>
          <CardHeader>
            <CardTitle>Dépenses mensuelles</CardTitle>
            <CardDescription>Évolution sur 12 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(-2)}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Coût']}
                    labelFormatter={(label) => {
                      const monthData = monthlyData.find(d => d.month === label);
                      return monthData?.month_name || label;
                    }}
                  />
                  <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition des dépenses */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des dépenses</CardTitle>
            <CardDescription>Par type de dépense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown?.breakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {expenseBreakdown?.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name, props) => [
                      formatCurrency(value),
                      `${props.payload.type} (${props.payload.percentage}%)`
                    ]}
                  />
                  <Legend 
                    formatter={(value, entry) => `${entry?.payload?.type} (${entry?.payload?.percentage}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 véhicules les plus coûteux et Statistiques d'entretien */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 3 véhicules les plus coûteux</CardTitle>
            <CardDescription>Classement par coût total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="flex items-center p-3 rounded-lg border border-slate-100">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium">{vehicle.marque} {vehicle.modele}</p>
                    <p className="text-sm text-slate-500">
                      {vehicle.immatriculation} • {vehicle.interventions_count} intervention{vehicle.interventions_count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(vehicle.total_cost)}</p>
                  </div>
                </div>
              ))}
              {topVehicles.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques d'entretien</CardTitle>
            <CardDescription>Résumé des interventions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {maintenanceStats?.monthly_maintenances || 0}
                </div>
                <div className="text-sm text-slate-600 mt-1">Entretiens du mois</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {maintenanceStats?.yearly_maintenances || 0}
                </div>
                <div className="text-sm text-slate-600 mt-1">Entretiens de l'année</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">
                  {maintenanceStats?.average_per_vehicle || 0}
                </div>
                <div className="text-sm text-slate-600 mt-1">Moyenne par véhicule</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(maintenanceStats?.most_expensive_this_month || 0)}
                </div>
                <div className="text-sm text-slate-600 mt-1">Plus cher du mois</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des dépenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Historique des dépenses</CardTitle>
            <CardDescription>Dernières transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2" size={16} />
            Exporter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Véhicule</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Montant</th>
                  <th className="text-left py-2">Facture</th>
                </tr>
              </thead>
              <tbody>
                {expenseHistory.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-slate-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{expense.vehicle}</p>
                        <p className="text-sm text-slate-500">{expense.plate}</p>
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3">
                      <Badge variant="secondary" className="text-xs">
                        {expense.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 text-sm">
                      {expense.invoice_number || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenseHistory.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Aucune dépense enregistrée
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialStatusDashboard;