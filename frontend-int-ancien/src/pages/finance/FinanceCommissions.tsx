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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  Building2,
  CreditCard,
  MoreHorizontal,
  Eye,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Shield,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Commission {
  id: number;
  partner_id: number;
  partner_name: string;
  partner_type: 'garage' | 'controle_technique' | 'assurance';
  booking_id: number;
  tenant_name: string;
  service_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  created_at: string;
  due_date: string;
  paid_at?: string;
}

interface CommissionStats {
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  monthly_commissions: number;
  total_partners: number;
  average_commission_rate: number;
  commissions_by_type: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
  monthly_evolution: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

const FinanceCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');


  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const [commissionsResponse, statsResponse] = await Promise.all([
        fetch(`/api/financial/commissions?${params.toString()}`),
        fetch('/api/financial/commissions/stats')
      ]);
      
      const commissionsData = await commissionsResponse.json();
      const statsData = await statsResponse.json();
      
      setCommissions(commissionsData.data || []);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error);
      setCommissions([]);
      setStats(null);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des commissions',
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
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Approuvée</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'garage':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'controle_technique':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'assurance':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'garage':
        return 'Garage';
      case 'controle_technique':
        return 'Contrôle Technique';
      case 'assurance':
        return 'Assurance';
      default:
        return type;
    }
  };

  const handlePayCommission = async (commissionId: number) => {
    toast({
      title: 'Commission payée',
      description: 'La commission a été marquée comme payée',
    });
    // Refresh data
    loadData();
  };

  const handleApproveCommission = async (commissionId: number) => {
    toast({
      title: 'Commission approuvée',
      description: 'La commission a été approuvée pour paiement',
    });
    // Refresh data
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Commissions Partenaires
          </h1>
          <p className="text-gray-600">Gestion des commissions et paiements partenaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Traiter les paiements
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_commissions)}</div>
              <p className="text-xs text-muted-foreground">Depuis le début</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pending_commissions)}</div>
              <p className="text-xs text-muted-foreground">À traiter</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid_commissions)}</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partenaires actifs</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_partners}</div>
              <p className="text-xs text-muted-foreground">Taux moyen: {stats.average_commission_rate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphique évolution */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des commissions</CardTitle>
          <CardDescription>Montants et nombre de commissions par mois</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.monthly_evolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}k€`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? formatCurrency(value) : value,
                    name === 'amount' ? 'Montant' : 'Nombre'
                  ]} 
                />
                <Bar yAxisId="left" dataKey="amount" fill="#0088FE" name="amount" />
                <Line yAxisId="right" dataKey="count" stroke="#FF8042" name="count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

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
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par partenaire ou client..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="garage">Garages</SelectItem>
                <SelectItem value="controle_technique">Contrôle Technique</SelectItem>
                <SelectItem value="assurance">Assurances</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Commissions récentes ({commissions.length})</CardTitle>
          <CardDescription>Gestion des commissions partenaires</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partenaire</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(commission.partner_type)}
                        <div>
                          <div className="font-medium">{commission.partner_name}</div>
                          <div className="text-sm text-gray-500">{getTypeLabel(commission.partner_type)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{commission.tenant_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-mono">{formatCurrency(commission.service_amount)}</div>
                        <div className="text-xs text-gray-500">#{commission.booking_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-mono font-medium">{formatCurrency(commission.commission_amount)}</div>
                        <div className="text-xs text-gray-500">{commission.commission_rate}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(commission.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(commission.due_date)}</div>
                      {commission.paid_at && (
                        <div className="text-xs text-green-600">
                          Payée le {formatDate(commission.paid_at)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          {commission.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleApproveCommission(commission.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                            </>
                          )}
                          {commission.status === 'approved' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePayCommission(commission.id)}>
                                <Send className="w-4 h-4 mr-2" />
                                Marquer comme payée
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {commissions.length === 0 && !loading && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-900 mb-2">
                Aucune commission trouvée
              </div>
              <div className="text-gray-500">
                Les commissions apparaîtront ici quand les partenaires auront des réservations
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceCommissions;