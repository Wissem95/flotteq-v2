import { api } from '../lib/api';

export interface Notification {
  id: string;
  type: 'ct' | 'maintenance' | 'insurance' | 'issue' | 'document' | 'status_change';
  vehicle: string;
  plate: string;
  message: string;
  dueDate: string;
  status: 'upcoming' | 'urgent' | 'overdue' | 'completed' | 'info';
  priority: 'critical' | 'high' | 'medium' | 'low';
  created: string;
  vehicle_id?: number;
  maintenance_id?: number;
  old_status?: string;
  new_status?: string;
  reason?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  urgent: number;
  overdue: number;
}

export interface NotificationCounts {
  total: number;
  urgent: number;
  critical: number;
  upcoming: number;
}

class NotificationService {
  /**
   * Récupérer toutes les notifications de l'utilisateur
   */
  async getNotifications(): Promise<NotificationResponse> {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  /**
   * Récupérer le nombre de notifications pour le dashboard
   */
  async getNotificationCounts(): Promise<NotificationCounts> {
    try {
      const response = await api.get('/notifications/counts');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des compteurs de notifications:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.post(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  }

  /**
   * Filtrer les notifications par type
   */
  filterNotificationsByType(notifications: Notification[], type?: string): Notification[] {
    if (!type || type === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.type === type);
  }

  /**
   * Filtrer les notifications par statut
   */
  filterNotificationsByStatus(notifications: Notification[], status?: string): Notification[] {
    if (!status || status === 'all') {
      return notifications;
    }
    
    if (status === 'urgent') {
      return notifications.filter(notification => 
        notification.status === 'urgent' || notification.status === 'overdue'
      );
    }
    
    return notifications.filter(notification => notification.status === status);
  }

  /**
   * Rechercher dans les notifications
   */
  searchNotifications(notifications: Notification[], searchTerm: string): Notification[] {
    if (!searchTerm.trim()) {
      return notifications;
    }
    
    const term = searchTerm.toLowerCase();
    return notifications.filter(notification =>
      notification.vehicle.toLowerCase().includes(term) ||
      notification.plate.toLowerCase().includes(term) ||
      notification.message.toLowerCase().includes(term)
    );
  }

  /**
   * Obtenir le badge de statut d'une notification
   */
  getStatusBadge(status: string): { className: string; label: string } {
    switch (status) {
      case 'upcoming':
        return { className: 'bg-sky-100 text-sky-700', label: 'À venir' };
      case 'urgent':
        return { className: 'bg-amber-100 text-amber-700', label: 'Urgent' };
      case 'overdue':
        return { className: 'bg-red-100 text-red-700', label: 'En retard' };
      case 'completed':
        return { className: 'bg-green-100 text-green-700', label: 'Traité' };
      default:
        return { className: 'bg-gray-100 text-gray-700', label: 'Inconnu' };
    }
  }

  /**
   * Obtenir la couleur d'icône selon la priorité
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-amber-600';
      case 'medium':
        return 'text-sky-600';
      case 'low':
        return 'text-slate-600';
      default:
        return 'text-slate-600';
    }
  }

  /**
   * Obtenir la couleur de fond selon la priorité
   */
  getPriorityBackgroundColor(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'bg-red-100';
      case 'high':
        return 'bg-amber-100';
      case 'medium':
        return 'bg-sky-100';
      case 'low':
        return 'bg-slate-100';
      default:
        return 'bg-slate-100';
    }
  }

  /**
   * Formater une date relative (il y a X jours, dans X jours, etc.)
   */
  formatRelativeDate(dateString: string): string {
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
      // Formater la date normalement
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
  }

  /**
   * Formater une date en français
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}

export const notificationService = new NotificationService();