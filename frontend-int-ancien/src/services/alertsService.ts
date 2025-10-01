// alertsService.ts - Service pour la gestion des alertes système

import { api } from '@/lib/api';

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'system' | 'performance' | 'security' | 'business';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  affected_services?: string[];
  metrics?: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    response_time?: number;
  };
  resolution_comment?: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface AlertConfig {
  id?: string;
  name: string;
  type: 'cpu' | 'memory' | 'disk' | 'response_time' | 'error_rate';
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  duration_minutes: number;
  recipients: string[];
  is_active: boolean;
}

class AlertsService {

  // Récupérer toutes les alertes
  async getAll(): Promise<SystemAlert[]> {
    try {
      const response = await api.get('/internal/alerts');
      return response.data.alerts || response.data;
    } catch (error: any) {
      console.error('Erreur récupération alertes depuis l\'API:', error);
      throw new Error('Impossible de récupérer les alertes système');
    }
  }

  // Configurer une nouvelle alerte
  async configure(config: AlertConfig): Promise<AlertConfig> {
    try {
      const response = await api.post('/internal/alerts/config', config);
      return response.data.config || response.data;
    } catch (error: any) {
      console.error('Erreur configuration alerte:', error);
      throw new Error('Impossible de configurer l\'alerte');
    }
  }

  // Enquêter sur une alerte
  async investigate(id: string): Promise<{
    logs: string[];
    metrics: any;
    recommendations: string[];
  }> {
    try {
      const response = await api.get(`/internal/alerts/${id}/investigate`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur investigation alerte:', error);
      throw new Error('Impossible d\'investiguer l\'alerte');
    }
  }

  // Résoudre une alerte
  async resolve(id: string, comment: string): Promise<void> {
    try {
      await api.post(`/internal/alerts/${id}/resolve`, { comment });
    } catch (error: any) {
      console.error('Erreur résolution alerte:', error);
      throw new Error('Impossible de résoudre l\'alerte');
    }
  }


  // Obtenir les configurations d'alertes
  async getConfigs(): Promise<AlertConfig[]> {
    try {
      const response = await api.get('/internal/alerts/configs');
      return response.data.configs || response.data;
    } catch (error: any) {
      console.error('Erreur récupération configs alertes:', error);
      throw new Error('Impossible de récupérer les configurations d\'alertes');
    }
  }

  // Actualiser les alertes (récupérer les dernières)
  async refresh(): Promise<SystemAlert[]> {
    try {
      const response = await api.get('/internal/alerts/refresh');
      return response.data.alerts || response.data;
    } catch (error: any) {
      console.error('Erreur actualisation alertes:', error);
      throw new Error('Impossible d\'actualiser les alertes');
    }
  }

  // Supprimer une alerte
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/internal/alerts/${id}`);
    } catch (error: any) {
      console.error('Erreur suppression alerte:', error);
      throw new Error('Impossible de supprimer l\'alerte');
    }
  }
}

export const alertsService = new AlertsService();