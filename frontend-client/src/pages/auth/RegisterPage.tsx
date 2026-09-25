import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService, type RegisterDto } from '@/api/services/auth.service';
import { subscriptionsService, type SubscriptionPlan } from '@/api/services/subscriptions.service';
import { PasswordInput } from '@/components/ui/PasswordInput';

type CustomerType = 'consumer' | 'professional';
type RegistrationIdentity = Pick<
  RegisterDto,
  'email' | 'password' | 'firstName' | 'lastName' | 'companyName'
>;

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<RegistrationIdentity>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });
  const [customerType, setCustomerType] = useState<CustomerType>('professional');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [immediateServiceRequested, setImmediateServiceRequested] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const loadPlans = useCallback(async () => {
    try {
      const fetchedPlans = await subscriptionsService.getPlans();
      setPlans(fetchedPlans);
      const requestedPlan = searchParams.get('plan')?.trim().toLowerCase();
      const requestedPlanMatch = requestedPlan
        ? fetchedPlans.find(
            (plan) =>
              plan.name.trim().toLowerCase() === requestedPlan &&
              !(Number(plan.price) === 0 && plan.maxVehicles === -1),
          )
        : undefined;
      if (requestedPlanMatch) {
        setSelectedPlan(requestedPlanMatch);
        setStep(2);
      } else if (fetchedPlans.length > 0) {
        setSelectedPlan(fetchedPlans[0]);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError('Erreur lors du chargement des plans');
    } finally {
      setLoadingPlans(false);
    }
  }, [searchParams]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

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

    if (!acceptedTerms || !acceptedPrivacyPolicy) {
      setError('Vous devez accepter les CGU, les CGV et prendre connaissance de la politique de confidentialité.');
      setLoading(false);
      return;
    }

    if (customerType === 'consumer' && !immediateServiceRequested) {
      setError('Les particuliers doivent demander expressément l’accès immédiat au service.');
      setLoading(false);
      return;
    }

    try {
      const { companyName, ...identity } = formData;
      const registerData: RegisterDto = {
        ...identity,
        ...(customerType === 'professional'
          ? { companyName: companyName?.trim() }
          : {}),
        planId: selectedPlan.id.toString(),
        customerType,
        acceptedTerms,
        acceptedPrivacyPolicy,
        immediateServiceRequested:
          customerType === 'consumer' && immediateServiceRequested,
      };

      const response = await authService.register(registerData);

      // Sauvegarder les tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('tenant_id', response.user.tenantId.toString());

      // Plan payant : rediriger vers Stripe Checkout
      // Plan gratuit : rediriger vers le dashboard
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-flotteq-navy via-flotteq-blue to-flotteq-teal py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">
            Créer votre compte FlotteQ
          </h2>
          <p className="mt-2 text-sm text-white/85">
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
              <>
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const isQuoteOnlyPlan =
                      Number(plan.price) === 0 && plan.maxVehicles === -1;

                    return (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
                          isQuoteOnlyPlan
                            ? 'border-gray-200'
                            : selectedPlan?.id === plan.id
                              ? 'border-flotteq-blue cursor-pointer'
                              : 'border-gray-200 hover:border-flotteq-blue cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isQuoteOnlyPlan) handlePlanSelect(plan);
                        }}
                      >
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {isQuoteOnlyPlan ? 'Sur devis' : `${Number(plan.price).toFixed(2)}€ TTC`}
                      </span>
                      {!isQuoteOnlyPlan && <span className="ml-1 text-gray-500">/mois</span>}
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
                    {isQuoteOnlyPlan ? (
                      <a
                        href="mailto:contact@flotteq.fr?subject=Demande%20Enterprise"
                        className="mt-6 block w-full bg-flotteq-blue text-center text-white py-2 px-4 rounded-md hover:bg-flotteq-navy transition-colors"
                      >
                        Demander une offre Enterprise
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="mt-6 w-full bg-flotteq-blue text-white py-2 px-4 rounded-md hover:bg-flotteq-navy transition-colors"
                      >
                        Choisir {plan.name}
                      </button>
                    )}
                      </div>
                    );
                  })}
                </div>
              </>
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
                  Plan sélectionné: <strong>{selectedPlan.name}</strong> - {Number(selectedPlan.price).toFixed(2)}€/mois TTC
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700">
                  Vous vous inscrivez en tant que
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 p-3 text-sm text-gray-700 has-[:checked]:border-flotteq-blue has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="customerType"
                      value="professional"
                      checked={customerType === 'professional'}
                      onChange={() => setCustomerType('professional')}
                    />
                    Professionnel
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 p-3 text-sm text-gray-700 has-[:checked]:border-flotteq-blue has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="customerType"
                      value="consumer"
                      checked={customerType === 'consumer'}
                      onChange={() => setCustomerType('consumer')}
                    />
                    Particulier
                  </label>
                </div>
              </fieldset>

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

              {customerType === 'professional' && (
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
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {customerType === 'professional' ? 'Email professionnel' : 'Email'}
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
                <PasswordInput
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

              <div className="space-y-3 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    required
                    className="mt-1"
                  />
                  <span>
                    J’accepte les <a className="text-flotteq-blue underline" href="https://flotteq.fr/cgu">CGU</a> et les <a className="text-flotteq-blue underline" href="https://flotteq.fr/cgv">CGV</a>.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacyPolicy}
                    onChange={(event) => setAcceptedPrivacyPolicy(event.target.checked)}
                    required
                    className="mt-1"
                  />
                  <span>
                    J’ai lu la <a className="text-flotteq-blue underline" href="https://flotteq.fr/rgpd">politique de confidentialité</a>.
                  </span>
                </label>
                {customerType === 'consumer' && (
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={immediateServiceRequested}
                      onChange={(event) => setImmediateServiceRequested(event.target.checked)}
                      required
                      className="mt-1"
                    />
                    <span>
                      Je demande expressément l’accès immédiat à FlotteQ avant la fin du délai de rétractation.
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-flotteq-blue hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Continuer vers le paiement'}
              </button>
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
