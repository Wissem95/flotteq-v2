
import { useState, useEffect } from 'react';

interface VehicleInfo {
  licensePlate: string;
  brand: string;
  model: string;
  year: string;
  version: string;
}

interface SearchData {
  vehicleInfo: VehicleInfo;
  selectedService: string;
  searchMode: 'plate' | 'manual';
  isPlateRecognized: boolean;
}

const STORAGE_KEY = 'garage_search_last_data';

export const useVehicleSearchPersistence = () => {
  const [searchData, setSearchData] = useState<SearchData | null>(null);

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSearchData(parsedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données sauvegardées:', error);
    }
  }, []);

  // Sauvegarder les données de recherche
  const saveSearchData = (data: SearchData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSearchData(data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Effacer les données sauvegardées
  const clearSearchData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSearchData(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return {
    searchData,
    saveSearchData,
    clearSearchData
  };
};
