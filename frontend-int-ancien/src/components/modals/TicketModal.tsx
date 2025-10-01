// TicketModal.tsx - Modal pour la gestion des tickets support

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Send,
  Paperclip,
  Calendar,
  Tag
} from "lucide-react";

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'bug' | 'feature_request';
  tenant_name: string;
  tenant_id: string;
  requester_name: string;
  requester_email: string;
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: string;
    author: string;
    author_type: 'agent' | 'client';
    content: string;
    timestamp: string;
    attachments?: string[];
  }>;
  tags?: string[];
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: SupportTicket;
  mode: 'view' | 'edit' | 'respond' | 'create';
  onSubmit?: (data: any) => Promise<void>;
  onAssign?: (ticketId: string, agentId: string) => Promise<void>;
  onStatusChange?: (ticketId: string, status: SupportTicket['status']) => Promise<void>;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  mode,
  onSubmit,
  onAssign,
  onStatusChange
}) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SupportTicket['status']>('open');
  const [loading, setLoading] = useState(false);

  // Agents disponibles (mock data)
  const availableAgents = [
    { id: 'agent1', name: 'Sophie Martin', avatar: '' },
    { id: 'agent2', name: 'Thomas Dubois', avatar: '' },
    { id: 'agent3', name: 'Marie Leroy', avatar: '' },
    { id: 'agent4', name: 'Pierre Durand', avatar: '' }
  ];

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
      setSelectedAgent(ticket.assigned_agent || '');
    }
    setResponseMessage('');
  }, [ticket, isOpen]);

  const getStatusBadge = (status: SupportTicket['status']) => {
    const configs = {
      open: { variant: 'default' as const, icon: AlertCircle, label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
      in_progress: { variant: 'default' as const, icon: Clock, label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
      waiting_client: { variant: 'secondary' as const, icon: Clock, label: 'En attente client', color: 'bg-orange-100 text-orange-800' },
      resolved: { variant: 'default' as const, icon: CheckCircle, label: 'Résolu', color: 'bg-green-100 text-green-800' },
      closed: { variant: 'secondary' as const, icon: CheckCircle, label: 'Fermé', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    const configs = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Moyenne' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Élevée' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' }
    };
    
    const config = configs[priority];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryLabel = (category: SupportTicket['category']) => {
    const labels = {
      technical: 'Technique',
      billing: 'Facturation',
      general: 'Général',
      bug: 'Bug',
      feature_request: 'Demande de fonctionnalité'
    };
    
    return labels[category] || category;
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      toast({
        title: "Message requis",
        description: "Veuillez saisir un message de réponse",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Envoyer la réponse via API
      // await supportService.addMessage(ticket.id, responseText, false);
      
      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été envoyée au client",
      });
      
      setResponseMessage('');
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent || !ticket) return;

    setLoading(true);
    try {
      await onAssign?.(ticket.id, selectedAgent);
      toast({
        title: "Agent assigné",
        description: "Le ticket a été assigné avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'agent",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!ticket || selectedStatus === ticket.status) return;

    setLoading(true);
    try {
      await onStatusChange?.(ticket.id, selectedStatus);
      toast({
        title: "Statut modifié",
        description: "Le statut du ticket a été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  if (!ticket && mode !== 'create') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {mode === 'create' ? 'Nouveau ticket support' : `Ticket #${ticket?.id}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Créer un nouveau ticket support'
              : `Ticket de ${ticket?.tenant_name} - ${ticket?.requester_name}`
            }
          </DialogDescription>
        </DialogHeader>

        {ticket && mode !== 'create' && (
          <div className="space-y-6">
            {/* En-tête du ticket */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Créé le {formatTimestamp(ticket.created_at)} par {ticket.requester_name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Catégorie:</span>
                    <div className="mt-1">
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tenant:</span>
                    <div className="mt-1">{ticket.tenant_name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Agent assigné:</span>
                    <div className="mt-1">
                      {ticket.assigned_agent ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {availableAgents.find(a => a.id === ticket.assigned_agent)?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {availableAgents.find(a => a.id === ticket.assigned_agent)?.name}
                        </div>
                      ) : (
                        <span className="text-gray-500">Non assigné</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            {(mode === 'edit' || mode === 'respond') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assignation d'agent */}
                    <div className="space-y-2">
                      <Label>Assigner à un agent</Label>
                      <div className="flex gap-2">
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAgents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleAssignAgent}
                          disabled={loading || !selectedAgent || selectedAgent === ticket.assigned_agent}
                          size="sm"
                        >
                          Assigner
                        </Button>
                      </div>
                    </div>

                    {/* Changement de statut */}
                    <div className="space-y-2">
                      <Label>Modifier le statut</Label>
                      <div className="flex gap-2">
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as SupportTicket['status'])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Ouvert</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="waiting_client">En attente client</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
                            <SelectItem value="closed">Fermé</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleStatusChange}
                          disabled={loading || selectedStatus === ticket.status}
                          size="sm"
                        >
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description du problème */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Historique des messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historique des échanges</CardTitle>
                <CardDescription>
                  {ticket.messages.length} message(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.messages.map((message, index) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {message.author_type === 'agent' ? 'A' : 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.author}</span>
                        <Badge variant={message.author_type === 'agent' ? 'default' : 'secondary'} className="text-xs">
                          {message.author_type === 'agent' ? 'Agent' : 'Client'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {message.attachments.map((attachment, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {attachment}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Zone de réponse */}
            {mode === 'respond' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répondre au ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="response">Votre réponse</Label>
                    <Textarea
                      id="response"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Saisissez votre réponse au client..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleSendResponse}
                      disabled={loading || !responseMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? 'Envoi...' : 'Envoyer la réponse'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Mode création de ticket */}
        {mode === 'create' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Titre du ticket"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technique</SelectItem>
                    <SelectItem value="billing">Facturation</SelectItem>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature_request">Demande de fonctionnalité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant1">Transport Express</SelectItem>
                    <SelectItem value="tenant2">LogiTech Solutions</SelectItem>
                    <SelectItem value="tenant3">Médical Services Plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le problème en détail..."
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button>
                Créer le ticket
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;