import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building, Globe, Settings, CheckCircle, AlertCircle, Clock, Plus, Edit, TestTube, TrendingUp, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { paymentMethodsService, type PaymentMethod, type PaymentMethodStats } from '@/services/paymentMethodsService';

// Utilitaires sécurisés
import { safeArray, safeLength, safeReduce, safeFilter, safeMap } from '@/utils/safeData';


const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<PaymentMethodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [methodsResponse, statsData] = await Promise.all([
        paymentMethodsService.getPaymentMethods(),
        paymentMethodsService.getStatistics()
      ]);
      
      setPaymentMethods(methodsResponse.data || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les méthodes de paiement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'bank_transfer': return <Building className="h-5 w-5 text-purple-600" />;
      case 'wallet': return <Smartphone className="h-5 w-5 text-green-600" />;
      case 'crypto': return <Globe className="h-5 w-5 text-orange-600" />;
      default: return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Actif
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Inactif
        </Badge>
      );
    }
  };

  const handleToggleStatus = async (methodId: number) => {
    try {
      setActionLoading(methodId);
      await paymentMethodsService.toggleStatus(methodId);
      toast({
        title: 'Succès',
        description: 'Le statut a été modifié avec succès',
      });
      loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestConnection = async (methodId: number) => {
    try {
      setActionLoading(methodId);
      const result = await paymentMethodsService.testConnection(methodId);
      
      if (result.success) {
        toast({
          title: 'Test réussi',
          description: 'La connexion fonctionne correctement',
        });
      } else {
        toast({
          title: 'Test échoué',
          description: result.message || 'La connexion a échoué',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de tester la connexion',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateMethod = () => {
    toast({
      title: 'Fonctionnalité à venir',
      description: 'L\'ajout de méthodes de paiement sera bientôt disponible',
    });
  };

  const handleEditMethod = (methodId: number) => {
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La modification sera bientôt disponible',
    });
  };

  const handleViewStats = (methodId: number) => {
    toast({
      title: 'Fonctionnalité à venir',
      description: 'Les statistiques détaillées seront bientôt disponibles',
    });
  };

  const activeMethods = safeLength(safeFilter(paymentMethods, m => m.is_active));
  const totalMethods = safeLength(paymentMethods);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modes de Paiement</h1>
          <p className="text-gray-600">Configuration et gestion des passerelles de paiement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres Globaux
          </Button>
          <Button onClick={handleCreateMethod}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Méthode
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passerelles Actives</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMethods}</div>
            <p className="text-xs text-muted-foreground">Sur {totalMethods} configurées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Mensuel</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.method_usage.reduce((sum, m) => sum + m.total_amount, 0).toLocaleString('fr-FR') || '0'} €</div>
            <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.method_usage.reduce((sum, m) => sum + m.transactions_count, 0).toLocaleString('fr-FR') || '0'}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frais Moyens</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">+ 0.28€ fixe</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateways List */}
      <Card>
        <CardHeader>
          <CardTitle>Passerelles de Paiement</CardTitle>
          <CardDescription>
            Configuration et monitoring des différents moyens de paiement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {safeMap(paymentMethods, (method) => (
                <div key={method.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    {getTypeIcon(method.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{method.display_name || method.name}</h3>
                      {getStatusBadge(method.is_active)}
                      {method.is_test_mode && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TestTube className="h-3 w-3" />
                          Test
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="font-medium">{method.provider}</span>
                      <span>Frais: {method.transaction_fee_percentage}% + {method.transaction_fee_fixed}€</span>
                      <span>Devises: {method.supported_currencies?.slice(0, 3).join(', ')}</span>
                      {method.supported_currencies && method.supported_currencies.length > 3 && (
                        <span>+{method.supported_currencies.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      {method.min_amount && (
                        <span>Min: {method.min_amount}€</span>
                      )}
                      {method.max_amount && (
                        <span>Max: {method.max_amount.toLocaleString('fr-FR')}€</span>
                      )}
                      {method.settlement_delay_days && (
                        <span>Délai: {method.settlement_delay_days}j</span>
                      )}
                      {method.last_tested_at && (
                        <span>
                          Testé: {new Date(method.last_tested_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading === method.id}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMethod(method.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Configurer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTestConnection(method.id)}>
                          <TestTube className="w-4 h-4 mr-2" />
                          Tester
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStats(method.id)}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Statistiques
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(method.id)}>
                          {method.is_active ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {paymentMethods.length === 0 && !loading && (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-xl font-medium text-gray-900 mb-2">
                    Aucune méthode de paiement configurée
                  </div>
                  <div className="text-gray-500 mb-4">
                    Commencez par ajouter votre première méthode de paiement
                  </div>
                  <Button onClick={handleCreateMethod}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une méthode
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Fees Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Frais par Type</CardTitle>
            <CardDescription>Répartition des coûts par mode de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Cartes bancaires</span>
                </div>
                <span className="font-medium">2.9% + 0.30€</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Paiement mobile</span>
                </div>
                <span className="font-medium">1.8% + 0.10€</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Virement SEPA</span>
                </div>
                <span className="font-medium">1.0% + 0.25€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres Généraux</CardTitle>
            <CardDescription>Configuration globale des paiements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-capture des paiements</span>
                <Badge variant="default">Activé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Remboursements automatiques</span>
                <Badge variant="secondary">Désactivé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Notifications webhook</span>
                <Badge variant="default">Activé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mode test</span>
                <Badge variant="outline">Sandbox</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentMethods;