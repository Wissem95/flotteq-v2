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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Calculator,
  Building2,
  Users,
  Target,
  Filter,
  RefreshCw,
  Mail,
  Printer,
  Eye,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FinancialReport {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period: string;
  generated_at: string;
  status: 'generating' | 'ready' | 'error';
  file_size?: string;
  download_url?: string;
}

interface ReportData {
  revenue_summary: {
    total_revenue: number;
    subscription_revenue: number;
    commission_revenue: number;
    other_revenue: number;
    growth_rate: number;
  };
  expense_summary: {
    total_expenses: number;
    operational_expenses: number;
    marketing_expenses: number;
    technical_expenses: number;
  };
  profit_loss: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
    ebitda: number;
  };
  key_metrics: {
    arr: number; // Annual Recurring Revenue
    mrr: number; // Monthly Recurring Revenue
    ltv: number; // Lifetime Value
    cac: number; // Customer Acquisition Cost
    churn_rate: number;
  };
}

const FinanceReports: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [reportType, setReportType] = useState('summary');


  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [reportsResponse, dataResponse] = await Promise.all([
        fetch('/api/financial/reports'),
        fetch(`/api/financial/reports/data?period=${selectedPeriod}`)
      ]);
      
      const reportsData = await reportsResponse.json();
      const reportData = await dataResponse.json();
      
      setReports(reportsData.data || []);
      setReportData(reportData);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      setReports([]);
      setReportData(null);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les rapports financiers',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Prêt</Badge>;
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Génération...</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: 'Génération en cours',
      description: 'Le rapport est en cours de génération. Vous recevrez une notification.',
    });
  };

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: 'Téléchargement',
      description: 'Le téléchargement du rapport a commencé.',
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Données pour les graphiques
  const revenueData = reportData ? [
    { name: 'Abonnements', value: reportData.revenue_summary.subscription_revenue },
    { name: 'Commissions', value: reportData.revenue_summary.commission_revenue },
    { name: 'Autres', value: reportData.revenue_summary.other_revenue },
  ] : [];

  const expenseData = reportData ? [
    { name: 'Opérationnel', value: reportData.expense_summary.operational_expenses },
    { name: 'Marketing', value: reportData.expense_summary.marketing_expenses },
    { name: 'Technique', value: reportData.expense_summary.technical_expenses },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Rapports Financiers
          </h1>
          <p className="text-gray-600">Rapports comptables et exports financiers</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mois actuel</SelectItem>
              <SelectItem value="last_month">Mois dernier</SelectItem>
              <SelectItem value="current_quarter">Trimestre actuel</SelectItem>
              <SelectItem value="last_quarter">Trimestre dernier</SelectItem>
              <SelectItem value="current_year">Année actuelle</SelectItem>
              <SelectItem value="last_year">Année dernière</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Générer rapport
          </Button>
        </div>
      </div>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Résumé</TabsTrigger>
          <TabsTrigger value="detailed">Détaillé</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* KPIs principaux */}
          {reportData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(reportData.revenue_summary.total_revenue)}</div>
                  <div className="text-sm text-green-600">
                    {formatPercentage(reportData.revenue_summary.growth_rate)} vs mois dernier
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.profit_loss.net_profit)}</div>
                  <div className="text-sm text-muted-foreground">
                    Marge: {reportData.profit_loss.profit_margin.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ARR</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(reportData.key_metrics.arr)}</div>
                  <div className="text-sm text-muted-foreground">
                    MRR: {formatCurrency(reportData.key_metrics.mrr)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">LTV / CAC</CardTitle>
                  <Calculator className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(reportData.key_metrics.ltv / reportData.key_metrics.cac).toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">
                    LTV: {formatCurrency(reportData.key_metrics.ltv)} | CAC: {formatCurrency(reportData.key_metrics.cac)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Graphiques */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des revenus</CardTitle>
                <CardDescription>Sources de revenus par type</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={revenueData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
                <CardDescription>Dépenses par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value / 1000}k€`} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                      <Bar dataKey="value" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse détaillée</CardTitle>
              <CardDescription>Rapport financier complet avec métriques avancées</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Revenus détaillés */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Revenus</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Abonnements</span>
                        <span className="font-mono">{formatCurrency(reportData.revenue_summary.subscription_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commissions</span>
                        <span className="font-mono">{formatCurrency(reportData.revenue_summary.commission_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Autres revenus</span>
                        <span className="font-mono">{formatCurrency(reportData.revenue_summary.other_revenue)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total revenus</span>
                        <span className="font-mono">{formatCurrency(reportData.revenue_summary.total_revenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dépenses détaillées */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dépenses</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Opérationnel</span>
                        <span className="font-mono">{formatCurrency(reportData.expense_summary.operational_expenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing</span>
                        <span className="font-mono">{formatCurrency(reportData.expense_summary.marketing_expenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technique</span>
                        <span className="font-mono">{formatCurrency(reportData.expense_summary.technical_expenses)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total dépenses</span>
                        <span className="font-mono">{formatCurrency(reportData.expense_summary.total_expenses)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit & Loss */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-medium">Profit & Loss</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.profit_loss.gross_profit)}</div>
                        <div className="text-sm text-muted-foreground">Bénéfice brut</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.profit_loss.net_profit)}</div>
                        <div className="text-sm text-muted-foreground">Bénéfice net</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{reportData.profit_loss.profit_margin.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Marge bénéficiaire</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(reportData.profit_loss.ebitda)}</div>
                        <div className="text-sm text-muted-foreground">EBITDA</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des rapports</CardTitle>
              <CardDescription>Liste des rapports générés et téléchargeables</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du rapport</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Généré le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>{formatDate(report.generated_at)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.file_size || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {report.status === 'ready' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(report.id)}
                                className="flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Voir
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceReports;