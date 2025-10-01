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
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Star,
  Calendar,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { partnersService } from '@/services/partnersService';
import { toast } from '@/components/ui/use-toast';

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

const ControleTechniqueOverview: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    avgRating: 0,
  });

  useEffect(() => {
    loadCentresCT();
    loadStats();
  }, [currentPage, searchTerm, statusFilter]);

  const loadCentresCT = async () => {
    try {
      setLoading(true);
      const filters = {
        type: 'controle_technique' as const,
        search: searchTerm || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        is_verified: statusFilter === 'verified' ? true : undefined,
        page: currentPage,
        per_page: 15,
      };

      const response = await partnersService.getPartners(currentPage, 15, filters);
      setPartners(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erreur lors du chargement des centres CT:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les centres de contrôle technique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await partnersService.getPartnerStats();
      setStats({
        total: response.total_partners,
        active: response.active_partners,
        verified: response.verified_partners,
        avgRating: response.average_rating || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleToggleStatus = async (partnerId: number, isActive: boolean) => {
    try {
      await partnersService.togglePartnerStatus(partnerId, !isActive);
      toast({
        title: 'Succès',
        description: `Centre CT ${!isActive ? 'activé' : 'désactivé'} avec succès`,
      });
      loadCentresCT();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVerification = async (partnerId: number, isVerified: boolean) => {
    try {
      await partnersService.togglePartnerVerification(partnerId, !isVerified);
      toast({
        title: 'Succès',
        description: `Centre CT ${!isVerified ? 'vérifié' : 'non vérifié'} avec succès`,
      });
      loadCentresCT();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la vérification',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (partner: Partner) => {
    if (!partner.is_active) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Inactif</Badge>;
    }
    if (!partner.is_verified) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
    return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Agréé</Badge>;
  };

  const formatServices = (services?: string[]) => {
    if (!services || services.length === 0) return 'Aucun service';
    const displayed = services.slice(0, 2).join(', ');
    return services.length > 2 ? `${displayed} +${services.length - 2}` : displayed;
  };

  const formatPricing = (pricing?: Record<string, number>) => {
    if (!pricing) return 'Non renseigné';
    if (pricing.controle_technique) {
      return `${pricing.controle_technique}€`;
    }
    return 'Nous consulter';
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Centres de Contrôle Technique
          </h1>
          <p className="text-gray-600">Gestion des centres de contrôle technique partenaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Carte des centres
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un centre CT
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Centres</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agréés</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un centre CT (nom, ville, services)..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs seulement</SelectItem>
                <SelectItem value="inactive">Inactifs seulement</SelectItem>
                <SelectItem value="verified">Agréés seulement</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des centres CT */}
      <Card>
        <CardHeader>
          <CardTitle>Centres de Contrôle Technique ({partners.length})</CardTitle>
          <CardDescription>
            Gérez tous vos centres de contrôle technique partenaires depuis cette interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre CT</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Tarifs</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Évaluation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          {partner.description && (
                            <div className="text-sm text-gray-600 truncate max-w-[200px]">
                              {partner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <div className="text-sm">
                          <div>{partner.city}</div>
                          <div className="text-gray-500">{partner.postal_code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatServices(partner.services)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatPricing(partner.pricing)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {partner.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[150px]">{partner.email}</span>
                          </div>
                        )}
                        {partner.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{partner.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(partner)}
                    </TableCell>
                    <TableCell>
                      {partner.rating_count > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">
                            {partner.rating.toFixed(1)} ({partner.rating_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Aucune note</span>
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
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Disponibilités
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="w-4 h-4 mr-2" />
                            Voir sur la carte
                          </DropdownMenuItem>
                          {partner.website && (
                            <DropdownMenuItem onClick={() => window.open(partner.website, '_blank')}>
                              <Globe className="w-4 h-4 mr-2" />
                              Visiter le site
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(partner.id, partner.is_active)}
                          >
                            {partner.is_active ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleVerification(partner.id, partner.is_verified)}
                          >
                            {partner.is_verified ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Retirer agrément
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accorder agrément
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {partners.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-900 mb-2">
                Aucun centre CT trouvé
              </div>
              <div className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par ajouter votre premier centre de contrôle technique partenaire'
                }
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un centre CT
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default ControleTechniqueOverview;