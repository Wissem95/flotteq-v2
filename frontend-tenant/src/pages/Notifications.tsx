
import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Bell, 
  Calendar, 
  Car, 
  Check, 
  CheckCircle, 
  Clock, 
  Filter,
  Search, 
  Settings, 
  Wrench,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  XCircle,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { notificationService, Notification, NotificationResponse } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";

const Notifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    urgent: 0,
    overdue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Charger les notifications au montage du composant
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response: NotificationResponse = await notificationService.getNotifications();
      setNotifications(response.notifications);
      setNotificationStats({
        total: response.total,
        urgent: response.urgent,
        overdue: response.overdue
      });
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      toast({
        title: "Succès",
        description: "Notification marquée comme lue",
      });
      // Recharger les notifications
      await loadNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Marquer toutes les notifications comme lues
      await Promise.all(
        notifications.map(notification => 
          notificationService.markAsRead(notification.id)
        )
      );
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
      await loadNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage global:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeInfo = notificationService.getStatusBadge(status);
    return <Badge className={badgeInfo.className}>{badgeInfo.label}</Badge>;
  };

  const renderStatusChangeNotification = (notification: Notification) => {
    const statusColors = {
      'active': 'bg-green-50 border-l-green-500 text-green-900',
      'en_maintenance': 'bg-orange-50 border-l-orange-500 text-orange-900',
      'hors_service': 'bg-red-50 border-l-red-500 text-red-900',
      'vendu': 'bg-blue-50 border-l-blue-500 text-blue-900',
      'en_reparation': 'bg-yellow-50 border-l-yellow-500 text-yellow-900'
    };

    const statusLabels = {
      'active': 'En Service',
      'en_maintenance': 'En Maintenance',
      'hors_service': 'Hors Service',
      'vendu': 'Vendu',
      'en_reparation': 'En Réparation'
    };

    const borderColor = statusColors[notification.new_status as keyof typeof statusColors] || 'bg-gray-50 border-l-gray-500';

    return (
      <div className={`p-4 rounded-md border-l-4 hover:bg-slate-50 transition-colors ${borderColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type, notification.priority, notification)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-lg font-semibold text-gray-900">{notification.message}</p>
                <Badge 
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    notification.new_status === 'active' ? 'bg-green-100 text-green-800' :
                    notification.new_status === 'en_maintenance' ? 'bg-orange-100 text-orange-800' :
                    notification.new_status === 'hors_service' ? 'bg-red-100 text-red-800' :
                    notification.new_status === 'vendu' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[notification.new_status as keyof typeof statusLabels] || notification.new_status}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Car size={14} className="mr-1" />
                <span className="font-medium">{notification.vehicle}</span>
                <span className="mx-2">•</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{notification.plate}</span>
                <span className="mx-2">•</span>
                <Clock size={14} className="mr-1" />
                <span>{notificationService.formatRelativeDate(notification.created)}</span>
              </div>
              
              {notification.reason && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md border-l-2 border-l-gray-300">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Raison:</span> {notification.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleMarkAsRead(notification.id)}
            className="ml-4 flex-shrink-0"
          >
            <Check size={14} className="mr-1" />
            Traiter
          </Button>
        </div>
      </div>
    );
  };

  const getNotificationIcon = (type: string, priority: string, notification?: Notification) => {
    const colorClass = notificationService.getPriorityColor(priority);

    switch (type) {
      case "ct":
        return <Calendar size={20} className={colorClass} />;
      case "maintenance":
        return <Wrench size={20} className={colorClass} />;
      case "insurance":
        return <CheckCircle size={20} className={colorClass} />;
      case "issue":
        return <AlertTriangle size={20} className={colorClass} />;
      case "document":
        return <Bell size={20} className={colorClass} />;
      case "status_change":
        // Icônes spécifiques selon le nouveau statut
        if (notification?.new_status === 'active') {
          return <ArrowUpCircle size={20} className="text-green-600" />;
        } else if (notification?.new_status === 'en_maintenance') {
          return <RotateCcw size={20} className="text-orange-600" />;
        } else if (notification?.new_status === 'hors_service') {
          return <XCircle size={20} className="text-red-600" />;
        } else if (notification?.new_status === 'vendu') {
          return <DollarSign size={20} className="text-blue-600" />;
        } else {
          return <ArrowDownCircle size={20} className={colorClass} />;
        }
      default:
        return <Bell size={20} className={colorClass} />;
    }
  };

  // Filtrage des notifications
  let filteredNotifications = notifications || [];

  // Filtrer par recherche
  filteredNotifications = notificationService.searchNotifications(filteredNotifications, searchTerm);

  // Filtrer par type
  filteredNotifications = notificationService.filterNotificationsByType(filteredNotifications, typeFilter);

  // Filtrer par onglet
  filteredNotifications = notificationService.filterNotificationsByStatus(filteredNotifications, tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input
            type="text"
            placeholder="Rechercher dans les notifications..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter size={16} className="mr-2" />
                Filtrer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                Tous les types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("ct")}>
                Contrôles techniques
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("maintenance")}>
                Entretiens
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("insurance")}>
                Assurances
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("issue")}>
                Problèmes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Settings size={16} className="mr-2" />
            Préférences
          </Button>
          
          <Button onClick={handleMarkAllAsRead} disabled={isLoading}>
            <Check size={16} className="mr-2" />
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="relative">
            Toutes
            <span className="ml-2 bg-slate-100 text-slate-700 text-xs rounded-full px-2 py-0.5">
              {notificationStats.total || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="urgent" className="relative">
            Urgentes
            <span className="ml-2 bg-red-100 text-red-700 text-xs rounded-full px-2 py-0.5">
              {(notificationStats.urgent || 0) + (notificationStats.overdue || 0)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="completed">Traitées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les notifications</CardTitle>
              <CardDescription>Vue d'ensemble des alertes et rappels</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Chargement des notifications...
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      notification.type === 'status_change' ? (
                        <div key={notification.id}>
                          {renderStatusChangeNotification(notification)}
                        </div>
                      ) : (
                        <div 
                          key={notification.id} 
                          className={`flex items-center p-4 rounded-md border hover:bg-slate-50 transition-colors ${
                            notification.status === "urgent" || notification.status === "overdue" 
                              ? "border-l-4 border-l-red-500" 
                              : "border-slate-100"
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            notificationService.getPriorityBackgroundColor(notification.priority)
                          }`}>
                            {getNotificationIcon(notification.type, notification.priority, notification)}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <p className="font-medium">{notification.message}</p>
                              <div className="ml-3">{getStatusBadge(notification.status)}</div>
                            </div>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                              <Car size={14} className="mr-1" />
                              <span>{notification.vehicle} • {notification.plate}</span>
                              <span className="mx-2">•</span>
                              <Clock size={14} className="mr-1" />
                              <span>{notificationService.formatRelativeDate(notification.dueDate)}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Traiter
                          </Button>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      {isLoading ? "Chargement..." : "Aucune notification ne correspond à votre recherche"}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="urgent">
          <Card>
            <CardHeader>
              <CardTitle>Notifications urgentes</CardTitle>
              <CardDescription>Alertes nécessitant une action rapide</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Chargement des notifications urgentes...
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      notification.type === 'status_change' ? (
                        <div key={notification.id}>
                          {renderStatusChangeNotification(notification)}
                        </div>
                      ) : (
                        <div 
                          key={notification.id} 
                          className="flex items-center p-4 rounded-md border-l-4 border-l-red-500 border hover:bg-slate-50 transition-colors"
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            notificationService.getPriorityBackgroundColor(notification.priority)
                          }`}>
                            {getNotificationIcon(notification.type, notification.priority, notification)}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <p className="font-medium">{notification.message}</p>
                              <div className="ml-3">{getStatusBadge(notification.status)}</div>
                            </div>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                              <Car size={14} className="mr-1" />
                              <span>{notification.vehicle} • {notification.plate}</span>
                              <span className="mx-2">•</span>
                              <Clock size={14} className="mr-1" />
                              <span>{notificationService.formatRelativeDate(notification.dueDate)}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Traiter
                          </Button>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Aucune notification urgente ne correspond à votre recherche
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Notifications à venir</CardTitle>
              <CardDescription>Rappels et échéances futures</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Chargement des notifications à venir...
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      notification.type === 'status_change' ? (
                        <div key={notification.id}>
                          {renderStatusChangeNotification(notification)}
                        </div>
                      ) : (
                        <div 
                          key={notification.id} 
                          className="flex items-center p-4 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            notificationService.getPriorityBackgroundColor(notification.priority)
                          }`}>
                            {getNotificationIcon(notification.type, notification.priority, notification)}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <p className="font-medium">{notification.message}</p>
                              <div className="ml-3">{getStatusBadge(notification.status)}</div>
                            </div>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                              <Car size={14} className="mr-1" />
                              <span>{notification.vehicle} • {notification.plate}</span>
                              <span className="mx-2">•</span>
                              <Clock size={14} className="mr-1" />
                              <span>{notificationService.formatRelativeDate(notification.dueDate)}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Voir détails
                          </Button>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Aucune notification à venir ne correspond à votre recherche
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Notifications traitées</CardTitle>
              <CardDescription>Alertes résolues</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Chargement des notifications traitées...
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  {filteredNotifications.length === 0 
                    ? "Vous n'avez aucune notification traitée" 
                    : "Toutes les notifications traitées sont affichées ci-dessus"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
