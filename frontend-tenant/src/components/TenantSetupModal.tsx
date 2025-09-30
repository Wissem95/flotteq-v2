// TenantSetupModal.tsx - Modal obligatoire pour configuration tenant
import React, { useState } from 'react';
import { Building2, Users, Phone, MapPin, FileText, Briefcase } from 'lucide-react';

interface TenantSetupModalProps {
  isOpen: boolean;
  onComplete: (data: TenantSetupData) => Promise<void>;
}

interface TenantSetupData {
  company_name: string;
  industry: string;
  company_size: string;
  phone?: string;
  address?: string;
  description?: string;
}

export default function TenantSetupModal({ isOpen, onComplete }: TenantSetupModalProps) {
  const [formData, setFormData] = useState<TenantSetupData>({
    company_name: '',
    industry: '',
    company_size: '',
    phone: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté frontend
    if (!formData.company_name.trim()) {
      setError('Le nom de l\'entreprise est obligatoire');
      return;
    }
    if (!formData.industry) {
      setError('Le secteur d\'activité est obligatoire');
      return;
    }
    if (!formData.company_size) {
      setError('La taille de l\'entreprise est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onComplete(formData);
    } catch (error: any) {
      console.error('Setup failed:', error);
      setError(error.response?.data?.message || 'Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TenantSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header - pas de bouton fermer */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Configuration obligatoire</h2>
              <p className="text-blue-100 text-sm">
                Finalisons la configuration de votre espace FlotteQ
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Nom entreprise */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 mr-2" />
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Transport ABC"
              disabled={loading}
            />
          </div>

          {/* Secteur d'activité */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4 mr-2" />
              Secteur d'activité *
            </label>
            <select
              required
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Sélectionnez votre secteur...</option>
              <option value="transport">Transport et Logistique</option>
              <option value="construction">Construction et BTP</option>
              <option value="livraison">Livraison et Coursier</option>
              <option value="services">Services aux entreprises</option>
              <option value="commerce">Commerce et Vente</option>
              <option value="agricole">Agricole et Forestier</option>
              <option value="sante">Santé et Secours</option>
              <option value="autre">Autre secteur</option>
            </select>
          </div>

          {/* Taille entreprise */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 mr-2" />
              Taille de l'entreprise *
            </label>
            <select
              required
              value={formData.company_size}
              onChange={(e) => handleInputChange('company_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Sélectionnez la taille...</option>
              <option value="1-10">1-10 employés (TPE)</option>
              <option value="11-50">11-50 employés (PME)</option>
              <option value="51-200">51-200 employés (ETI)</option>
              <option value="201-500">201-500 employés (Grande entreprise)</option>
              <option value="500+">500+ employés (Groupe)</option>
            </select>
          </div>

          {/* Téléphone */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 mr-2" />
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: +33 1 23 45 67 89"
              disabled={loading}
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Adresse
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Adresse de votre entreprise"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Décrivez brièvement votre activité..."
              disabled={loading}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 caractères
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !formData.company_name || !formData.industry || !formData.company_size}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Configuration en cours...</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span>Commencer à utiliser FlotteQ</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Cette configuration est nécessaire pour personnaliser votre espace FlotteQ.
            <br />
            Vous pourrez modifier ces informations plus tard dans les paramètres.
          </p>
        </div>
      </div>
    </div>
  );
}