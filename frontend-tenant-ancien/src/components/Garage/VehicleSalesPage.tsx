
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingDown, TrendingUp, Euro, Calculator, Edit, Car, Wrench, Shield, Fuel } from 'lucide-react';

interface VehicleExpense {
  id: string;
  vehicleId: string;
  type: 'Réparation' | 'Assurance' | 'Carburant' | 'Entretien' | 'Autre';
  description: string;
  amount: number;
  date: string;
}

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  purchasePrice: number;
  purchaseDate: string;
  currentMarketValue: number;
  estimatedSalePrice: number;
  totalExpenses: number;
  expenses: VehicleExpense[];
  potentialProfit: number;
}

const VehicleSalesPage: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingMarketValue, setEditingMarketValue] = useState<string | null>(null);
  const [newMarketValue, setNewMarketValue] = useState('');

  // Données d'exemple
  const vehicles: Vehicle[] = [
    {
      id: '1',
      name: 'Renault Clio',
      plate: 'AB-123-CD',
      purchasePrice: 8500,
      purchaseDate: '2023-01-15',
      currentMarketValue: 12500,
      estimatedSalePrice: 12000,
      totalExpenses: 2340,
      potentialProfit: 1160,
      expenses: [
        { id: '1', vehicleId: '1', type: 'Réparation', description: 'Plaquettes de frein', amount: 320, date: '2023-03-15' },
        { id: '2', vehicleId: '1', type: 'Assurance', description: 'Assurance annuelle', amount: 840, date: '2023-01-15' },
        { id: '3', vehicleId: '1', type: 'Entretien', description: 'Vidange + filtres', amount: 180, date: '2023-06-10' },
        { id: '4', vehicleId: '1', type: 'Réparation', description: 'Pneumatiques', amount: 480, date: '2023-09-22' },
        { id: '5', vehicleId: '1', type: 'Carburant', description: 'Carburant mensuel moyen', amount: 520, date: '2023-12-01' }
      ]
    },
    {
      id: '2',
      name: 'Peugeot 308',
      plate: 'EF-456-GH',
      purchasePrice: 12000,
      purchaseDate: '2022-08-20',
      currentMarketValue: 15800,
      estimatedSalePrice: 15500,
      totalExpenses: 3120,
      potentialProfit: 380,
      expenses: [
        { id: '6', vehicleId: '2', type: 'Réparation', description: 'Courroie de distribution', amount: 680, date: '2023-02-10' },
        { id: '7', vehicleId: '2', type: 'Assurance', description: 'Assurance annuelle', amount: 920, date: '2022-08-20' },
        { id: '8', vehicleId: '2', type: 'Entretien', description: 'Révision complète', amount: 450, date: '2023-05-15' },
        { id: '9', vehicleId: '2', type: 'Réparation', description: 'Système de freinage', amount: 520, date: '2023-08-03' },
        { id: '10', vehicleId: '2', type: 'Carburant', description: 'Carburant mensuel moyen', amount: 550, date: '2023-12-01' }
      ]
    },
    {
      id: '3',
      name: 'Citroën C3',
      plate: 'IJ-789-KL',
      purchasePrice: 14500,
      purchaseDate: '2023-05-10',
      currentMarketValue: 18200,
      estimatedSalePrice: 17800,
      totalExpenses: 1890,
      potentialProfit: 1410,
      expenses: [
        { id: '11', vehicleId: '3', type: 'Assurance', description: 'Assurance annuelle', amount: 780, date: '2023-05-10' },
        { id: '12', vehicleId: '3', type: 'Entretien', description: 'Vidange + filtres', amount: 160, date: '2023-08-15' },
        { id: '13', vehicleId: '3', type: 'Réparation', description: 'Réparation climatisation', amount: 380, date: '2023-10-05' },
        { id: '14', vehicleId: '3', type: 'Carburant', description: 'Carburant mensuel moyen', amount: 570, date: '2023-12-01' }
      ]
    }
  ];

  const getExpenseIcon = (type: string) => {
    switch (type) {
      case 'Réparation': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'Assurance': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Carburant': return <Fuel className="w-4 h-4 text-green-600" />;
      case 'Entretien': return <Car className="w-4 h-4 text-purple-600" />;
      default: return <Euro className="w-4 h-4 text-gray-600" />;
    }
  };

  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case 'Réparation': return 'bg-orange-100 text-orange-800';
      case 'Assurance': return 'bg-blue-100 text-blue-800';
      case 'Carburant': return 'bg-green-100 text-green-800';
      case 'Entretien': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateMarketValue = (vehicleId: string) => {
    if (newMarketValue && parseFloat(newMarketValue) > 0) {
      // Ici, vous pourriez mettre à jour la valeur dans votre état ou base de données
      setEditingMarketValue(null);
      setNewMarketValue('');
    }
  };

  const totalFleetValue = vehicles.reduce((sum, vehicle) => sum + vehicle.currentMarketValue, 0);
  const totalInvestment = vehicles.reduce((sum, vehicle) => sum + vehicle.purchasePrice + vehicle.totalExpenses, 0);
  const totalPotentialProfit = vehicles.reduce((sum, vehicle) => sum + vehicle.potentialProfit, 0);

  return (
    <div className="flex-1 p-3 sm:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-8 h-8" />
            Achats/Reventes de véhicules
          </h1>
        </div>

        {/* Résumé financier global */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Valeur totale de la flotte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalFleetValue.toLocaleString()} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Investissement total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalInvestment.toLocaleString()} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Profit potentiel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{totalPotentialProfit.toLocaleString()} €</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Marge moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {((totalPotentialProfit / totalInvestment) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="details">Détail par véhicule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse financière par véhicule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Prix d'achat</TableHead>
                        <TableHead>Dépenses totales</TableHead>
                        <TableHead>Valeur marché</TableHead>
                        <TableHead>Prix de vente estimé</TableHead>
                        <TableHead>Profit/Perte</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{vehicle.name}</p>
                              <p className="text-sm text-gray-600">{vehicle.plate}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-blue-600 font-medium">
                            {vehicle.purchasePrice.toLocaleString()} €
                          </TableCell>
                          <TableCell className="text-red-600 font-medium">
                            {vehicle.totalExpenses.toLocaleString()} €
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{vehicle.currentMarketValue.toLocaleString()} €</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMarketValue(vehicle.id);
                                  setNewMarketValue(vehicle.currentMarketValue.toString());
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {vehicle.estimatedSalePrice.toLocaleString()} €
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={vehicle.potentialProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {vehicle.potentialProfit >= 0 ? '+' : ''}{vehicle.potentialProfit.toLocaleString()} €
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedVehicle(vehicle)}
                                >
                                  <Calculator className="w-4 h-4 mr-2" />
                                  Détails
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Analyse détaillée - {vehicle.name}</DialogTitle>
                                </DialogHeader>
                                {selectedVehicle && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Prix d'achat</p>
                                        <p className="text-xl font-bold text-blue-600">{selectedVehicle.purchasePrice.toLocaleString()} €</p>
                                      </div>
                                      <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Dépenses totales</p>
                                        <p className="text-xl font-bold text-red-600">{selectedVehicle.totalExpenses.toLocaleString()} €</p>
                                      </div>
                                      <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Valeur marché</p>
                                        <p className="text-xl font-bold text-green-600">{selectedVehicle.currentMarketValue.toLocaleString()} €</p>
                                      </div>
                                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Profit potentiel</p>
                                        <p className={`text-xl font-bold ${selectedVehicle.potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {selectedVehicle.potentialProfit >= 0 ? '+' : ''}{selectedVehicle.potentialProfit.toLocaleString()} €
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-lg font-semibold mb-4">Détail des dépenses</h3>
                                      <div className="space-y-2">
                                        {selectedVehicle.expenses.map((expense) => (
                                          <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                              {getExpenseIcon(expense.type)}
                                              <div>
                                                <p className="font-medium">{expense.description}</p>
                                                <div className="flex items-center gap-2">
                                                  <Badge className={getExpenseTypeColor(expense.type)}>
                                                    {expense.type}
                                                  </Badge>
                                                  <span className="text-sm text-gray-600">{expense.date}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <span className="font-bold text-red-600">{expense.amount.toLocaleString()} €</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{vehicle.name} - {vehicle.plate}</span>
                      <Badge
                        className={vehicle.potentialProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {vehicle.potentialProfit >= 0 ? 'Profitable' : 'Perte'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Prix d'achat</Label>
                        <p className="font-bold text-blue-600">{vehicle.purchasePrice.toLocaleString()} €</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Dépenses totales</Label>
                        <p className="font-bold text-red-600">{vehicle.totalExpenses.toLocaleString()} €</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Valeur marché actuelle</Label>
                        <div className="flex items-center gap-2">
                          {editingMarketValue === vehicle.id ? (
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                value={newMarketValue}
                                onChange={(e) => setNewMarketValue(e.target.value)}
                                className="w-20 h-8"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateMarketValue(vehicle.id)}
                                className="h-8 px-2"
                              >
                                ✓
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="font-bold text-green-600">{vehicle.currentMarketValue.toLocaleString()} €</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMarketValue(vehicle.id);
                                  setNewMarketValue(vehicle.currentMarketValue.toString());
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Prix de vente estimé</Label>
                        <p className="font-bold">{vehicle.estimatedSalePrice.toLocaleString()} €</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Profit/Perte</Label>
                        <p className={`font-bold ${vehicle.potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {vehicle.potentialProfit >= 0 ? '+' : ''}{vehicle.potentialProfit.toLocaleString()} €
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Répartition des dépenses</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {vehicle.expenses.map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {getExpenseIcon(expense.type)}
                              <span className="text-sm">{expense.description}</span>
                            </div>
                            <span className="font-medium text-red-600">{expense.amount.toLocaleString()} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog pour éditer la valeur marchande */}
      {editingMarketValue && (
        <Dialog open={!!editingMarketValue} onOpenChange={() => setEditingMarketValue(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la valeur marchande</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="marketValue">Nouvelle valeur marchande (€)</Label>
                <Input
                  id="marketValue"
                  type="number"
                  value={newMarketValue}
                  onChange={(e) => setNewMarketValue(e.target.value)}
                  placeholder="Entrez la nouvelle valeur"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Vous pouvez consulter l'Argus ou d'autres sources pour déterminer la valeur actuelle du marché.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleUpdateMarketValue(editingMarketValue!)}>
                  Mettre à jour
                </Button>
                <Button variant="outline" onClick={() => setEditingMarketValue(null)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VehicleSalesPage;
