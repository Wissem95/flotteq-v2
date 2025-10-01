// SubscriptionsOverview.tsx - Vue d'ensemble de la gestion des abonnements FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, CreditCard, TrendingUp, Users, DollarSign, Calendar, MoreHorizontal, Eye, Edit, Ban, Play, X, Download, Mail, AlertTriangle, CheckCircle, Clock, Building2, } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, } from "recharts";
import { subscriptionsService, Subscription, SubscriptionFilters, SubscriptionStats } from "@/services/subscriptionsService";
import { toast } from "@/components/ui/use-toast";
import CreatePlanModal from "@/components/subscriptions/CreatePlanModal";
import CreateSubscriptionModal from "@/components/subscriptions/CreateSubscriptionModal";

const SubscriptionsOverview: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<SubscriptionFilters>({});
  const [loading, setLoading] = useState(true);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);


  useEffect(() => {
    loadData();
  }, [filters, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les abonnements avec filtres
      const searchFilters = {
        ...filters,
        search: searchTerm || undefined,
      };
      
      const [subscriptionsResponse, statsResponse] = await Promise.all([
        subscriptionsService.getSubscriptions(1, 50, searchFilters),
        subscriptionsService.getStats()
      ]);
      
      setSubscriptions(subscriptionsResponse.data || []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des abonnements',
        variant: 'destructive',
      });
      setSubscriptions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, isTrial: boolean) => {
    if (isTrial) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Essai</Badge>;
    }
    
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Suspendu</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      case "expired":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expiré</Badge>;
      default:
        return <Badge variant="secondary">Inactif</Badge>;
    }
  };

  const formatPrice = (price: number, currency = "EUR") => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  // Composant pour les métriques
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    description?: string;
  }> = ({ title, value, icon, trend, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% vs mois précédent
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des abonnements</h1>
          <p className="text-gray-600">Gérez les abonnements et la facturation des tenants FlotteQ</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowCreatePlanModal(true)}
          >
            <CreditCard className="w-4 h-4" />
            Créer un plan
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowCreateSubscriptionModal(true)}
          >
            <Plus className="w-4 h-4" />
            Nouvel abonnement
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Abonnements actifs"
            value={stats.active_subscriptions.toLocaleString()}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 8.7, isPositive: true }}
            description={`${stats.trial_subscriptions} en essai`}
          />
          <MetricCard
            title="Revenus mensuels"
            value={formatPrice(stats.monthly_revenue)}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="ARPU"
            value={formatPrice(stats.average_revenue_per_user || (stats.monthly_revenue / stats.active_subscriptions) || 0)}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: 3.2, isPositive: true }}
            description="Revenu moyen par utilisateur"
          />
          <MetricCard
            title="Croissance"
            value={`+${stats.growth_rate || 0}%`}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: stats.growth_rate || 0, isPositive: (stats.growth_rate || 0) >= 0 }}
            description="Ce mois-ci"
          />
        </div>
      )}

      {/* Graphiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
              <CardDescription>Revenus mensuels des 5 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenue_by_month || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(Number(value))} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par plan</CardTitle>
              <CardDescription>Revenus par type d'abonnement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.revenue_by_plan || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ plan, revenue }) => `${plan}: ${formatPrice(revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {(stats.revenue_by_plan || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatPrice(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un tenant ou plan..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as any }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, billing_cycle: value === 'all' ? undefined : value as any }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Facturation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="monthly">Mensuelle</SelectItem>
                <SelectItem value="yearly">Annuelle</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, is_trial: value === 'all' ? undefined : value === 'true' }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="true">Essais</SelectItem>
                <SelectItem value="false">Payants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements actifs ({subscriptions.length})</CardTitle>
          <CardDescription>
            Liste complète des abonnements avec détails et actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Facturation</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          {subscription.tenant?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.tenant?.domain || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.subscription?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {subscription.subscription?.limits?.vehicles === -1 ? "Illimité" : subscription.subscription?.limits?.vehicles || 0} véhicules
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscription.is_active ? 'active' : 'inactive', false)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="capitalize">{subscription.subscription?.billing_cycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" title="Auto-renouvelé" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatPrice(Number(subscription.subscription?.price || 0))}</span>
                      <span className="text-sm text-gray-500">
                        /{subscription.subscription?.billing_cycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={`text-sm ${subscription.end_date && isExpiringSoon(subscription.end_date) ? 'text-orange-600 font-medium' : ''}`}>
                          {subscription.end_date ? formatDate(subscription.end_date) : 'N/A'}
                        </div>
                        {subscription.end_date && isExpiringSoon(subscription.end_date) && (
                          <div className="text-xs text-orange-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expire bientôt
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Envoyer facture
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {subscription.is_active ? (
                            <DropdownMenuItem className="flex items-center gap-2 text-orange-600">
                              <Ban className="w-4 h-4" />
                              Suspendre
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="flex items-center gap-2 text-green-600">
                              <Play className="w-4 h-4" />
                              Réactiver
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                            <X className="w-4 h-4" />
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreatePlanModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onSuccess={() => {
          loadData();
          setShowCreatePlanModal(false);
        }}
      />

      <CreateSubscriptionModal
        isOpen={showCreateSubscriptionModal}
        onClose={() => setShowCreateSubscriptionModal(false)}
        onSuccess={() => {
          loadData();
          setShowCreateSubscriptionModal(false);
        }}
      />
    </div>
  );
};

export default SubscriptionsOverview; 