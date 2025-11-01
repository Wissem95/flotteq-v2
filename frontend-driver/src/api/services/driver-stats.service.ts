import api from '@/config/api';

export interface DriverStats {
  expiredDocumentsCount: number;
  expiringDocumentsCount: number;
  activeReportsCount: number;
  vehicleNextMaintenanceDays: number | null;
  licenseExpiryDays: number | null;
}

export interface DriverAlert {
  id: string;
  type: 'license' | 'document' | 'maintenance' | 'report';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  daysUntil?: number;
  actionUrl?: string;
}

export const driverStatsService = {
  /**
   * Récupérer les statistiques du driver
   */
  async getStats(): Promise<DriverStats> {
    try {
      const [profile, documents, reports] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/driver/documents'),
        api.get('/driver/reports'),
      ]);

      const today = new Date();
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);

      // Compter documents expirés/expirant
      const expiredCount = documents.data.filter((doc: any) => {
        if (!doc.expiryDate) return false;
        return new Date(doc.expiryDate) < today;
      }).length;

      const expiringCount = documents.data.filter((doc: any) => {
        if (!doc.expiryDate) return false;
        const expiryDate = new Date(doc.expiryDate);
        return expiryDate >= today && expiryDate <= in30Days;
      }).length;

      // Compter reports actifs (open, acknowledged)
      const activeReportsCount = reports.data.filter(
        (report: any) => report.status === 'open' || report.status === 'acknowledged'
      ).length;

      // Calculer jours avant expiration permis
      let licenseExpiryDays = null;
      if (profile.data.licenseExpiryDate) {
        const expiryDate = new Date(profile.data.licenseExpiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        licenseExpiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Calculer jours avant prochain CT
      let vehicleNextMaintenanceDays = null;
      if (profile.data.assignedVehicle?.nextTechnicalInspection) {
        const ctDate = new Date(profile.data.assignedVehicle.nextTechnicalInspection);
        const diffTime = ctDate.getTime() - today.getTime();
        vehicleNextMaintenanceDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        expiredDocumentsCount: expiredCount,
        expiringDocumentsCount: expiringCount,
        activeReportsCount,
        vehicleNextMaintenanceDays,
        licenseExpiryDays,
      };
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      throw error;
    }
  },

  /**
   * Récupérer les alertes du driver
   */
  async getAlerts(): Promise<DriverAlert[]> {
    try {
      const [profile, documents] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/driver/documents'),
      ]);

      const alerts: DriverAlert[] = [];
      const today = new Date();

      // Alerte permis expirant
      if (profile.data.licenseExpiryDate) {
        const expiryDate = new Date(profile.data.licenseExpiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
          alerts.push({
            id: 'license-expired',
            type: 'license',
            severity: 'critical',
            title: 'Permis de conduire expiré',
            message: 'Votre permis de conduire est expiré. Contactez immédiatement votre responsable.',
            daysUntil,
            actionUrl: '/documents',
          });
        } else if (daysUntil <= 30) {
          alerts.push({
            id: 'license-expiring',
            type: 'license',
            severity: daysUntil <= 7 ? 'high' : 'medium',
            title: 'Permis expirant bientôt',
            message: `Votre permis expire dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}.`,
            daysUntil,
            actionUrl: '/documents',
          });
        }
      }

      // Alertes documents expirés/expirant
      documents.data.forEach((doc: any) => {
        if (!doc.expiryDate) return;

        const expiryDate = new Date(doc.expiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
          alerts.push({
            id: `doc-expired-${doc.id}`,
            type: 'document',
            severity: 'high',
            title: `${doc.documentType} expiré`,
            message: `Le document ${doc.fileName} est expiré.`,
            daysUntil,
            actionUrl: '/documents',
          });
        } else if (daysUntil <= 30) {
          alerts.push({
            id: `doc-expiring-${doc.id}`,
            type: 'document',
            severity: daysUntil <= 7 ? 'medium' : 'low',
            title: `Document expirant bientôt`,
            message: `${doc.fileName} expire dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}.`,
            daysUntil,
            actionUrl: '/documents',
          });
        }
      });

      // Alerte contrôle technique
      if (profile.data.assignedVehicle?.nextTechnicalInspection) {
        const ctDate = new Date(profile.data.assignedVehicle.nextTechnicalInspection);
        const diffTime = ctDate.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
          alerts.push({
            id: 'ct-overdue',
            type: 'maintenance',
            severity: 'critical',
            title: 'Contrôle technique en retard',
            message: 'Le contrôle technique de votre véhicule est en retard.',
            daysUntil,
          });
        } else if (daysUntil <= 30) {
          alerts.push({
            id: 'ct-due',
            type: 'maintenance',
            severity: daysUntil <= 7 ? 'high' : 'medium',
            title: 'Contrôle technique bientôt',
            message: `Contrôle technique dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}.`,
            daysUntil,
          });
        }
      }

      // Trier par sévérité
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    } catch (error) {
      console.error('Error fetching driver alerts:', error);
      return [];
    }
  },
};
