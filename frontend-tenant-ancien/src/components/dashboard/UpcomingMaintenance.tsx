import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, ArrowRight } from "lucide-react";

interface MaintenanceItem {
  id: number;
  vehicle_name: string;
  plate: string;
  type: string;
  scheduled_date: string;
  status: string;
}

interface UpcomingMaintenanceProps {
  maintenances: MaintenanceItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

const UpcomingMaintenance: React.FC<UpcomingMaintenanceProps> = ({
  maintenances,
  isLoading = false,
  onViewAll,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Calendar size={20} />;
      case 'pending':
        return <Clock size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-sky-100 text-sky-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return 'Terminé';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning des entretiens (7 prochains jours)</CardTitle>
        <CardDescription>Interventions programmées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-slate-500">
              Chargement des entretiens...
            </div>
          ) : maintenances.length > 0 ? (
            <>
              {maintenances.map((maintenance) => (
                <div 
                  key={maintenance.id} 
                  className="flex items-center p-3 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(maintenance.status)}`}>
                    {getStatusIcon(maintenance.status)}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium">{maintenance.vehicle_name}</p>
                    <p className="text-sm text-slate-500">
                      {maintenance.plate} • {maintenance.type}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(maintenance.status)}`}>
                        {getStatusText(maintenance.status)}
                      </span>
                    </p>
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    {formatDate(maintenance.scheduled_date)}
                  </div>
                </div>
              ))}
              {onViewAll && (
                <Button 
                  variant="ghost" 
                  className="w-full border border-dashed mt-2 text-slate-500 hover:text-flotteq-blue"
                  onClick={onViewAll}
                >
                  Voir tous les entretiens
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Aucune maintenance programmée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMaintenance;