import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Wrench, AlertTriangle, Calendar, Clock } from "lucide-react";

interface Event {
  id: string;
  type: 'vehicle_added' | 'maintenance_completed' | 'alert_created' | 'ct_scheduled';
  title: string;
  description: string;
  timestamp: string;
  vehicleName?: string;
  vehiclePlate?: string;
}

interface RecentEventsProps {
  events: Event[];
  isLoading?: boolean;
}

const RecentEvents: React.FC<RecentEventsProps> = ({
  events,
  isLoading = false,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vehicle_added':
        return <Car size={16} className="text-blue-500" />;
      case 'maintenance_completed':
        return <Wrench size={16} className="text-green-500" />;
      case 'alert_created':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'ct_scheduled':
        return <Calendar size={16} className="text-amber-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'vehicle_added':
        return 'default';
      case 'maintenance_completed':
        return 'default';
      case 'alert_created':
        return 'destructive';
      case 'ct_scheduled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return `Il y a ${diffDays}j`;
    }
  };

  const filterEventsByType = (type?: string) => {
    if (!type || type === 'all') return events;
    return events.filter(event => event.type === type);
  };

  const recentVehicles = events
    .filter(event => event.type === 'vehicle_added')
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flux d'activité</CardTitle>
          <CardDescription>Derniers événements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            Chargement des événements...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flux d'activité principal */}
      <Card>
        <CardHeader>
          <CardTitle>Flux d'activité</CardTitle>
          <CardDescription>Chronologie des actions récentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="ct_scheduled">CT</TabsTrigger>
              <TabsTrigger value="maintenance_completed">Maintenance</TabsTrigger>
              <TabsTrigger value="vehicle_added">Véhicules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{event.title}</p>
                          <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                            {formatTimestamp(event.timestamp)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                        {event.vehicleName && (
                          <p className="text-xs text-slate-400 mt-1">
                            {event.vehicleName} • {event.vehiclePlate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucun événement récent
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="urgent" className="mt-4">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {filterEventsByType('alert_created').length > 0 ? (
                  filterEventsByType('alert_created').map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{event.title}</p>
                          <Badge variant="destructive" className="text-xs">
                            {formatTimestamp(event.timestamp)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucune alerte urgente
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ct_scheduled" className="mt-4">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {filterEventsByType('ct_scheduled').length > 0 ? (
                  filterEventsByType('ct_scheduled').map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{event.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {formatTimestamp(event.timestamp)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucun contrôle technique programmé
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance_completed" className="mt-4">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {filterEventsByType('maintenance_completed').map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{event.title}</p>
                        <Badge variant="default" className="text-xs">
                          {formatTimestamp(event.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="vehicle_added" className="mt-4">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {filterEventsByType('vehicle_added').map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{event.title}</p>
                        <Badge variant="default" className="text-xs">
                          {formatTimestamp(event.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Véhicules récents */}
      {recentVehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Véhicules récents</CardTitle>
            <CardDescription>Derniers véhicules ajoutés à la flotte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Car className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{vehicle.vehicleName}</p>
                      <p className="text-xs text-slate-500">{vehicle.vehiclePlate}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Ajouté {formatTimestamp(vehicle.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecentEvents;