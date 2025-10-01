import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Euro, 
  TrendingUp, 
  TrendingDown,
  Car,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { 
  transactionsService, 
  TransactionOverview, 
  VehicleAnalysis, 
  Transaction,
  CreateTransactionData
} from "@/services/transactionsService";
import { Vehicle, fetchVehicles } from "@/services/vehicleService";
import { toast } from "@/hooks/use-toast";

const TransactionsPage: React.FC = () => {
  const [overview, setOverview] = useState<TransactionOverview | null>(null);
  const [vehicleAnalysis, setVehicleAnalysis] = useState<VehicleAnalysis[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState<CreateTransactionData>({
    vehicle_id: 0,
    type: 'purchase',
    date: new Date().toISOString().split('T')[0],
    price: 0,
    mileage: undefined,
    seller_buyer_name: '',
    seller_buyer_contact: '',
    reason: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    loadTransactionData();
    loadVehicles();
  }, []);

  const loadTransactionData = async () => {
    try {
      setIsLoading(true);
      
      const [
        overviewData,
        analysisData,
        historyData
      ] = await Promise.all([
        transactionsService.getOverview(),
        transactionsService.getVehicleAnalysis(),
        transactionsService.getHistory(currentPage, 10),
      ]);

      setOverview(overviewData);
      setVehicleAnalysis(analysisData.vehicle_analysis);
      setTransactions(historyData.transactions);
      setTotalPages(historyData.pagination.last_page);
    } catch (error) {
      console.error('Erreur lors du chargement des données de transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const vehiclesData = await fetchVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      await transactionsService.createTransaction(formData);
      toast({
        title: "Succès",
        description: "Transaction créée avec succès",
      });
      setIsCreateModalOpen(false);
      resetForm();
      loadTransactionData();
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await transactionsService.deleteTransaction(id);
      toast({
        title: "Succès",
        description: "Transaction supprimée avec succès",
      });
      loadTransactionData();
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: 0,
      type: 'purchase',
      date: new Date().toISOString().split('T')[0],
      price: 0,
      mileage: undefined,
      seller_buyer_name: '',
      seller_buyer_contact: '',
      reason: '',
      status: 'pending',
      notes: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getRecommendationIcon = (recommendation: VehicleAnalysis['recommendation']) => {
    switch (recommendation.action) {
      case 'sell':
        return recommendation.priority === 'high' ? 
          <TrendingDown className="text-red-500" size={16} /> : 
          <TrendingDown className="text-orange-500" size={16} />;
      case 'hold':
        return <TrendingUp className="text-green-500" size={16} />;
      default:
        return <Car className="text-gray-500" size={16} />;
    }
  };

  const getRecommendationColor = (recommendation: VehicleAnalysis['recommendation']) => {
    if (recommendation.action === 'sell' && recommendation.priority === 'high') return 'text-red-600';
    if (recommendation.action === 'sell' && recommendation.priority === 'medium') return 'text-orange-600';
    if (recommendation.action === 'hold') return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Achats/Reventes</h1>
        <p className="text-gray-600 mt-2">Gestion des transactions d'achat et de vente de véhicules</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analysis">Analyse financière</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Euro className="mr-2 text-blue-600" size={20} />
                  Valeur flotte
                </CardTitle>
                <CardDescription>Total estimé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(overview?.fleet_metrics.total_fleet_value || 0)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="text-blue-500 font-medium">Valeur d'achat</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 text-green-600" size={20} />
                  Investissement
                </CardTitle>
                <CardDescription>Total investi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(overview?.fleet_metrics.total_investment || 0)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="text-green-500 font-medium">Achat + Dépenses</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Car className="mr-2 text-purple-600" size={20} />
                  Profit potentiel
                </CardTitle>
                <CardDescription>Gain estimé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  (overview?.fleet_metrics.potential_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {overview?.fleet_metrics.potential_profit !== undefined && (
                    <>
                      {overview.fleet_metrics.potential_profit >= 0 ? '+' : ''}
                      {formatCurrency(overview.fleet_metrics.potential_profit)}
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {overview?.fleet_metrics.potential_profit !== undefined && (
                    <span className={`font-medium ${
                      overview.fleet_metrics.potential_profit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {overview.fleet_metrics.potential_profit >= 0 ? 'Profit' : 'Perte'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 text-amber-600" size={20} />
                  Marge moyenne
                </CardTitle>
                <CardDescription>Par véhicule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  (overview?.fleet_metrics.average_margin || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(overview?.fleet_metrics.average_margin || 0)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="text-amber-500 font-medium">Moyenne</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métriques de transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Métriques de transactions</CardTitle>
              <CardDescription>Résumé des achats et ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {overview?.transaction_metrics.total_purchases || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Total achats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {overview?.transaction_metrics.total_sales || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Total ventes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(overview?.transaction_metrics.total_purchase_amount || 0)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Montant achats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(overview?.transaction_metrics.total_sale_amount || 0)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Montant ventes</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    (overview?.transaction_metrics.net_transaction_result || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {overview?.transaction_metrics.net_transaction_result !== undefined && (
                      <>
                        {overview.transaction_metrics.net_transaction_result >= 0 ? '+' : ''}
                        {formatCurrency(overview.transaction_metrics.net_transaction_result)}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Résultat net</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyse financière par véhicule */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse financière par véhicule</CardTitle>
              <CardDescription>Recommandations d'achat/vente basées sur la rentabilité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Véhicule</th>
                      <th className="text-right py-2">Prix d'achat</th>
                      <th className="text-right py-2">Dépenses</th>
                      <th className="text-right py-2">Investissement total</th>
                      <th className="text-right py-2">Valeur estimée</th>
                      <th className="text-right py-2">Profit/Perte</th>
                      <th className="text-center py-2">Recommandation</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleAnalysis.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b hover:bg-slate-50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{vehicle.vehicle}</p>
                            <p className="text-sm text-slate-500">{vehicle.plate}</p>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(vehicle.purchase_price)}
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(vehicle.total_expenses)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(vehicle.total_investment)}
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(vehicle.estimated_sale_price)}
                        </td>
                        <td className={`py-3 text-right font-bold ${
                          vehicle.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {vehicle.profit_loss >= 0 ? '+' : ''}
                          {formatCurrency(vehicle.profit_loss)}
                          <span className="text-sm font-normal ml-1">
                            ({vehicle.profit_loss_percentage >= 0 ? '+' : ''}{vehicle.profit_loss_percentage}%)
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <div className={`flex items-center justify-center space-x-2 ${getRecommendationColor(vehicle.recommendation)}`}>
                            {getRecommendationIcon(vehicle.recommendation)}
                            <span className="text-sm font-medium">
                              {vehicle.recommendation.action === 'sell' ? 'Vendre' : 'Conserver'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{vehicle.recommendation.reason}</p>
                        </td>
                        <td className="py-3 text-center">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {vehicleAnalysis.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Aucune analyse disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique des transactions */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>Toutes les opérations d'achat et de vente</CardDescription>
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 w-4 h-4" />
                    Nouvelle transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle transaction</DialogTitle>
                    <DialogDescription>
                      Enregistrez un achat ou une vente de véhicule
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Véhicule</Label>
                      <Select 
                        value={formData.vehicle_id.toString()} 
                        onValueChange={(value) => setFormData({...formData, vehicle_id: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un véhicule" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.marque} {vehicle.modele} - {vehicle.immatriculation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: 'purchase' | 'sale') => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">Achat</SelectItem>
                          <SelectItem value="sale">Vente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix (€)</Label>
                      <Input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Kilométrage (optionnel)</Label>
                      <Input 
                        type="number"
                        value={formData.mileage || ''}
                        onChange={(e) => setFormData({...formData, mileage: e.target.value ? parseInt(e.target.value) : undefined})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: 'pending' | 'completed' | 'cancelled') => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="seller_buyer_name">
                        {formData.type === 'purchase' ? 'Vendeur' : 'Acheteur'}
                      </Label>
                      <Input 
                        value={formData.seller_buyer_name}
                        onChange={(e) => setFormData({...formData, seller_buyer_name: e.target.value})}
                        placeholder="Nom complet"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="seller_buyer_contact">Contact (optionnel)</Label>
                      <Input 
                        value={formData.seller_buyer_contact}
                        onChange={(e) => setFormData({...formData, seller_buyer_contact: e.target.value})}
                        placeholder="Téléphone ou email"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="reason">Raison (optionnel)</Label>
                      <Input 
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Motif de la transaction"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Textarea 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Informations supplémentaires"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateTransaction}>
                      Créer la transaction
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Véhicule</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Prix</th>
                      <th className="text-left py-2">Contact</th>
                      <th className="text-center py-2">Statut</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-slate-50">
                        <td className="py-3">
                          <Badge variant={transaction.type === 'purchase' ? 'secondary' : 'default'}>
                            {transaction.type === 'purchase' ? 'Achat' : 'Vente'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{transaction.vehicle}</p>
                            <p className="text-sm text-slate-500">{transaction.plate}</p>
                          </div>
                        </td>
                        <td className="py-3 text-sm">
                          {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(transaction.price)}
                        </td>
                        <td className="py-3">
                          <div>
                            <p className="text-sm">{transaction.seller_buyer_name}</p>
                            {transaction.seller_buyer_contact && (
                              <p className="text-xs text-slate-500">{transaction.seller_buyer_contact}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Aucune transaction enregistrée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Catalogue d'achat */}
        <TabsContent value="catalog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catalogue d'achat</CardTitle>
              <CardDescription>Opportunités d'achat de véhicules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Fonctionnalité en développement - Intégration avec des APIs de véhicules d'occasion
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionsPage;