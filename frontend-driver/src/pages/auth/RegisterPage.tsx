import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService, type RegisterDto } from '@/api/services/auth.service';
import { subscriptionsService, type SubscriptionPlan } from '@/api/services/subscriptions.service';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<Omit<RegisterDto, 'planId'>>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const fetchedPlans = await subscriptionsService.getPlans();
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) {
        setSelectedPlan(fetchedPlans[0]);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError('Erreur lors du chargement des plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedPlan) {
      setError('Veuillez sélectionner un plan');
      setLoading(false);
      return;
    }

    try {
      const registerData: RegisterDto = {
        ...formData,
        planId: selectedPlan.id.toString(),
      };

      const response = await authService.register(registerData);

      // Sauvegarder les tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('tenant_id', response.user.tenantId.toString());

      // Redirect vers le dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Créer votre compte FlotteQ
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez votre plan et démarrez en quelques minutes
          </p>
        </div>

        {/* Step 1: Choix du plan */}
        {step === 1 && (
          <div className="space-y-8">
            {loadingPlans ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-flotteq-blue'
                        : 'border-gray-200 hover:border-flotteq-blue'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {Number(plan.price).toFixed(2)}€
                      </span>
                      <span className="ml-1 text-gray-500">/mois</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-flotteq-teal flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">
                          {plan.maxVehicles === -1 ? 'Véhicules illimités' : `Jusqu'à ${plan.maxVehicles} véhicules`}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-flotteq-teal flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">
                          {plan.maxUsers === -1 ? 'Utilisateurs illimités' : `Jusqu'à ${plan.maxUsers} utilisateurs`}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-flotteq-teal flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">
                          {plan.maxDrivers === -1 ? 'Conducteurs illimités' : `Jusqu'à ${plan.maxDrivers} conducteurs`}
                        </span>
                      </li>
                      {plan.trialDays > 0 && (
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-flotteq-teal flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="ml-2 text-sm text-gray-600">
                            {plan.trialDays} jours d'essai gratuit
                          </span>
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      className="mt-6 w-full bg-flotteq-blue text-white py-2 px-4 rounded-md hover:bg-flotteq-navy transition-colors"
                    >
                      Choisir {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Informations */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-flotteq-blue hover:text-flotteq-navy mb-4"
            >
              ← Changer de plan
            </button>

            {selectedPlan && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Plan sélectionné: <strong>{selectedPlan.name}</strong> - {Number(selectedPlan.price).toFixed(2)}€/mois
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-flotteq-blue hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Continuer vers le paiement'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
              </p>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Déjà un compte ?</span>{' '}
              <Link
                to="/login"
                className="text-sm font-medium text-flotteq-blue hover:text-flotteq-navy"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
