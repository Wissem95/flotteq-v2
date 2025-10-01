import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Plus, Search, Filter, Car, User, Calendar, Camera, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface EtatDesLieux {
  id: number;
  vehicle_id: number;
  user_id: number;
  type: 'depart' | 'retour';
  conducteur?: string;
  kilometrage: number;
  notes?: string;
  photos?: { [key: string]: string };
  is_validated: boolean;
  validated_at?: string;
  created_at: string;
  vehicle: Vehicle;
  user: User;
  validator?: User;
}

const HistoriqueEtatDesLieux: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [etatsDesLieux, setEtatsDesLieux] = useState<EtatDesLieux[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEtat, setSelectedEtat] = useState<EtatDesLieux | null>(null);
  
  const [filters, setFilters] = useState({
    vehicle_id: 'all',
    type: 'all',
    search: ''
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination.current_page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [etatsResponse, vehiclesResponse] = await Promise.all([
        api.get('/etat-des-lieux', {
          params: {
            page: pagination.current_page,
            vehicle_id: filters.vehicle_id || undefined,
            type: filters.type || undefined,
            search: filters.search || undefined
          }
        }),
        api.get('/vehicles')
      ]);

      setEtatsDesLieux(etatsResponse.data.data || []);
      setPagination({
        current_page: etatsResponse.data.current_page || 1,
        last_page: etatsResponse.data.last_page || 1,
        total: etatsResponse.data.total || 0
      });
      
      setVehicles(vehiclesResponse.data.data || vehiclesResponse.data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (etatId: number) => {
    try {
      await api.put(`/etat-des-lieux/${etatId}`, {
        is_validated: true
      });
      
      toast({
        title: "Succès",
        description: "État des lieux validé"
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la validation",
        variant: "destructive"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'depart' ? 'Départ' : 'Retour';
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === 'depart' ? 'default' : 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const photoPositions = {
    avant_droit: 'Avant Droit',
    avant: 'Avant',
    avant_gauche: 'Avant Gauche',
    arriere_gauche: 'Arrière Gauche',
    arriere: 'Arrière',
    arriere_droit: 'Arrière Droit',
    interieur_avant: 'Intérieur Avant',
    interieur_arriere: 'Intérieur Arrière',
    compteur: 'Compteur Kilométrique'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Historique des États des Lieux</h1>
          <Button onClick={() => navigate('/etat-des-lieux/nouveau')}>
            <Plus size={16} className="mr-2" />
            Nouvel état des lieux
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <Select value={filters.vehicle_id} onValueChange={(value) => setFilters(prev => ({ ...prev, vehicle_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les véhicules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les véhicules</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.marque} {vehicle.modele} - {vehicle.immatriculation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="depart">Départ</SelectItem>
                  <SelectItem value="retour">Retour</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setFilters({ vehicle_id: '', type: '', search: '' })}
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des états des lieux */}
        <Card>
          <CardHeader>
            <CardTitle>
              États des lieux ({pagination.total} total{pagination.total > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : etatsDesLieux.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun état des lieux trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Véhicule</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Conducteur</TableHead>
                      <TableHead>Kilométrage</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Créé par</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {etatsDesLieux.map((etat) => (
                      <TableRow key={etat.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car size={16} className="text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {etat.vehicle.marque} {etat.vehicle.modele}
                              </div>
                              <div className="text-sm text-gray-500">
                                {etat.vehicle.immatriculation}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(etat.type)}>
                            {getTypeLabel(etat.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {etat.conducteur || (
                            <span className="text-gray-400">Non renseigné</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{etat.kilometrage.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">km</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500" />
                            {formatDate(etat.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500" />
                            {etat.user.first_name} {etat.user.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {etat.is_validated ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle size={14} className="mr-1" />
                              Validé
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle size={14} className="mr-1" />
                              En attente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedEtat(etat)}
                                >
                                  <Eye size={16} className="mr-1" />
                                  Voir
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    État des lieux - {selectedEtat?.vehicle.marque} {selectedEtat?.vehicle.modele}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedEtat && (
                                  <div className="space-y-6">
                                    {/* Informations générales */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <strong>Véhicule:</strong> {selectedEtat.vehicle.marque} {selectedEtat.vehicle.modele}
                                      </div>
                                      <div>
                                        <strong>Immatriculation:</strong> {selectedEtat.vehicle.immatriculation}
                                      </div>
                                      <div>
                                        <strong>Type:</strong> <Badge variant={getTypeBadgeVariant(selectedEtat.type)}>{getTypeLabel(selectedEtat.type)}</Badge>
                                      </div>
                                      <div>
                                        <strong>Kilométrage:</strong> {selectedEtat.kilometrage.toLocaleString()} km
                                      </div>
                                      <div>
                                        <strong>Conducteur:</strong> {selectedEtat.conducteur || 'Non renseigné'}
                                      </div>
                                      <div>
                                        <strong>Date:</strong> {formatDate(selectedEtat.created_at)}
                                      </div>
                                    </div>

                                    {selectedEtat.notes && (
                                      <div>
                                        <strong>Notes:</strong>
                                        <p className="mt-2 p-3 bg-gray-50 rounded">{selectedEtat.notes}</p>
                                      </div>
                                    )}

                                    {/* Photos */}
                                    {selectedEtat.photos && Object.keys(selectedEtat.photos).length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                          <Camera size={20} />
                                          Photos ({Object.keys(selectedEtat.photos).length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                          {Object.entries(selectedEtat.photos).map(([position, url]) => (
                                            <div key={position} className="space-y-2">
                                              <img
                                                src={url}
                                                alt={photoPositions[position as keyof typeof photoPositions]}
                                                className="w-full h-32 object-cover rounded border"
                                              />
                                              <p className="text-sm text-center font-medium">
                                                {photoPositions[position as keyof typeof photoPositions]}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {!selectedEtat.is_validated && (
                                      <div className="flex justify-end">
                                        <Button
                                          onClick={() => {
                                            handleValidate(selectedEtat.id);
                                            setSelectedEtat(null);
                                          }}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle size={16} className="mr-2" />
                                          Valider cet état des lieux
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {!etat.is_validated && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleValidate(etat.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Valider
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.current_page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                >
                  Précédent
                </Button>
                
                <span className="flex items-center px-4 py-2">
                  Page {pagination.current_page} sur {pagination.last_page}
                </span>
                
                <Button
                  variant="outline"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoriqueEtatDesLieux;