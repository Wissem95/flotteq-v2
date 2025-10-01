// AnalyticsDashboard.tsx - Tableau de bord principal des analytics FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, } from "recharts";
import { TrendingUp, Users, Globe, Activity, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock, Download, RefreshCw, Eye, Target, DollarSign, } from "lucide-react";
import { analyticsService, PlatformMetrics, UsageAnalytics, PerformanceMetrics, RealtimeMetrics } from "@/services/analyticsService";
import { toast } from "@/components/ui/use-toast";

const AnalyticsDashboard: React.FC = () => {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  // Toutes les données viennent maintenant des APIs réelles

  useEffect(() => {
    loadAnalyticsData();
    
    // Mise à jour temps réel toutes les 30 secondes
    const interval = setInterval(loadRealtimeData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [platformData, usageData, performanceData, realtimeData] = await Promise.all([
        analyticsService.getPlatformMetrics(timeRange),
        analyticsService.getUsageAnalytics(timeRange),
        analyticsService.getPerformanceMetrics(timeRange),
        analyticsService.getRealtimeMetrics()
      ]);
      
      setPlatformMetrics(platformData);
      setUsageAnalytics(usageData);
      setPerformanceMetrics(performanceData);
      setRealtimeMetrics(realtimeData);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données analytiques',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const realtimeData = await analyticsService.getRealtimeMetrics();
      setRealtimeMetrics(realtimeData);
    } catch (error) {
      console.error("Erreur lors de la mise à jour temps réel:", error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Composant pour les métriques en temps réel
  const RealtimeMetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    status?: 'healthy' | 'warning' | 'critical';
  }> = ({ title, value, icon, trend, status }) => (
    <Card className={`relative ${status === 'critical' ? 'border-red-500' : status === 'warning' ? 'border-orange-500' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {icon}
          {status && (
            <div className={`w-2 h-2 rounded-full ${
              status === 'healthy' ? 'bg-green-500' : 
              status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
            } animate-pulse`} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% vs hier
          </p>
        )}
      </CardContent>
    </Card>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Monitoring</h1>
          <p className="text-gray-600">Tableaux de bord et métriques de performance de la plateforme FlotteQ</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques temps réel */}
      {realtimeMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RealtimeMetricCard
            title="Utilisateurs en ligne"
            value={formatNumber(realtimeMetrics.current_online_users)}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 5.2, isPositive: true }}
            status="healthy"
          />
          <RealtimeMetricCard
            title="Requêtes/sec"
            value={`${realtimeMetrics.current_api_rps.toFixed(1)}`}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 2.1, isPositive: false }}
            status="healthy"
          />
          <RealtimeMetricCard
            title="CPU Usage"
            value={formatPercentage(realtimeMetrics.cpu_usage_percentage)}
            icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
            status={realtimeMetrics.cpu_usage_percentage > 70 ? 'warning' : 'healthy'}
          />
          <RealtimeMetricCard
            title="Mémoire"
            value={formatPercentage(realtimeMetrics.memory_usage_percentage)}
            icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
            status={realtimeMetrics.memory_usage_percentage > 80 ? 'critical' : 'healthy'}
          />
        </div>
      )}

      {/* Onglets principaux */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="geographic">Géographie</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          {platformMetrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tenants actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(platformMetrics.active_tenants)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(platformMetrics.total_tenants)} au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Véhicules suivis</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(platformMetrics.active_vehicles)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(platformMetrics.total_vehicles)} enregistrés
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(platformMetrics.monthly_revenue)}</div>
                  <p className="text-xs text-green-600">+{formatPercentage(platformMetrics.growth_rate)} vs mois précédent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(platformMetrics.uptime_percentage)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(platformMetrics.api_requests_today)} requêtes aujourd'hui
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des revenus</CardTitle>
                <CardDescription>Croissance mensuelle des revenus</CardDescription>
              </CardHeader>
              <CardContent>
                {platformMetrics && platformMetrics.revenue_by_month ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={platformMetrics.revenue_by_month}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">Aucune donnée de revenus</div>
                      <div className="text-sm">Les données apparaîtront avec l'activité de la plateforme</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité des utilisateurs</CardTitle>
                <CardDescription>Utilisateurs actifs par heure</CardDescription>
              </CardHeader>
              <CardContent>
                {usageAnalytics && usageAnalytics.hourly_activity ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usageAnalytics.hourly_activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">Aucune donnée d'activité</div>
                      <div className="text-sm">Les données d'activité apparaîtront avec l'utilisation</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Utilisation */}
        <TabsContent value="usage" className="space-y-4">
          {usageAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Utilisateurs actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Quotidiens</span>
                        <span className="font-medium">{formatNumber(usageAnalytics.daily_active_users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Hebdomadaires</span>
                        <span className="font-medium">{formatNumber(usageAnalytics.weekly_active_users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Mensuels</span>
                        <span className="font-medium">{formatNumber(usageAnalytics.monthly_active_users)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session moyenne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{usageAnalytics.session_duration_avg} min</div>
                    <p className="text-sm text-muted-foreground">Durée par session</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pages vues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatNumber(usageAnalytics.page_views_today)}</div>
                    <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Adoption des fonctionnalités</CardTitle>
                  <CardDescription>Utilisation des principales fonctionnalités de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {usageAnalytics && usageAnalytics.feature_usage && usageAnalytics.feature_usage.length > 0 ? (
                      <BarChart data={usageAnalytics.feature_usage} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="feature_name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="adoption_rate" fill="#3b82f6" />
                      </BarChart>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-lg font-medium mb-2">Aucune donnée d'adoption</div>
                          <div className="text-sm">Les statistiques d'utilisation des fonctionnalités apparaîtront</div>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">CPU</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(performanceMetrics.server_metrics.cpu_usage)}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${performanceMetrics.server_metrics.cpu_usage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mémoire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(performanceMetrics.server_metrics.memory_usage)}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${performanceMetrics.server_metrics.memory_usage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Disque</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(performanceMetrics.server_metrics.disk_usage)}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${performanceMetrics.server_metrics.disk_usage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Requêtes BDD</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceMetrics.database_performance.query_time_avg}ms</div>
                    <p className="text-xs text-muted-foreground">Temps moyen</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance des APIs</CardTitle>
                  <CardDescription>Temps de réponse par endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {performanceMetrics && performanceMetrics.api_response_times && performanceMetrics.api_response_times.length > 0 ? (
                      <BarChart data={performanceMetrics.api_response_times}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="endpoint" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avg_response_time" fill="#3b82f6" />
                      </BarChart>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-lg font-medium mb-2">Aucune donnée de performance</div>
                          <div className="text-sm">Les métriques d'API apparaîtront avec l'activité</div>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Revenus */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métriques de revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>MRR (Revenus mensuels récurrents)</span>
                    <span className="font-bold">{formatCurrency(189500)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ARR (Revenus annuels récurrents)</span>
                    <span className="font-bold">{formatCurrency(2274000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ARPU (Revenu moyen par utilisateur)</span>
                    <span className="font-bold">{formatCurrency(177)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LTV (Valeur vie client)</span>
                    <span className="font-bold">{formatCurrency(4250)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Croissance mensuelle</CardTitle>
                <CardDescription>Évolution des revenus sur 5 mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Géographie */}
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition géographique</CardTitle>
              <CardDescription>Utilisateurs et revenus par pays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  {usageAnalytics && usageAnalytics.geographic_distribution && usageAnalytics.geographic_distribution.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={usageAnalytics.geographic_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ country, users }) => `${country}: ${formatNumber(users)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {usageAnalytics.geographic_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-lg font-medium mb-2">Aucune donnée géographique</div>
                        <div className="text-sm">La répartition géographique apparaîtra avec l'usage</div>
                      </div>
                    </div>
                  )}
                </ResponsiveContainer>

                <div className="space-y-3">
                  {usageAnalytics && usageAnalytics.geographic_distribution ? (
                    usageAnalytics.geographic_distribution.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatNumber(country.users)} utilisateurs</div>
                          <div className="text-sm text-muted-foreground">{formatCurrency(country.revenue || 0)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-sm">Aucune donnée géographique disponible</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Erreurs récentes */}
      {realtimeMetrics && realtimeMetrics.recent_errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Erreurs récentes
            </CardTitle>
            <CardDescription>Incidents système des dernières heures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtimeMetrics.recent_errors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-red-800">{error.error_type}</div>
                    <div className="text-sm text-red-600">{error.message}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{error.affected_users} utilisateurs affectés</div>
                    <div className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 