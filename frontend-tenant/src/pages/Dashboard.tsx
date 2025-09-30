// Clients/src/pages/Dashboard.tsx

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Car, 
  Euro, 
  ChevronDown
} from "lucide-react";
import FleetStatus from "./FleetStatus";
import FinancialStatus from "./FinancialStatus";

const Dashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'fleet' | 'financial'>('fleet');

  const handleViewChange = (view: 'fleet' | 'financial') => {
    setSelectedView(view);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de vue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de votre flotte et finances</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {selectedView === 'fleet' ? (
                <>
                  <Car size={16} />
                  État de la flotte
                </>
              ) : (
                <>
                  <Euro size={16} />
                  État financier
                </>
              )}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              onClick={() => handleViewChange('fleet')}
              className="gap-2 cursor-pointer"
            >
              <Car size={16} />
              État de la flotte
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleViewChange('financial')}
              className="gap-2 cursor-pointer"
            >
              <Euro size={16} />
              État financier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation par cartes (optionnelle) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card 
          className={`cursor-pointer transition-all border-2 ${
            selectedView === 'fleet' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleViewChange('fleet')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                selectedView === 'fleet' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Car size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">État de la flotte</h3>
                <p className="text-sm text-gray-600">Suivi des véhicules, maintenances et alertes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-2 ${
            selectedView === 'financial' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleViewChange('financial')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                selectedView === 'financial' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Euro size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">État financier</h3>
                <p className="text-sm text-gray-600">Coûts, dépenses et analyse financière</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu dynamique */}
      <div className="min-h-screen">
        {selectedView === 'fleet' && <FleetStatus />}
        {selectedView === 'financial' && <FinancialStatus />}
      </div>
    </div>
  );
};

export default Dashboard;
