import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { billingService } from '@/api/services/billing.service';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [hasVerificationError, setHasVerificationError] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Poll subscription status to ensure webhook has been processed
    let pollCount = 0;
    const maxPolls = 10; // Max 10 attempts (10 seconds)
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const pollSubscriptionStatus = async () => {
      try {
        const stats = await billingService.getSubscriptionStats();
        if (!stats || stats.status !== 'active') {
          throw new Error('Abonnement non confirmé');
        }
        if (cancelled) return;
        setIsVerified(true);
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying subscription:', error);
        if (cancelled) return;
        pollCount++;

        // If we've tried enough times, just proceed anyway
        if (pollCount >= maxPolls) {
          setHasVerificationError(true);
          setIsVerifying(false);
        } else {
          // Retry after 1 second
          retryTimer = setTimeout(pollSubscriptionStatus, 1000);
        }
      }
    };

    // Start polling
    pollSubscriptionStatus();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    // Start countdown only after verification is done
    if (!isVerifying && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isVerified && countdown === 0) {
      navigate('/billing');
    }
  }, [isVerifying, isVerified, countdown, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          {isVerifying ? (
            <Loader2 className="h-20 w-20 text-flotteq-blue mx-auto animate-spin" />
          ) : isVerified ? (
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          ) : (
            <div className="h-20 w-20 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-4xl">!</div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {isVerifying
            ? 'Vérification en cours...'
            : isVerified
              ? 'Abonnement activé'
              : hasVerificationError
                ? 'Activation non confirmée'
                : 'Activation en attente'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isVerifying
            ? 'Nous vérifions votre paiement avec Stripe...'
            : isVerified
              ? `Votre abonnement est actif. Redirection dans ${countdown} seconde${countdown > 1 ? 's' : ''}...`
            : hasVerificationError
              ? 'Nous ne pouvons pas confirmer l’activation de votre abonnement pour le moment. Consultez la facturation ou contactez le support si le problème persiste.'
              : 'Le retour de Stripe est reçu, mais FlotteQ n’a pas encore confirmé l’activation de votre abonnement. Actualisez la facturation dans quelques instants.'
          }
        </p>
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="h-2 w-2 bg-flotteq-blue rounded-full animate-pulse" />
            <div className="h-2 w-2 bg-flotteq-blue rounded-full animate-pulse delay-75" />
            <div className="h-2 w-2 bg-flotteq-blue rounded-full animate-pulse delay-150" />
          </div>
        )}
        {!isVerifying && isVerified && (
          <button
            onClick={() => navigate('/billing')}
            className="mt-6 text-flotteq-blue hover:text-flotteq-navy font-medium transition-colors"
          >
            Aller à la facturation maintenant
          </button>
        )}
        {!isVerifying && !isVerified && (
          <button
            onClick={() => navigate('/billing')}
            className="mt-6 text-flotteq-blue hover:text-flotteq-navy font-medium transition-colors"
          >
            Vérifier ma facturation
          </button>
        )}
      </div>
    </div>
  );
}
