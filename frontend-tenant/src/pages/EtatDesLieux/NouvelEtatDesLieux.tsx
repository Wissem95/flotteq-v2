import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Check, AlertCircle, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
  kilometrage?: number;
}

interface PhotoPosition {
  key: string;
  name: string;
  description: string;
  taken: boolean;
  file?: File;
  preview?: string;
}

const NouvelEtatDesLieux: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    type: 'depart',
    conducteur: '',
    kilometrage: '',
    notes: ''
  });

  const [photoPositions, setPhotoPositions] = useState<PhotoPosition[]>([
    { key: 'avant_droit', name: 'Avant Droit', description: 'Placez-vous à 45° de l\'avant droit, incluez le pare-chocs, l\'aile et une partie du capot', taken: false },
    { key: 'avant', name: 'Avant', description: 'Face avant complète', taken: false },
    { key: 'avant_gauche', name: 'Avant Gauche', description: 'Coin avant gauche du véhicule', taken: false },
    { key: 'arriere_gauche', name: 'Arrière Gauche', description: 'Coin arrière gauche du véhicule', taken: false },
    { key: 'arriere', name: 'Arrière', description: 'Face arrière complète', taken: false },
    { key: 'arriere_droit', name: 'Arrière Droit', description: 'Coin arrière droit du véhicule', taken: false },
    { key: 'interieur_avant', name: 'Intérieur Avant', description: 'Intérieur avant (sièges, tableau de bord)', taken: false },
    { key: 'interieur_arriere', name: 'Intérieur Arrière', description: 'Intérieur arrière (sièges, sols)', taken: false },
    { key: 'compteur', name: 'Compteur Kilométrique', description: 'Compteur de kilométrage', taken: false }
  ]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les véhicules",
        variant: "destructive"
      });
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id.toString() === vehicleId);
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicleId,
      kilometrage: vehicle?.kilometrage?.toString() || ''
    }));
  };

  const handlePhotoCapture = (index: number, file: File) => {
    const newPositions = [...photoPositions];
    newPositions[index] = {
      ...newPositions[index],
      taken: true,
      file,
      preview: URL.createObjectURL(file)
    };
    setPhotoPositions(newPositions);

    // Passer automatiquement à la photo suivante
    if (index < photoPositions.length - 1) {
      setCurrentPhotoIndex(index + 1);
    }
  };

  const handleFileInput = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePhotoCapture(index, file);
    }
  };

  const removePhoto = (index: number) => {
    const newPositions = [...photoPositions];
    if (newPositions[index].preview) {
      URL.revokeObjectURL(newPositions[index].preview!);
    }
    newPositions[index] = {
      ...newPositions[index],
      taken: false,
      file: undefined,
      preview: undefined
    };
    setPhotoPositions(newPositions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicle_id || !formData.kilometrage) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const takenPhotos = photoPositions.filter(p => p.taken);
    if (takenPhotos.length < 9) {
      toast({
        title: "Photos manquantes",
        description: `Vous devez prendre les 9 photos obligatoires (${takenPhotos.length}/9)`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('vehicle_id', formData.vehicle_id);
      submitData.append('type', formData.type);
      submitData.append('conducteur', formData.conducteur);
      submitData.append('kilometrage', formData.kilometrage);
      submitData.append('notes', formData.notes);

      // Ajouter les photos
      photoPositions.forEach(position => {
        if (position.file) {
          submitData.append(`photos[${position.key}]`, position.file);
        }
      });

      await api.post('/etat-des-lieux', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Succès",
        description: "État des lieux créé avec succès"
      });

      navigate('/etat-des-lieux/historique');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la création",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
  const takenPhotosCount = photoPositions.filter(p => p.taken).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nouvel État des Lieux</h1>
          <Button variant="outline" onClick={() => navigate('/etat-des-lieux/historique')}>
            Retour à l'historique
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle_id">Véhicule *</Label>
                  <Select value={formData.vehicle_id} onValueChange={handleVehicleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.marque} {vehicle.modele} - {vehicle.immatriculation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type d'état des lieux</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="depart">Départ</SelectItem>
                      <SelectItem value="retour">Retour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="conducteur">Nom du conducteur</Label>
                  <Input
                    id="conducteur"
                    value={formData.conducteur}
                    onChange={(e) => setFormData(prev => ({ ...prev, conducteur: e.target.value }))}
                    placeholder="Nom du conducteur"
                  />
                </div>

                <div>
                  <Label htmlFor="kilometrage">Kilométrage actuel *</Label>
                  <Input
                    id="kilometrage"
                    type="number"
                    value={formData.kilometrage}
                    onChange={(e) => setFormData(prev => ({ ...prev, kilometrage: e.target.value }))}
                    placeholder="Kilométrage"
                    min="0"
                  />
                  {selectedVehicle && selectedVehicle.kilometrage && (
                    <p className="text-sm text-gray-500 mt-1">
                      Dernier kilométrage enregistré: {selectedVehicle.kilometrage} km
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observations particulières..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos du véhicule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Photos du Véhicule
                <Badge variant={takenPhotosCount === 9 ? "default" : "secondary"}>
                  {takenPhotosCount}/9 photos obligatoires
                </Badge>
              </CardTitle>
              <p className="text-gray-600">
                Prenez une photo de chaque angle du véhicule, de l'intérieur et du compteur. 
                Validez ou reprenez chaque photo.
              </p>
            </CardHeader>
            <CardContent>
              {/* Vue actuelle de la photo */}
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Position: {photoPositions[currentPhotoIndex]?.name}</h3>
                  <p className="text-gray-600">{photoPositions[currentPhotoIndex]?.description}</p>
                </div>

                {photoPositions[currentPhotoIndex]?.preview ? (
                  <div className="space-y-4">
                    <img 
                      src={photoPositions[currentPhotoIndex].preview} 
                      alt={photoPositions[currentPhotoIndex].name}
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removePhoto(currentPhotoIndex)}
                      >
                        <X size={16} className="mr-2" />
                        Reprendre
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (currentPhotoIndex < photoPositions.length - 1) {
                            setCurrentPhotoIndex(currentPhotoIndex + 1);
                          }
                        }}
                        disabled={currentPhotoIndex >= photoPositions.length - 1}
                      >
                        <Check size={16} className="mr-2" />
                        Suivant
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera size={48} className="mx-auto text-gray-400" />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileInput(currentPhotoIndex, e)}
                        className="hidden"
                        id={`photo-input-${currentPhotoIndex}`}
                      />
                      <label htmlFor={`photo-input-${currentPhotoIndex}`}>
                        <Button type="button" asChild>
                          <span>
                            <Upload size={16} className="mr-2" />
                            Prendre la photo
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Grille des photos */}
              <div className="grid grid-cols-3 gap-4">
                {photoPositions.map((position, index) => (
                  <div
                    key={position.key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      index === currentPhotoIndex 
                        ? 'border-blue-500 bg-blue-50' 
                        : position.taken 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{position.name}</span>
                      {position.taken && <Check size={16} className="text-green-600" />}
                    </div>
                    {position.preview && (
                      <img 
                        src={position.preview} 
                        alt={position.name}
                        className="w-full h-20 object-cover rounded"
                      />
                    )}
                    {!position.taken && (
                      <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                        <Camera size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/etat-des-lieux/historique')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || takenPhotosCount < 9}
              className="min-w-[200px]"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder l'État des Lieux"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouvelEtatDesLieux;