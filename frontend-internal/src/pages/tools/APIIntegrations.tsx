// APIIntegrations.tsx - Gestion des intégrations API externes FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreHorizontal, Key, Globe, Zap, CheckCircle, XCircle, AlertTriangle, Play, Pause, Eye, Copy, } from "lucide-react";

// Utilitaires sécurisés
import { safeArray, safeLength, safeMap, safeSlice } from '@/utils/safeData';

interface APIKey {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  created_at: string;
  last_used: string | null;
  status: 'active' | 'inactive' | 'revoked';
  usage_count: number;
  rate_limit: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  last_triggered: string | null;
  success_count: number;
  failure_count: number;
  created_at: string;
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'sms' | 'email' | 'mapping' | 'analytics' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  last_sync: string | null;
  description: string;
}

const APIIntegrations: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showCreateWebhookModal, setShowCreateWebhookModal] = useState(false);

  // Données mockées
  const mockApiKeys: APIKey[] = [
    {
      id: "key_1",
      name: "Production API",
      key: "fq_live_sk_1a2b3c4d5e6f7g8h9i0j",
      description: "Clé API principale pour l'environnement de production",
      permissions: ["read", "write", "admin"],
      created_at: "2024-01-15T10:30:00Z",
      last_used: "2024-07-28T14:25:30Z",
      status: "active",
      usage_count: 15847,
      rate_limit: 1000,
    },
    {
      id: "key_2",
      name: "Mobile App API",
      key: "fq_live_sk_2b3c4d5e6f7g8h9i0j1k",
      description: "Clé API pour l'application mobile FlotteQ",
      permissions: ["read", "write"],
      created_at: "2024-02-20T09:15:00Z",
      last_used: "2024-07-28T13:45:12Z",
      status: "active",
      usage_count: 8923,
      rate_limit: 500,
    },
    {
      id: "key_3",
      name: "Analytics Integration",
      key: "fq_live_sk_3c4d5e6f7g8h9i0j1k2l",
      description: "Clé pour l'intégration avec le système d'analytics",
      permissions: ["read"],
      created_at: "2024-03-10T16:45:00Z",
      last_used: null,
      status: "inactive",
      usage_count: 0,
      rate_limit: 100,
    },
  ];

  const mockWebhooks: Webhook[] = [
    {
      id: "wh_1",
      name: "Stripe Payment Webhook",
      url: "https://api.flotteq.com/webhooks/stripe",
      events: ["payment.succeeded", "payment.failed", "subscription.updated"],
      secret: "whsec_1a2b3c4d5e6f7g8h9i0j",
      status: "active",
      last_triggered: "2024-07-28T12:30:45Z",
      success_count: 1247,
      failure_count: 3,
      created_at: "2024-01-20T11:00:00Z",
    },
    {
      id: "wh_2",
      name: "Support Notifications",
      url: "https://api.flotteq.com/webhooks/support",
      events: ["ticket.created", "ticket.updated", "ticket.closed"],
      secret: "whsec_2b3c4d5e6f7g8h9i0j1k",
      status: "active",
      last_triggered: "2024-07-28T14:15:20Z",
      success_count: 892,
      failure_count: 12,
      created_at: "2024-02-05T14:30:00Z",
    },
    {
      id: "wh_3",
      name: "Vehicle Updates",
      url: "https://external-system.com/fleet/updates",
      events: ["vehicle.created", "vehicle.updated", "maintenance.scheduled"],
      secret: "whsec_3c4d5e6f7g8h9i0j1k2l",
      status: "inactive",
      last_triggered: "2024-07-25T09:20:15Z",
      success_count: 456,
      failure_count: 8,
      created_at: "2024-03-12T08:45:00Z",
    },
  ];

  const mockIntegrations: Integration[] = [
    {
      id: "int_1",
      name: "Stripe",
      provider: "Stripe Inc.",
      type: "payment",
      status: "connected",
      config: {
        publishable_key: "pk_live_••••••••••••••••",
        webhook_endpoint: "configured",
        environment: "production"
      },
      last_sync: "2024-07-28T14:30:00Z",
      description: "Traitement des paiements et gestion des abonnements",
    },
    {
      id: "int_2",
      name: "Twilio SMS",
      provider: "Twilio",
      type: "sms",
      status: "connected",
      config: {
        account_sid: "AC••••••••••••••••••••••",
        phone_number: "+33123456789",
        region: "europe"
      },
      last_sync: "2024-07-28T13:45:00Z",
      description: "Envoi de notifications SMS aux utilisateurs",
    },
    {
      id: "int_3",
      name: "SendGrid",
      provider: "SendGrid",
      type: "email",
      status: "connected",
      config: {
        api_key: "SG.••••••••••••••••••••••",
        sender_email: "noreply@flotteq.com",
        templates: "configured"
      },
      last_sync: "2024-07-28T14:00:00Z",
      description: "Service de messagerie électronique transactionnelle",
    },
    {
      id: "int_4",
      name: "Google Maps",
      provider: "Google",
      type: "mapping",
      status: "error",
      config: {
        api_key: "AIza••••••••••••••••••••",
        billing_account: "active",
        quota_exceeded: true
      },
      last_sync: "2024-07-27T10:15:00Z",
      description: "Services de géolocalisation et cartographie",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulation d'appels API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(mockApiKeys);
      setWebhooks(mockWebhooks);
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactive':
      case 'disconnected':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Révoqué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'revoked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return "💳";
      case 'sms':
        return "📱";
      case 'email':
        return "✉️";
      case 'mapping':
        return "🗺️";
      case 'analytics':
        return "📊";
      case 'storage':
        return "💾";
      default:
        return "🔧";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Ici on afficherait un toast de succès
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API & Intégrations</h1>
          <p className="text-gray-600">Gestion des clés API, webhooks et intégrations externes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateKeyModal} onOpenChange={setShowCreateKeyModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Nouvelle clé API
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={showCreateWebhookModal} onOpenChange={setShowCreateWebhookModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouveau webhook
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-keys">Clés API ({safeLength(apiKeys)})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({safeLength(webhooks)})</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations ({safeLength(integrations)})</TabsTrigger>
        </TabsList>

        {/* Clés API */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>Clés API</CardTitle>
              <CardDescription>
                Gérez les clés d'accès à l'API FlotteQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Clé</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisation</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeMap(apiKeys, (key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{key.name}</div>
                          <div className="text-sm text-gray-500">{key.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {maskApiKey(key.key)}
                          </code>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(key.key)}
                            className="h-6 w-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {safeMap(key.permissions, (perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(key.status)}
                          {getStatusBadge(key.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{key.usage_count.toLocaleString()} requêtes</div>
                          <div className="text-gray-500">Limite: {key.rate_limit}/min</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {key.last_used ? (
                          <div className="text-sm">{formatDate(key.last_used)}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Jamais utilisée</div>
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
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              {key.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              {key.status === 'active' ? 'Désactiver' : 'Activer'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" />
                              Révoquer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configuration des points d'entrée pour les événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Événements</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Succès/Échecs</TableHead>
                    <TableHead>Dernier déclenchement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeMap(webhooks, (webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div className="font-medium">{webhook.name}</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {webhook.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(webhook.status)}
                          {getStatusBadge(webhook.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-green-600">{webhook.success_count} succès</div>
                          <div className="text-red-600">{webhook.failure_count} échecs</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.last_triggered ? (
                          <div className="text-sm">{formatDate(webhook.last_triggered)}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Jamais déclenché</div>
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
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Voir logs
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Tester webhook
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intégrations */}
        <TabsContent value="integrations">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {safeMap(integrations, (integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getTypeIcon(integration.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {integration.provider}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{integration.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut</span>
                    {getStatusBadge(integration.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge variant="outline">{integration.type}</Badge>
                  </div>
                  
                  {integration.last_sync && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dernière sync</span>
                      <span className="text-sm">{formatDate(integration.last_sync)}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Configurer
                    </Button>
                    <Button size="sm" variant="outline">
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bouton pour ajouter une nouvelle intégration */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ajouter une nouvelle intégration
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Connectez FlotteQ à vos services externes favoris
              </p>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Explorer les intégrations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals (placeholders) */}
      <Dialog open={showCreateKeyModal} onOpenChange={setShowCreateKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle clé API</DialogTitle>
            <DialogDescription>
              Configurez les permissions et les limites pour cette clé
            </DialogDescription>
          </DialogHeader>
          {/* Contenu du modal à implémenter */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateKeyModal(false)}>
              Annuler
            </Button>
            <Button>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateWebhookModal} onOpenChange={setShowCreateWebhookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau webhook</DialogTitle>
            <DialogDescription>
              Configurez l'endpoint et les événements à écouter
            </DialogDescription>
          </DialogHeader>
          {/* Contenu du modal à implémenter */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWebhookModal(false)}>
              Annuler
            </Button>
            <Button>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIIntegrations; 