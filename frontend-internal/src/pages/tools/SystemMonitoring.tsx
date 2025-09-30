// SystemMonitoring.tsx - Monitoring système et logs FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, } from "recharts";
import { AlertTriangle, CheckCircle, XCircle, Activity, Cpu, HardDrive, Wifi, Search, RefreshCw, Download, Bell, Settings, Server, Database, Cloud, } from "lucide-react";

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  component: string;
  timestamp: string;
  resolved: boolean;
  affected_services: string[];
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  context?: Record<string, any>;
  user_id?: number;
  request_id?: string;
}

interface ServerMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  active_connections: number;
}

const SystemMonitoring: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [component, setComponent] = useState("all");

  // Données mockées pour la démonstration
  const mockAlerts: SystemAlert[] = [
    {
      id: "alert_1",
      level: "critical",
      title: "Haute utilisation CPU",
      message: "Le serveur principal dépasse 85% d'utilisation CPU depuis 10 minutes",
      component: "app-server-01",
      timestamp: "2024-07-28T14:30:15Z",
      resolved: false,
      affected_services: ["API", "Dashboard"],
    },
    {
      id: "alert_2",
      level: "warning",
      title: "Espace disque faible",
      message: "L'espace disque disponible est inférieur à 15% sur /var/log",
      component: "database-server",
      timestamp: "2024-07-28T13:45:22Z",
      resolved: false,
      affected_services: ["Database"],
    },
    {
      id: "alert_3",
      level: "info",
      title: "Maintenance programmée",
      message: "Maintenance de la base de données prévue dimanche à 02h00",
      component: "maintenance-scheduler",
      timestamp: "2024-07-28T12:00:00Z",
      resolved: true,
      affected_services: [],
    },
    {
      id: "alert_4",
      level: "error",
      title: "Échec de sauvegarde",
      message: "La sauvegarde automatique de 03h00 a échoué",
      component: "backup-service",
      timestamp: "2024-07-28T03:15:30Z",
      resolved: false,
      affected_services: ["Backup"],
    },
  ];

  const mockLogs: SystemLog[] = [
    {
      id: "log_1",
      timestamp: "2024-07-28T14:32:15Z",
      level: "error",
      component: "auth-service",
      message: "Tentative de connexion échouée pour l'utilisateur admin@example.com",
      context: { ip: "192.168.1.100", user_agent: "Mozilla/5.0" },
      user_id: 1,
      request_id: "req_abc123",
    },
    {
      id: "log_2",
      timestamp: "2024-07-28T14:31:45Z",
      level: "info",
      component: "api-gateway",
      message: "Nouvelle connexion API établie",
      context: { endpoint: "/api/vehicles", method: "GET" },
      request_id: "req_def456",
    },
    {
      id: "log_3",
      timestamp: "2024-07-28T14:30:22Z",
      level: "warning",
      component: "database",
      message: "Requête lente détectée (2.3s)",
      context: { query: "SELECT * FROM vehicles WHERE...", execution_time: 2.3 },
    },
    {
      id: "log_4",
      timestamp: "2024-07-28T14:28:10Z",
      level: "debug",
      component: "cache-service",
      message: "Cache invalidé pour la clé vehicle_list_tenant_123",
      context: { cache_key: "vehicle_list_tenant_123", ttl: 3600 },
    },
    {
      id: "log_5",
      timestamp: "2024-07-28T14:25:33Z",
      level: "critical",
      component: "payment-processor",
      message: "Échec du traitement de paiement",
      context: { transaction_id: "txn_789xyz", amount: 299.00, error: "Gateway timeout" },
    },
  ];

  const mockServerMetrics: ServerMetrics[] = [
    { timestamp: "14:00", cpu_usage: 45, memory_usage: 68, disk_usage: 78, network_in: 125, network_out: 89, active_connections: 234 },
    { timestamp: "14:05", cpu_usage: 52, memory_usage: 71, disk_usage: 78, network_in: 134, network_out: 95, active_connections: 245 },
    { timestamp: "14:10", cpu_usage: 48, memory_usage: 69, disk_usage: 79, network_in: 118, network_out: 82, active_connections: 221 },
    { timestamp: "14:15", cpu_usage: 61, memory_usage: 74, disk_usage: 79, network_in: 142, network_out: 108, active_connections: 267 },
    { timestamp: "14:20", cpu_usage: 73, memory_usage: 76, disk_usage: 80, network_in: 156, network_out: 115, active_connections: 289 },
    { timestamp: "14:25", cpu_usage: 67, memory_usage: 73, disk_usage: 80, network_in: 149, network_out: 112, active_connections: 278 },
    { timestamp: "14:30", cpu_usage: 84, memory_usage: 79, disk_usage: 81, network_in: 167, network_out: 125, active_connections: 312 },
  ];

  useEffect(() => {
    loadMonitoringData();
    
    // Mise à jour temps réel toutes les 30 secondes
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // Simulation d'appels API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAlerts(mockAlerts);
      setLogs(mockLogs);
      setServerMetrics(mockServerMetrics);
    } catch (error) {
      console.error("Erreur lors du chargement des données de monitoring:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Avertissement</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getLogBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">CRITICAL</Badge>;
      case 'error':
        return <Badge variant="destructive">ERROR</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">WARN</Badge>;
      case 'info':
        return <Badge variant="secondary">INFO</Badge>;
      case 'debug':
        return <Badge variant="outline">DEBUG</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.component.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesComponent = component === 'all' || log.component === component;
    
    return matchesSearch && matchesLevel && matchesComponent;
  });

  const criticalAlerts = alerts.filter(alert => alert.level === 'critical' && !alert.resolved);
  const activeAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Système</h1>
          <p className="text-gray-600">Surveillance en temps réel et journaux système FlotteQ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMonitoringData} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Configurer alertes
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter logs
          </Button>
        </div>
      </div>

      {/* Alertes critiques */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes Critiques ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium text-red-800">{alert.title}</div>
                    <div className="text-sm text-red-600">{alert.message}</div>
                    <div className="text-xs text-gray-500">{alert.component} • {formatTimestamp(alert.timestamp)}</div>
                  </div>
                  <Button size="sm" variant="outline">Résoudre</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques système en temps réel */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              CPU & Mémoire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={serverMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu_usage" stroke="#ef4444" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory_usage" stroke="#3b82f6" strokeWidth={2} name="Mémoire %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Réseau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={serverMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="network_in" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Entrant (MB/s)" />
                <Area type="monotone" dataKey="network_out" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Sortant (MB/s)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Connexions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={serverMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="active_connections" stroke="#8b5cf6" strokeWidth={2} name="Connexions actives" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alertes ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="logs">Journaux système</TabsTrigger>
          <TabsTrigger value="services">État des services</TabsTrigger>
        </TabsList>

        {/* Alertes */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertes système</CardTitle>
              <CardDescription>Surveillance et notifications des événements critiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${alert.resolved ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.level)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${alert.resolved ? 'line-through text-gray-500' : ''}`}>
                              {alert.title}
                            </span>
                            {getAlertBadge(alert.level)}
                            {alert.resolved && <Badge variant="outline">Résolu</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Server className="w-3 h-3" />
                              {alert.component}
                            </span>
                            <span>{formatTimestamp(alert.timestamp)}</span>
                            {alert.affected_services.length > 0 && (
                              <span>Services: {alert.affected_services.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Résoudre</Button>
                          <Button size="sm" variant="ghost">Ignorer</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journaux */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Journaux système</CardTitle>
              <CardDescription>Consultation des logs applicatifs et système</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtres */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher dans les logs..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={component} onValueChange={setComponent}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous composants</SelectItem>
                    <SelectItem value="auth-service">Auth Service</SelectItem>
                    <SelectItem value="api-gateway">API Gateway</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="cache-service">Cache Service</SelectItem>
                    <SelectItem value="payment-processor">Payment Processor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table des logs */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Timestamp</TableHead>
                      <TableHead className="w-24">Niveau</TableHead>
                      <TableHead className="w-32">Composant</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            {getLogBadge(log.level)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{log.component}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{log.message}</div>
                              {log.context && (
                                <div className="text-xs text-gray-500 font-mono">
                                  {JSON.stringify(log.context, null, 2).slice(0, 100)}...
                                </div>
                              )}
                              {log.request_id && (
                                <div className="text-xs text-blue-600">
                                  Request: {log.request_id}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">Détails</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "API Gateway", status: "healthy", uptime: "99.9%", response_time: "45ms" },
              { name: "Authentication Service", status: "healthy", uptime: "99.8%", response_time: "23ms" },
              { name: "Database Primary", status: "healthy", uptime: "100%", response_time: "12ms" },
              { name: "Database Replica", status: "warning", uptime: "98.5%", response_time: "89ms" },
              { name: "Cache Service", status: "healthy", uptime: "99.7%", response_time: "5ms" },
              { name: "Payment Processor", status: "error", uptime: "95.2%", response_time: "234ms" },
            ].map((service) => (
              <Card key={service.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {service.status === 'healthy' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {service.status === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    {service.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disponibilité</span>
                    <span className="font-medium">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Temps de réponse</span>
                    <span className="font-medium">{service.response_time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Statut</span>
                    <Badge 
                      variant={
                        service.status === 'healthy' ? 'default' : 
                        service.status === 'warning' ? 'secondary' : 'destructive'
                      }
                    >
                      {service.status === 'healthy' ? 'Opérationnel' : 
                       service.status === 'warning' ? 'Dégradé' : 'En panne'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoring; 