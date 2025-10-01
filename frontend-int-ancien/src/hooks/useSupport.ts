// useSupport.ts - Hook personnalisé pour la gestion du support FlotteQ

import { useState, useEffect, useCallback } from 'react';
import { 
  supportService,
  SupportTicket, 
  SupportStats, 
  SupportFilters,
  CreateTicketData,
  UpdateTicketData,
  QuickResponse
} from '@/services/supportService';

interface UseSupportReturn {
  // État
  tickets: SupportTicket[];
  stats: SupportStats | null;
  quickResponses: QuickResponse[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTickets: (page?: number, filters?: SupportFilters) => Promise<void>;
  loadStats: () => Promise<void>;
  loadQuickResponses: () => Promise<void>;
  getTicket: (id: number) => Promise<SupportTicket | null>;
  createTicket: (data: CreateTicketData) => Promise<SupportTicket | null>;
  updateTicket: (id: number, data: UpdateTicketData) => Promise<SupportTicket | null>;
  addMessage: (ticketId: number, message: string, isInternal?: boolean) => Promise<boolean>;
  assignTicket: (ticketId: number, employeeId: number) => Promise<boolean>;
  changeStatus: (ticketId: number, status: 'open' | 'in_progress' | 'resolved' | 'closed') => Promise<boolean>;
  searchTickets: (query: string) => Promise<SupportTicket[]>;
  exportTickets: (format: 'csv' | 'excel', filters?: SupportFilters) => Promise<boolean>;
  
  // Utilitaires
  clearError: () => void;
  refreshData: () => Promise<void>;
}

/**
 * Hook personnalisé pour la gestion du support client
 */
export const useSupport = (): UseSupportReturn => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les tickets avec filtres
   */
  const loadTickets = useCallback(async (page: number = 1, filters?: SupportFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await supportService.getTickets(page, 20, filters);
      setTickets(response.tickets);
    } catch (err: any) {
      console.error('Erreur lors du chargement des tickets:', err);
      setError(err.message || 'Erreur lors du chargement des tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Charger les statistiques
   */
  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const statsData = await supportService.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    }
  }, []);

  /**
   * Charger les réponses rapides
   */
  const loadQuickResponses = useCallback(async () => {
    try {
      setError(null);
      const responses = await supportService.getQuickResponses();
      setQuickResponses(responses);
    } catch (err: any) {
      console.error('Erreur lors du chargement des réponses rapides:', err);
      setError(err.message || 'Erreur lors du chargement des réponses rapides');
    }
  }, []);

  /**
   * Récupérer un ticket par ID
   */
  const getTicket = useCallback(async (id: number): Promise<SupportTicket | null> => {
    try {
      setError(null);
      const ticket = await supportService.getTicket(id);
      return ticket;
    } catch (err: any) {
      console.error(`Erreur lors de la récupération du ticket ${id}:`, err);
      setError(err.message || 'Erreur lors de la récupération du ticket');
      return null;
    }
  }, []);

  /**
   * Créer un nouveau ticket
   */
  const createTicket = useCallback(async (data: CreateTicketData): Promise<SupportTicket | null> => {
    try {
      setError(null);
      const newTicket = await supportService.createTicket(data);
      
      // Ajouter le nouveau ticket à la liste
      setTickets(prev => [newTicket, ...prev]);
      
      // Recharger les stats
      await loadStats();
      
      return newTicket;
    } catch (err: any) {
      console.error('Erreur lors de la création du ticket:', err);
      setError(err.message || 'Erreur lors de la création du ticket');
      return null;
    }
  }, [loadStats]);

  /**
   * Mettre à jour un ticket
   */
  const updateTicket = useCallback(async (id: number, data: UpdateTicketData): Promise<SupportTicket | null> => {
    try {
      setError(null);
      const updatedTicket = await supportService.updateTicket(id, data);
      
      // Mettre à jour le ticket dans la liste
      setTickets(prev => prev.map(ticket => 
        ticket.id === id ? updatedTicket : ticket
      ));
      
      return updatedTicket;
    } catch (err: any) {
      console.error(`Erreur lors de la mise à jour du ticket ${id}:`, err);
      setError(err.message || 'Erreur lors de la mise à jour du ticket');
      return null;
    }
  }, []);

  /**
   * Ajouter un message à un ticket
   */
  const addMessage = useCallback(async (
    ticketId: number, 
    message: string, 
    isInternal: boolean = false
  ): Promise<boolean> => {
    try {
      setError(null);
      await supportService.addMessage(ticketId, message, isInternal);
      
      // Recharger les tickets pour avoir la version à jour
      await loadTickets();
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du message:', err);
      setError(err.message || 'Erreur lors de l\'ajout du message');
      return false;
    }
  }, [loadTickets]);

  /**
   * Assigner un ticket à un employé
   */
  const assignTicket = useCallback(async (ticketId: number, employeeId: number): Promise<boolean> => {
    try {
      setError(null);
      const updatedTicket = await supportService.assignTicket(ticketId, employeeId);
      
      // Mettre à jour le ticket dans la liste
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'assignation:', err);
      setError(err.message || 'Erreur lors de l\'assignation');
      return false;
    }
  }, []);

  /**
   * Changer le statut d'un ticket
   */
  const changeStatus = useCallback(async (
    ticketId: number, 
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<boolean> => {
    try {
      setError(null);
      const updatedTicket = await supportService.changeStatus(ticketId, status);
      
      // Mettre à jour le ticket dans la liste
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
      
      // Recharger les stats
      await loadStats();
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      setError(err.message || 'Erreur lors du changement de statut');
      return false;
    }
  }, [loadStats]);

  /**
   * Rechercher dans les tickets
   */
  const searchTickets = useCallback(async (query: string): Promise<SupportTicket[]> => {
    try {
      setError(null);
      const results = await supportService.searchTickets(query);
      return results;
    } catch (err: any) {
      console.error('Erreur lors de la recherche:', err);
      setError(err.message || 'Erreur lors de la recherche');
      return [];
    }
  }, []);

  /**
   * Exporter les tickets
   */
  const exportTickets = useCallback(async (
    format: 'csv' | 'excel', 
    filters?: SupportFilters
  ): Promise<boolean> => {
    try {
      setError(null);
      const blob = await supportService.exportTickets(format, filters);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tickets-support-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'export:', err);
      setError(err.message || 'Erreur lors de l\'export');
      return false;
    }
  }, []);

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Rafraîchir toutes les données
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadTickets(),
      loadStats(),
      loadQuickResponses()
    ]);
  }, [loadTickets, loadStats, loadQuickResponses]);

  // Chargement initial
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // État
    tickets,
    stats,
    quickResponses,
    isLoading,
    error,
    
    // Actions
    loadTickets,
    loadStats,
    loadQuickResponses,
    getTicket,
    createTicket,
    updateTicket,
    addMessage,
    assignTicket,
    changeStatus,
    searchTickets,
    exportTickets,
    
    // Utilitaires
    clearError,
    refreshData,
  };
}; 