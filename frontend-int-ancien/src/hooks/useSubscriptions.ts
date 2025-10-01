// useSubscriptions.ts - Hook personnalisé pour la gestion des abonnements FlotteQ

import { useState, useEffect, useCallback } from 'react';
import { 
  subscriptionsService, 
  Subscription, 
  SubscriptionPlan,
  SubscriptionStats, 
  SubscriptionFilters, 
  CreateSubscriptionData, 
  UpdateSubscriptionData,
  Invoice
} from '@/services/subscriptionsService';

interface UseSubscriptionsReturn {
  // State
  subscriptions: Subscription[];
  plans: SubscriptionPlan[];
  stats: SubscriptionStats | null;
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSubscriptions: (page?: number, filters?: SubscriptionFilters) => Promise<void>;
  loadPlans: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadInvoices: (page?: number, filters?: any) => Promise<void>;
  
  createSubscription: (data: CreateSubscriptionData) => Promise<Subscription | null>;
  updateSubscription: (id: number, data: UpdateSubscriptionData) => Promise<Subscription | null>;
  cancelSubscription: (id: number, reason?: string) => Promise<Subscription | null>;
  suspendSubscription: (id: number, reason?: string) => Promise<Subscription | null>;
  reactivateSubscription: (id: number) => Promise<Subscription | null>;
  extendTrial: (id: number, days: number) => Promise<Subscription | null>;
  
  searchSubscriptions: (query: string) => Promise<Subscription[]>;
  exportSubscriptions: (format: 'csv' | 'excel', filters?: SubscriptionFilters) => Promise<Blob | null>;
  
  sendInvoice: (invoiceId: string) => Promise<boolean>;
  markInvoiceAsPaid: (invoiceId: string) => Promise<Invoice | null>;
  downloadInvoice: (invoiceId: string) => Promise<Blob | null>;
  
  refreshData: () => Promise<void>;
}

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les abonnements
  const loadSubscriptions = useCallback(async (page: number = 1, filters?: SubscriptionFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscriptionsService.getSubscriptions(page, 20, filters);
      setSubscriptions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des abonnements');
      console.error('Erreur loadSubscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les plans
  const loadPlans = useCallback(async () => {
    setError(null);
    try {
      const plansData = await subscriptionsService.getPlans();
      setPlans(plansData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des plans');
      console.error('Erreur loadPlans:', err);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    setError(null);
    try {
      const statsData = await subscriptionsService.getSubscriptionStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Erreur loadStats:', err);
    }
  }, []);

  // Charger les factures
  const loadInvoices = useCallback(async (page: number = 1, filters?: any) => {
    setError(null);
    try {
      const response = await subscriptionsService.getInvoices(page, 20, filters);
      setInvoices(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des factures');
      console.error('Erreur loadInvoices:', err);
    }
  }, []);

  // Créer un abonnement
  const createSubscription = useCallback(async (data: CreateSubscriptionData): Promise<Subscription | null> => {
    setError(null);
    try {
      const newSubscription = await subscriptionsService.createSubscription(data);
      setSubscriptions(prev => [newSubscription, ...prev]);
      return newSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'abonnement');
      console.error('Erreur createSubscription:', err);
      return null;
    }
  }, []);

  // Mettre à jour un abonnement
  const updateSubscription = useCallback(async (id: number, data: UpdateSubscriptionData): Promise<Subscription | null> => {
    setError(null);
    try {
      const updatedSubscription = await subscriptionsService.updateSubscription(id, data);
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? updatedSubscription : subscription
        )
      );
      return updatedSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'abonnement');
      console.error('Erreur updateSubscription:', err);
      return null;
    }
  }, []);

  // Annuler un abonnement
  const cancelSubscription = useCallback(async (id: number, reason?: string): Promise<Subscription | null> => {
    setError(null);
    try {
      const cancelledSubscription = await subscriptionsService.cancelSubscription(id, reason);
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? cancelledSubscription : subscription
        )
      );
      return cancelledSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation de l\'abonnement');
      console.error('Erreur cancelSubscription:', err);
      return null;
    }
  }, []);

  // Suspendre un abonnement
  const suspendSubscription = useCallback(async (id: number, reason?: string): Promise<Subscription | null> => {
    setError(null);
    try {
      const suspendedSubscription = await subscriptionsService.suspendSubscription(id, reason);
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? suspendedSubscription : subscription
        )
      );
      return suspendedSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suspension de l\'abonnement');
      console.error('Erreur suspendSubscription:', err);
      return null;
    }
  }, []);

  // Réactiver un abonnement
  const reactivateSubscription = useCallback(async (id: number): Promise<Subscription | null> => {
    setError(null);
    try {
      const reactivatedSubscription = await subscriptionsService.reactivateSubscription(id);
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? reactivatedSubscription : subscription
        )
      );
      return reactivatedSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réactivation de l\'abonnement');
      console.error('Erreur reactivateSubscription:', err);
      return null;
    }
  }, []);

  // Étendre la période d'essai
  const extendTrial = useCallback(async (id: number, days: number): Promise<Subscription | null> => {
    setError(null);
    try {
      const extendedSubscription = await subscriptionsService.extendTrial(id, days);
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? extendedSubscription : subscription
        )
      );
      return extendedSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'extension de la période d\'essai');
      console.error('Erreur extendTrial:', err);
      return null;
    }
  }, []);

  // Rechercher des abonnements
  const searchSubscriptions = useCallback(async (query: string): Promise<Subscription[]> => {
    setError(null);
    try {
      return await subscriptionsService.searchSubscriptions(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche d\'abonnements');
      console.error('Erreur searchSubscriptions:', err);
      return [];
    }
  }, []);

  // Exporter les abonnements
  const exportSubscriptions = useCallback(async (format: 'csv' | 'excel', filters?: SubscriptionFilters): Promise<Blob | null> => {
    setError(null);
    try {
      return await subscriptionsService.exportSubscriptions(format, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export des abonnements');
      console.error('Erreur exportSubscriptions:', err);
      return null;
    }
  }, []);

  // Envoyer une facture
  const sendInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    setError(null);
    try {
      await subscriptionsService.sendInvoice(invoiceId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la facture');
      console.error('Erreur sendInvoice:', err);
      return false;
    }
  }, []);

  // Marquer une facture comme payée
  const markInvoiceAsPaid = useCallback(async (invoiceId: string): Promise<Invoice | null> => {
    setError(null);
    try {
      const updatedInvoice = await subscriptionsService.markInvoiceAsPaid(invoiceId);
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId ? updatedInvoice : invoice
        )
      );
      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la facture');
      console.error('Erreur markInvoiceAsPaid:', err);
      return null;
    }
  }, []);

  // Télécharger une facture
  const downloadInvoice = useCallback(async (invoiceId: string): Promise<Blob | null> => {
    setError(null);
    try {
      return await subscriptionsService.downloadInvoice(invoiceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement de la facture');
      console.error('Erreur downloadInvoice:', err);
      return null;
    }
  }, []);

  // Rafraîchir toutes les données
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadSubscriptions(),
      loadPlans(),
      loadStats(),
      loadInvoices()
    ]);
  }, [loadSubscriptions, loadPlans, loadStats, loadInvoices]);

  // Charger les données au montage du composant
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // State
    subscriptions,
    plans,
    stats,
    invoices,
    isLoading,
    error,

    // Actions
    loadSubscriptions,
    loadPlans,
    loadStats,
    loadInvoices,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    suspendSubscription,
    reactivateSubscription,
    extendTrial,
    searchSubscriptions,
    exportSubscriptions,
    sendInvoice,
    markInvoiceAsPaid,
    downloadInvoice,
    refreshData,
  };
}; 