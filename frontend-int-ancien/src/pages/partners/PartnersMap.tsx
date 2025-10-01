// PartnersMap.tsx - Carte interactive des partenaires FlotteQ

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Search,
  Filter,
  Layers,
  Navigation,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  Shield,
  Zap,
} from "lucide-react";
import { partnersService } from "@/services/partnersService";

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface Partner {
  id: number;
  name: string;
  type: 'garage' | 'controle_technique' | 'assurance';
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  services?: string[];
  pricing?: Record<string, number>;
  availability?: Record<string, string[]>;
  rating: number;
  rating_count: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

const PartnersMap: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [viewport, setViewport] = useState<MapViewport>({
    latitude: 46.603354,
    longitude: 1.888334,
    zoom: 6
  });


  useEffect(() => {
    loadPartners();
  }, [typeFilter, statusFilter, searchTerm]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter as 'garage' | 'controle_technique' | 'assurance',
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        per_page: 100, // Get all partners for map display
      };

      const response = await partnersService.getPartners(1, 100, filters);
      setPartners(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques pour le sidebar
  const stats = useMemo(() => {
    const total = partners.length;
    const byType = partners.reduce((acc, partner) => {
      acc[partner.type] = (acc[partner.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = partners.reduce((acc, partner) => {
      const status = partner.is_active ? 'active' : 'inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byType, byStatus };
  }, [partners]);

  const getStatusBadge = (partner: Partner) => {
    if (!partner.is_active) {
      return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactif</Badge>;
    }
    if (!partner.is_verified) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
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
        return null;
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

  const handlePartnerClick = (partner: Partner) => {
    setSelectedPartner(partner);
    if (partner.latitude && partner.longitude) {
      setViewport({
        latitude: partner.latitude,
        longitude: partner.longitude,
        zoom: 12
      });
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Sidebar avec filtres et liste */}
      <div className="w-96 flex flex-col gap-4">
        {/* Header et filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Carte des Partenaires
            </CardTitle>
            <CardDescription>
              Localisation géographique de tous vos partenaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou ville..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="garage">Garages</SelectItem>
                  <SelectItem value="controle_technique">CT</SelectItem>
                  <SelectItem value="assurance">Assurances</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-800">{stats.total}</div>
                <div className="text-blue-600">Total</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-800">{stats.byStatus.active || 0}</div>
                <div className="text-green-600">Actifs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des partenaires */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Partenaires ({partners.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3 p-3 border-b">
                      <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPartner?.id === partner.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handlePartnerClick(partner)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(partner.type)}
                          <span className="font-medium text-sm">{partner.name}</span>
                        </div>
                        {getStatusBadge(partner)}
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{partner.city}, {partner.postal_code}</span>
                        </div>
                        {partner.rating_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{partner.rating.toFixed(1)} ({partner.rating_count} avis)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {partners.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucun partenaire trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte principale */}
      <div className="flex-1 relative">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            {/* Placeholder pour la carte - remplacer par une vraie carte OpenStreetMap */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden rounded-lg">
              {/* Simulation d'une carte */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                  {/* Lignes de grid pour simuler une carte */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ccc" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Marqueurs des partenaires */}
              {partners.map((partner) => {
                if (!partner.latitude || !partner.longitude) return null;
                
                // Conversion simplifiée des coordonnées en position sur la carte
                const x = ((partner.longitude + 5) / 10) * 100;
                const y = ((52 - partner.latitude) / 10) * 100;
                
                return (
                  <div
                    key={partner.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      selectedPartner?.id === partner.id ? 'scale-125 z-10' : 'hover:scale-110'
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => handlePartnerClick(partner)}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                      partner.type === 'garage' ? 'bg-blue-500' :
                      partner.type === 'controle_technique' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {partner.type === 'garage' ? <Wrench className="w-4 h-4 text-white" /> :
                       partner.type === 'controle_technique' ? <CheckCircle className="w-4 h-4 text-white" /> :
                       <Shield className="w-4 h-4 text-white" />}
                    </div>
                    
                    {/* Tooltip */}
                    {selectedPartner?.id === partner.id && (
                      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-3 min-w-64 z-20">
                        <div className="font-medium mb-1">{partner.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{getTypeLabel(partner.type)}</div>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{partner.address}, {partner.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{partner.phone}</span>
                          </div>
                          {partner.rating_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span>{partner.rating.toFixed(1)}/5 ({partner.rating_count} avis)</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          {getStatusBadge(partner)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Contrôles de carte */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border">
                <div className="p-2 space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Layers className="w-4 h-4 mr-2" />
                    Layers
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Navigation className="w-4 h-4 mr-2" />
                    Centrer
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Clusters
                  </Button>
                </div>
              </div>

              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border p-3">
                <div className="font-medium text-sm mb-2">Légende</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Wrench className="w-2 h-2 text-white" />
                    </div>
                    <span>Garages ({stats.byType.garage || 0})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </div>
                    <span>Contrôle technique ({stats.byType.controle_technique || 0})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <Shield className="w-2 h-2 text-white" />
                    </div>
                    <span>Assurances ({stats.byType.assurance || 0})</span>
                  </div>
                </div>
              </div>

              {/* Info sur la carte simulée */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-500 bg-white/80 rounded-lg p-4">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Carte interactive simulée</div>
                <div className="text-sm">Intégration OpenStreetMap à venir</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnersMap; 