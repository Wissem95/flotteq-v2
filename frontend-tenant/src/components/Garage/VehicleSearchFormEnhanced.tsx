import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Car, Wrench, FileText, Edit3, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import RepairSelector from './RepairSelector';
import { useVehicleSearchPersistence } from '@/hooks/useVehicleSearchPersistence';

interface VehicleInfo {
  licensePlate: string;
  brand: string;
  model: string;
  year: string;
  version: string;
}

interface VehicleSearchFormEnhancedProps {
  onVehicleSelected: (vehicle: VehicleInfo, repairs: string[]) => void;
}

const VehicleSearchFormEnhanced: React.FC<VehicleSearchFormEnhancedProps> = ({ onVehicleSelected }) => {
  const { searchData, saveSearchData } = useVehicleSearchPersistence();
  const [activeTab, setActiveTab] = useState<'plate' | 'manual'>('plate');
  const [licensePlate, setLicensePlate] = useState('');
  const [isPlateRecognized, setIsPlateRecognized] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    licensePlate: '',
    brand: '',
    model: '',
    year: '',
    version: ''
  });
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>(['Vidange']);
  const [isSearching, setIsSearching] = useState(false);

  // Restaurer les données sauvegardées
  useEffect(() => {
    if (searchData) {
      setVehicleInfo(searchData.vehicleInfo);
      setSelectedRepairs([searchData.selectedService]);
      setActiveTab(searchData.searchMode);
      setIsPlateRecognized(searchData.isPlateRecognized);
      setLicensePlate(searchData.vehicleInfo.licensePlate);
    }
  }, [searchData]);

  const handlePlateSearch = async () => {
    if (!licensePlate || licensePlate.length < 6) {
      toast.error('Veuillez saisir une plaque d\'immatriculation valide');
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulation de reconnaissance automatique
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - En réalité, ceci viendrait d'une API
      const mockVehicleData = {
        licensePlate: licensePlate.toUpperCase(),
        brand: 'Renault',
        model: 'Clio',
        year: '2019',
        version: '1.5 dCi 90 CV'
      };

      setVehicleInfo(mockVehicleData);
      setIsPlateRecognized(true);
      toast.success('Véhicule reconnu automatiquement !');
    } catch (error) {
      toast.error('Véhicule non trouvé, saisie manuelle requise');
      setActiveTab('manual');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSubmit = () => {
    if (!vehicleInfo.brand || !vehicleInfo.model || !vehicleInfo.year) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (selectedRepairs.length === 0) {
      toast.error('Veuillez sélectionner au moins une réparation');
      return;
    }

    setIsPlateRecognized(true);
  };

  const handleSearchGarages = () => {
    if (!isPlateRecognized || selectedRepairs.length === 0) {
      toast.error('Veuillez compléter les informations du véhicule et sélectionner des réparations');
      return;
    }

    // Sauvegarder les données
    const dataToSave = {
      vehicleInfo,
      selectedService: selectedRepairs[0], // Pour compatibilité avec l'ancien système
      searchMode: activeTab,
      isPlateRecognized
    };
    saveSearchData(dataToSave);

    onVehicleSelected(vehicleInfo, selectedRepairs);
  };

  return (
    <div className="space-y-6">
      {/* Section identifier véhicule avec tabs corrigées */}
      <Card className="shadow-sm border bg-white">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="bg-white/20 p-2 rounded-lg">
              <Search className="w-5 h-5" />
            </div>
            Identifier votre véhicule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'plate' | 'manual')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg h-12">
              <TabsTrigger 
                value="plate" 
                className="flex items-center gap-2 text-sm font-medium bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2"
              >
                <span className="text-lg">🪪</span>
                Par plaque d'immatriculation
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="flex items-center gap-2 text-sm font-medium bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2"
              >
                <span className="text-lg">✍️</span>
                Saisie manuelle
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="plate" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaque d'immatriculation
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="AB-123-CD"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      className="text-center font-mono text-lg border-gray-300 focus:border-blue-500 rounded-lg"
                      disabled={isSearching}
                    />
                  </div>
                  <Button
                    onClick={handlePlateSearch}
                    disabled={isSearching || !licensePlate}
                    className="px-6 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    {isSearching ? 'Recherche...' : 'Rechercher'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Renault"
                    value={vehicleInfo.brand}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, brand: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Clio"
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année *
                  </label>
                  <Select
                    value={vehicleInfo.year}
                    onValueChange={(value) => setVehicleInfo({...vehicleInfo, year: value})}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 rounded-lg">
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 25}, (_, i) => 2024 - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: 1.5 dCi 90 CV"
                    value={vehicleInfo.version}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, version: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 rounded-lg"
                  />
                </div>
              </div>
              
              <Button onClick={handleManualSubmit} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg">
                Valider les informations
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Véhicule identifié avec succès */}
      {isPlateRecognized && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Véhicule identifié avec succès
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Marque:</span>
                    <span className="text-gray-900">{vehicleInfo.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Modèle:</span>
                    <span className="text-gray-900">{vehicleInfo.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Année:</span>
                    <span className="text-gray-900">{vehicleInfo.year}</span>
                  </div>
                  {vehicleInfo.version && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Version:</span>
                      <span className="text-gray-900">{vehicleInfo.version}</span>
                    </div>
                  )}
                  {vehicleInfo.licensePlate && (
                    <div className="flex justify-between md:col-span-2">
                      <span className="font-medium text-gray-700">Plaque:</span>
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{vehicleInfo.licensePlate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection des réparations */}
      {isPlateRecognized && (
        <Card className="shadow-sm border bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="bg-white/20 p-2 rounded-lg">
                <Wrench className="w-5 h-5" />
              </div>
              Sélectionner les réparations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RepairSelector
              selectedRepairs={selectedRepairs}
              onRepairsChange={setSelectedRepairs}
            />
          </CardContent>
        </Card>
      )}

      {/* Bouton de recherche centré et redimensionné */}
      {isPlateRecognized && selectedRepairs.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSearchGarages}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">🔍</span>
            Trouver des garages partenaires ({selectedRepairs.length} réparation{selectedRepairs.length > 1 ? 's' : ''})
          </Button>
        </div>
      )}
    </div>
  );
};

export default VehicleSearchFormEnhanced;
