import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ChevronRight, ChevronLeft, Building2, MapPin, User, FileText } from 'lucide-react';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import { FileUpload } from '../components/FileUpload';
import { VALIDATION_RULES } from '../config/constants';

type PartnerType = 'garage' | 'car_wash' | 'body_shop' | 'tire_shop' | 'towing' | 'inspection' | 'rental' | 'other';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1: Infos entreprise
    companyName: '',
    type: 'garage' as PartnerType,
    email: '',
    phone: '',
    siret: '',
    // Étape 2: Adresse
    address: '',
    city: '',
    postalCode: '',
    // Étape 3: Responsable
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName.trim()) {
        errors.companyName = 'Le nom de l\'entreprise est requis';
      }
      if (!formData.email.trim()) {
        errors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Format d\'email invalide';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Le téléphone est requis';
      } else if (!VALIDATION_RULES.PHONE.PATTERN.test(formData.phone)) {
        errors.phone = VALIDATION_RULES.PHONE.MESSAGE;
      }
      if (!formData.siret.trim()) {
        errors.siret = 'Le SIRET est requis';
      } else if (!VALIDATION_RULES.SIRET.PATTERN.test(formData.siret)) {
        errors.siret = VALIDATION_RULES.SIRET.MESSAGE;
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        errors.address = 'L\'adresse est requise';
      }
      if (!formData.city.trim()) {
        errors.city = 'La ville est requise';
      }
      if (!formData.postalCode.trim()) {
        errors.postalCode = 'Le code postal est requis';
      } else if (!VALIDATION_RULES.POSTAL_CODE.PATTERN.test(formData.postalCode)) {
        errors.postalCode = VALIDATION_RULES.POSTAL_CODE.MESSAGE;
      }
    }

    if (step === 3) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'Le prénom est requis';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Le nom est requis';
      }
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        errors.password = `Le mot de passe doit contenir au moins ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caractères`;
      } else if (!VALIDATION_RULES.PASSWORD.PATTERN.test(formData.password)) {
        errors.password = VALIDATION_RULES.PASSWORD.MESSAGE;
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Veuillez confirmer le mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (step === 4) {
      if (documents.length === 0) {
        errors.documents = 'Veuillez télécharger au moins un document (SIRET ou attestation d\'assurance)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Préparer les données pour l'API
      const registrationData = {
        companyName: formData.companyName,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        siretNumber: formData.siret,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        ownerFirstName: formData.firstName,
        ownerLastName: formData.lastName,
        ownerEmail: formData.email, // Utiliser le même email pour le owner
        ownerPassword: formData.password,
      };

      // TODO: Upload documents (nécessite endpoint backend pour upload)
      // Pour le moment, on enregistre sans les documents
      await axiosInstance.post(API_CONFIG.ENDPOINTS.PARTNER_REGISTER, registrationData);

      navigate('/pending-approval');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Entreprise', icon: Building2 },
    { number: 2, title: 'Adresse', icon: MapPin },
    { number: 3, title: 'Responsable', icon: User },
    { number: 4, title: 'Documents', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            FlotteQ Partner
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre réseau de partenaires
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mb-6 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scrollable form content */}
        <div className="max-h-[450px] overflow-y-auto pr-2">
        {/* Step 1: Infos Entreprise */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.companyName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="garage">Garage</option>
                <option value="car_wash">Station de lavage</option>
                <option value="body_shop">Carrosserie</option>
                <option value="tire_shop">Centre pneumatique</option>
                <option value="towing">Dépannage</option>
                <option value="inspection">Contrôle technique</option>
                <option value="rental">Location</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email professionnel *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33612345678"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET (14 chiffres) *
              </label>
              <input
                type="text"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
                placeholder="12345678901234"
                maxLength={14}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.siret ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.siret && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.siret}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Adresse */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="75001"
                  maxLength={5}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    validationErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.postalCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    validationErrors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Responsable */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents requis *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Veuillez télécharger votre extrait SIRET et/ou votre attestation d'assurance
                professionnelle (format PDF ou image, max 5MB par fichier)
              </p>
              <FileUpload
                onFilesSelected={setDocuments}
                maxFiles={5}
                acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
              />
              {validationErrors.documents && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.documents}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Vos documents seront vérifiés par notre équipe. Vous
                recevrez un email de confirmation une fois votre compte approuvé (délai : 24-48h).
              </p>
            </div>
          </div>
        )}
        </div>

        {/* Navigation Buttons - Always visible */}
        <div className="flex items-center justify-between gap-4 pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Précédent
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-flotteq-blue hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue"
            >
              Suivant
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-flotteq-blue hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue disabled:opacity-50"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          )}
        </div>
      </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Déjà partenaire ?</span>{' '}
          <Link
            to="/login"
            className="text-sm font-medium text-flotteq-blue hover:text-flotteq-navy"
          >
            Se connecter
          </Link>
        </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 FlotteQ. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
