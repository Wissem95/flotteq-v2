import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Zap, Shield, Database, RefreshCw, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { alertsService, type SystemAlert } from '@/services/alertsService';
import AlertsModal from '@/components/modals/AlertsModal';

// Utilitaires sécurisés
import { safeArray, safeLength, safeFilter, safeMap } from '@/utils/safeData';

const SystemAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const alertsData = await alertsService.getAll();
      setAlerts(alertsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async (alert: SystemAlert) => {
    try {
      const investigationData = await alertsService.investigate(alert.id);
      
      // Mettre à jour la liste locale
      setAlerts(prev => 
        safeMap(prev, a => 
          a.id === alert.id 
            ? { ...a, status: 'investigating' as const }
            : a
        )
      );
      
      toast({
        title: "Investigation lancée",
        description: `Investigation de l'alerte "${alert.title}" en cours. ${safeLength(investigationData.recommendations)} recommandations trouvées.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lancer l'investigation",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    try {
      const refreshedAlerts = await alertsService.refresh();
      setAlerts(refreshedAlerts);
      toast({
        title: "Alertes actualisées",
        description: `${safeLength(refreshedAlerts)} alertes chargées`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les alertes",
        variant: "destructive"
      });
    }
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: SystemAlert['category']) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'system': return <AlertCircle className="h-4 w-4" />;
      case 'business': return <Database className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: SystemAlert['status']) => {
    const variants = {
      active: { variant: 'destructive' as const, text: 'Actif' },
      investigating: { variant: 'secondary' as const, text: 'En cours' },
      resolved: { variant: 'default' as const, text: 'Résolu' }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getTypeBadge = (type: SystemAlert['type']) => {
    const variants = {
      critical: { variant: 'destructive' as const, text: 'Critique' },
      warning: { variant: 'secondary' as const, text: 'Attention' },
      info: { variant: 'outline' as const, text: 'Info' }
    };
    
    const config = variants[type];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const alertCounts = {
    critical: safeLength(safeFilter(alerts, a => a.type === 'critical' && a.status === 'active')),
    warning: safeLength(safeFilter(alerts, a => a.type === 'warning' && a.status === 'active')),
    active: safeLength(safeFilter(alerts, a => a.status === 'active')),
    resolved: safeLength(safeFilter(alerts, a => a.status === 'resolved'))
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertes Système</h1>
          <p className="text-gray-600">Monitoring et surveillance de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAlertsModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurer Alertes
          </Button>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={alertCounts.critical > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertCounts.critical}</div>
            <p className="text-xs text-red-600">Nécessitent une action immédiate</p>
          </CardContent>
        </Card>

        <Card className={alertCounts.warning > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avertissements</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alertCounts.warning}</div>
            <p className="text-xs text-yellow-600">À surveiller</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCounts.active}</div>
            <p className="text-xs text-muted-foreground">En cours de traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues (24h)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alertCounts.resolved}</div>
            <p className="text-xs text-green-600">Problèmes résolus</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Journal des Alertes</CardTitle>
          <CardDescription>
            Historique complet des alertes système et de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Chargement des alertes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeMap(alerts, (alert) => (
                <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      {getTypeBadge(alert.type)}
                      {getStatusBadge(alert.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(alert.category)}
                        <span className="capitalize">{alert.category}</span>
                      </div>
                      <span>
                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                      </span>
                      {alert.resolved_at && (
                        <span className="text-green-600">
                          Résolu le {new Date(alert.resolved_at).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {alert.status === 'active' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleInvestigate(alert)}>
                          Enquêter
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAlertsModal(true)}>
                          Résoudre
                        </Button>
                      </div>
                    )}
                    {alert.status === 'investigating' && (
                      <Button size="sm" onClick={() => setShowAlertsModal(true)}>
                        Résoudre
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal des alertes */}
      <AlertsModal 
        isOpen={showAlertsModal} 
        onClose={() => setShowAlertsModal(false)}
        onRefresh={loadAlerts}
      />
    </div>
  );
};

export default SystemAlerts;