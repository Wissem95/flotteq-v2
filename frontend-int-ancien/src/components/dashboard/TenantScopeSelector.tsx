// components/dashboard/TenantScopeSelector.tsx - Sélecteur de scope tenant/global

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Building, Users, Car, CheckCircle, XCircle } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  is_active: boolean;
  users_count: number;
  vehicles_count: number;
  display_label: string;
  status_label: string;
}

interface TenantScopeSelectorProps {
  value: string | null;
  onChange: (tenantId: string | null) => void;
  tenants: Tenant[];
  loading?: boolean;
  className?: string;
}

export default function TenantScopeSelector({ 
  value, 
  onChange, 
  tenants = [], 
  loading = false,
  className = "" 
}: TenantScopeSelectorProps) {
  
  // Trouver le tenant sélectionné
  const selectedTenant = value ? tenants.find(t => t.id === value) : null;
  
  // Handler pour le changement de valeur
  const handleValueChange = (newValue: string) => {
    onChange(newValue === 'global' ? null : newValue);
  };

  // Calculer les statistiques rapides des tenants
  const tenantsStats = {
    total: tenants.length,
    active: tenants.filter(t => t.is_active).length,
    totalVehicles: tenants.reduce((sum, t) => sum + t.vehicles_count, 0),
    totalUsers: tenants.reduce((sum, t) => sum + t.users_count, 0)
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-10 w-[300px] bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Select
        value={value || 'global'}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-[350px] h-11">
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <Building className="h-4 w-4 text-green-600" />
                <span className="font-medium">Tenant:</span>
                <span className="text-green-700">{selectedTenant?.name}</span>
                {selectedTenant && !selectedTenant.is_active && (
                  <Badge variant="destructive" className="text-xs">Inactif</Badge>
                )}
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">Vue Globale</span>
              </>
            )}
          </div>
        </SelectTrigger>
        
        <SelectContent className="w-[400px]">
          {/* Option Vue Globale */}
          <SelectItem value="global" className="py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-blue-800">Vue Globale</div>
                  <div className="text-sm text-muted-foreground">
                    Toutes les données de la plateforme
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Building className="h-3 w-3 mr-1" />
                  {tenantsStats.total} tenants
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Car className="h-3 w-3 mr-1" />
                  {tenantsStats.totalVehicles} véhicules
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {tenantsStats.totalUsers} utilisateurs
                </Badge>
              </div>
            </div>
          </SelectItem>
          
          {tenants.length > 0 && (
            <>
              <div className="my-2 border-t" />
              <div className="px-2 py-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Tenants ({tenantsStats.active} actifs sur {tenantsStats.total})
              </div>
            </>
          )}
          
          {/* Liste des tenants */}
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id} className="py-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-green-800 truncate">
                        {tenant.name}
                      </div>
                      {tenant.is_active ? (
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {tenant.domain ? `${tenant.domain}` : 'Pas de domaine'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    <Car className="h-3 w-3 mr-1" />
                    {tenant.vehicles_count}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {tenant.users_count}
                  </Badge>
                  {!tenant.is_active && (
                    <Badge variant="destructive" className="text-xs">
                      Inactif
                    </Badge>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}

          {tenants.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Aucun tenant trouvé</div>
              <div className="text-xs">La liste des tenants est vide</div>
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Informations supplémentaires du tenant sélectionné */}
      {selectedTenant && (
        <div className="flex gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs">
            <Car className="h-3 w-3 mr-1" />
            {selectedTenant.vehicles_count} véhicules
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {selectedTenant.users_count} utilisateurs
          </Badge>
          <Badge 
            variant={selectedTenant.is_active ? "default" : "destructive"}
            className="text-xs"
          >
            {selectedTenant.status_label}
          </Badge>
        </div>
      )}
      
      {/* Indicateur global */}
      {!selectedTenant && (
        <div className="flex gap-2 flex-shrink-0">
          <Badge variant="secondary" className="text-xs">
            <Building className="h-3 w-3 mr-1" />
            {tenantsStats.total} tenants
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Car className="h-3 w-3 mr-1" />
            {tenantsStats.totalVehicles} véhicules
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {tenantsStats.totalUsers} utilisateurs
          </Badge>
        </div>
      )}
    </div>
  );
}