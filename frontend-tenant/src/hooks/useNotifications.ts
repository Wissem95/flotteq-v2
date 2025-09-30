import { useState, useEffect } from 'react';
import { notificationService, Notification, NotificationResponse, NotificationCounts } from '@/services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    urgent: 0,
    critical: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les notifications depuis l'API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      
      // Vérifier d'abord si l'utilisateur est connecté
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }
      
      const response: NotificationResponse = await notificationService.getNotifications();
      setNotifications(response.notifications);
      
      // Récupérer aussi les compteurs
      const countsResponse = await notificationService.getNotificationCounts();
      setCounts(countsResponse);
    } catch (err: any) {
      // Si c'est une erreur 401, ne pas afficher d'erreur car l'intercepteur s'en charge
      if (err.response?.status !== 401) {
        setError(err.message || 'Erreur lors du chargement des notifications');
      }
      console.error('Erreur notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compter les notifications urgentes
  const unreadCount = counts.urgent + counts.critical;

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Mettre à jour l'état local
      setNotifications(prev => {
        if (!prev || !Array.isArray(prev)) return [];
        return prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'completed' as const }
            : notification
        );
      });
      // Rafraîchir les compteurs
      fetchNotifications();
    } catch (err: any) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  // Filtrer par type
  const getNotificationsByType = (type: string) => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notificationService.filterNotificationsByType(notifications, type);
  };

  // Filtrer par statut
  const getNotificationsByStatus = (status: string) => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notificationService.filterNotificationsByStatus(notifications, status);
  };

  // Rechercher dans les notifications
  const searchNotifications = (searchTerm: string) => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notificationService.searchNotifications(notifications, searchTerm);
  };

  // Notifications urgentes
  const urgentNotifications = (notifications || []).filter(n => 
    n.status === 'urgent' || n.status === 'overdue'
  );

  // Notifications par véhicule (en utilisant la plaque)
  const getNotificationsByVehicle = (plate: string) => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notifications.filter(n => n.plate === plate);
  };

  // Vérifier les notifications de CT expirés
  const checkExpiredCT = () => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notifications.filter(n => 
      n.type === 'ct' && (n.status === 'urgent' || n.status === 'overdue')
    );
  };

  // Vérifier les maintenances dues
  const checkMaintenanceDue = () => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return notifications.filter(n => 
      n.type === 'maintenance' && n.status !== 'completed'
    );
  };

  // Actualiser les notifications
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Utilitaires du service
  const getStatusBadge = (status: string) => {
    return notificationService.getStatusBadge(status);
  };

  const getPriorityColor = (priority: string) => {
    return notificationService.getPriorityColor(priority);
  };

  const formatRelativeDate = (dateString: string) => {
    return notificationService.formatRelativeDate(dateString);
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Polling pour les nouvelles notifications (toutes les 30 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  return {
    // Données
    notifications,
    counts,
    unreadCount,
    urgentNotifications,
    loading,
    error,
    
    // Actions
    markAsRead,
    refreshNotifications,
    
    // Utilitaires de filtrage
    getNotificationsByType,
    getNotificationsByStatus,
    getNotificationsByVehicle,
    searchNotifications,
    checkExpiredCT,
    checkMaintenanceDue,
    
    // Utilitaires d'affichage
    getStatusBadge,
    getPriorityColor,
    formatRelativeDate,
  };
};

export default useNotifications;