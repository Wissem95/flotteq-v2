
import React, { useState } from "react";
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
  Wrench
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

// Sample notification data
const notificationsData = [
  { 
    id: "n1", 
    type: "ct", 
    vehicle: "Renault Clio", 
    plate: "AB-123-CD", 
    message: "Contrôle technique à effectuer", 
    dueDate: "2023-12-15", 
    status: "upcoming", 
    priority: "high",
    created: "2023-11-15"
  },
  { 
    id: "n2", 
    type: "maintenance", 
    vehicle: "Peugeot 308", 
    plate: "EF-456-GH", 
    message: "Entretien programmé", 
    dueDate: "2023-11-20", 
    status: "urgent", 
    priority: "high",
    created: "2023-11-01"
  },
  { 
    id: "n3", 
    type: "insurance", 
    vehicle: "Citroën C3", 
    plate: "IJ-789-KL", 
    message: "Renouvellement d'assurance", 
    dueDate: "2023-12-31", 
    status: "upcoming", 
    priority: "medium",
    created: "2023-11-10"
  },
  { 
    id: "n4", 
    type: "issue", 
    vehicle: "Ford Focus", 
    plate: "MN-012-OP", 
    message: "Problème signalé : système de freinage", 
    dueDate: "2023-11-18", 
    status: "urgent", 
    priority: "critical",
    created: "2023-11-17"
  },
  { 
    id: "n5", 
    type: "maintenance", 
    vehicle: "Volkswagen Golf", 
    plate: "QR-345-ST", 
    message: "Vidange à prévoir", 
    dueDate: "2023-12-10", 
    status: "upcoming", 
    priority: "medium",
    created: "2023-11-05"
  },
  { 
    id: "n6", 
    type: "ct", 
    vehicle: "Toyota Yaris", 
    plate: "UV-678-WX", 
    message: "Contrôle technique expiré", 
    dueDate: "2023-09-30", 
    status: "overdue", 
    priority: "critical",
    created: "2023-09-15"
  },
  { 
    id: "n7", 
    type: "document", 
    vehicle: "Renault Clio", 
    plate: "AB-123-CD", 
    message: "Mise à jour carte grise", 
    dueDate: "2023-12-20", 
    status: "upcoming", 
    priority: "low",
    created: "2023-11-12"
  },
];

const Notifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("all");
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Expiré depuis ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Demain";
    } else if (diffDays <= 7) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays <= 30) {
      return `Dans ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    } else {
      return formatDate(dateString);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-sky-100 text-sky-700">À venir</Badge>;
      case "urgent":
        return <Badge className="bg-amber-100 text-amber-700">Urgent</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700">En retard</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Traité</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const getColorClass = () => {
      switch (priority) {
        case "critical":
          return "text-red-600";
        case "high":
          return "text-amber-600";
        case "medium":
          return "text-sky-600";
        case "low":
          return "text-slate-600";
        default:
          return "text-slate-600";
      }
    };

    const colorClass = getColorClass();

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
      default:
        return <Bell size={20} className={colorClass} />;
    }
  };

  const filteredNotifications = notificationsData.filter(notification => {
    const matchesSearch = 
      notification.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) || 
      notification.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      tab === "all" || 
      (tab === "urgent" && (notification.status === "urgent" || notification.status === "overdue")) ||
      (tab === "upcoming" && notification.status === "upcoming") ||
      (tab === "completed" && notification.status === "completed");
    
    return matchesSearch && matchesTab;
  });

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
              <DropdownMenuItem>Tous les véhicules</DropdownMenuItem>
              <DropdownMenuItem>Contrôles techniques</DropdownMenuItem>
              <DropdownMenuItem>Entretiens</DropdownMenuItem>
              <DropdownMenuItem>Assurances</DropdownMenuItem>
              <DropdownMenuItem>Problèmes</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Settings size={16} className="mr-2" />
            Préférences
          </Button>
          
          <Button>
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
              {notificationsData.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="urgent" className="relative">
            Urgentes
            <span className="ml-2 bg-red-100 text-red-700 text-xs rounded-full px-2 py-0.5">
              {notificationsData.filter(n => n.status === "urgent" || n.status === "overdue").length}
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
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-center p-4 rounded-md border hover:bg-slate-50 transition-colors ${
                        notification.status === "urgent" || notification.status === "overdue" 
                          ? "border-l-4 border-l-red-500" 
                          : "border-slate-100"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        notification.priority === "critical" ? "bg-red-100" :
                        notification.priority === "high" ? "bg-amber-100" :
                        notification.priority === "medium" ? "bg-sky-100" : "bg-slate-100"
                      }`}>
                        {getNotificationIcon(notification.type, notification.priority)}
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
                          <span>{formatRelativeDate(notification.dueDate)}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Traiter
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucune notification ne correspond à votre recherche
                  </div>
                )}
              </div>
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
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="flex items-center p-4 rounded-md border-l-4 border-l-red-500 border hover:bg-slate-50 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        notification.priority === "critical" ? "bg-red-100" : "bg-amber-100"
                      }`}>
                        {getNotificationIcon(notification.type, notification.priority)}
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
                          <span>{formatRelativeDate(notification.dueDate)}</span>
                        </div>
                      </div>
                      <Button size="sm">
                        Traiter
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucune notification urgente ne correspond à votre recherche
                  </div>
                )}
              </div>
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
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="flex items-center p-4 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type, notification.priority)}
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
                          <span>{formatRelativeDate(notification.dueDate)}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucune notification à venir ne correspond à votre recherche
                  </div>
                )}
              </div>
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
              <div className="text-center py-8 text-slate-500">
                Vous n'avez aucune notification traitée
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
