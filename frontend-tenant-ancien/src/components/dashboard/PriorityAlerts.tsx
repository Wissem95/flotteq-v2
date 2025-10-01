import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface AlertItem {
  id: number;
  vehicle_name: string;
  plate: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  status: string;
}

interface PriorityAlertsProps {
  alerts: AlertItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onTreatAlert?: (alertId: number) => void;
}

const PriorityAlerts: React.FC<PriorityAlertsProps> = ({
  alerts,
  isLoading = false,
  onViewAll,
  onTreatAlert,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes prioritaires</CardTitle>
        <CardDescription>Nécessitant une action immédiate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-slate-500">
              Chargement des alertes...
            </div>
          ) : alerts.length > 0 ? (
            <>
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center p-3 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium">{alert.vehicle_name}</p>
                    <p className="text-sm text-slate-500">{alert.plate} • {alert.issue}</p>
                  </div>
                  {onTreatAlert && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => onTreatAlert(alert.id)}
                    >
                      Traiter
                    </Button>
                  )}
                </div>
              ))}
              {onViewAll && (
                <Button 
                  variant="ghost" 
                  className="w-full border border-dashed mt-2 text-slate-500 hover:text-flotteq-blue"
                  onClick={onViewAll}
                >
                  Voir toutes les alertes
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Aucune alerte prioritaire
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorityAlerts;