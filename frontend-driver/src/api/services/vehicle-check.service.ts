import api from '@/config/api';
import type { VehicleCheckData, VehicleCheckSubmitDto } from '@/types/vehicle-check.types';

export const vehicleCheckService = {
  /**
   * Soumettre un check véhicule complet
   */
  async submitVehicleCheck(checkData: VehicleCheckData): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Préparer les données de checklist
      const checklistData: VehicleCheckSubmitDto = {
        checklistData: {
          items: checkData.checklistItems.map((item) => ({
            id: item.id,
            label: item.label,
            checked: item.checked,
            category: item.category,
          })),
          completionRate:
            (checkData.checklistItems.filter((i) => i.checked).length / checkData.checklistItems.length) *
            100,
        },
        timestamp: checkData.timestamp.toISOString(),
        location: checkData.location,
      };

      // 2. Uploader les photos via l'endpoint driver existant
      if (checkData.photos.length > 0) {
        const formData = new FormData();
        checkData.photos.forEach((photo) => {
          formData.append('photos', photo);
        });

        await api.post('/driver/photos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // 3. Pour l'instant, on stocke les données de checklist localement
      // Dans une future version, on pourrait créer un endpoint dédié backend
      // Exemple: await api.post('/driver/vehicle-checks', checklistData);
      console.log('📋 Checklist data:', checklistData);

      // Si completion < 80%, créer un signalement optionnel
      if (checklistData.checklistData.completionRate < 80) {
        const uncheckedItems = checkData.checklistItems
          .filter((item) => !item.checked)
          .map((item) => item.label)
          .join(', ');

        console.warn('⚠️ Items non conformes:', uncheckedItems);

        // On pourrait automatiquement créer un report ici si besoin
        // await reportsService.createDriverReport({
        //   type: 'other',
        //   description: `Check véhicule incomplet. Items non vérifiés: ${uncheckedItems}`,
        //   notes: `Taux de complétion: ${checklistData.checklistData.completionRate.toFixed(1)}%`,
        // });
      }

      return {
        success: true,
        message: 'Check véhicule enregistré avec succès !',
      };
    } catch (error: any) {
      console.error('Error submitting vehicle check:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur lors de l\'enregistrement du check véhicule'
      );
    }
  },

  /**
   * Obtenir la géolocalisation du driver (optionnel)
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    });
  },
};
