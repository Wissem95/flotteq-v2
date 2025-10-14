import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { billingService } from '@/api/services/billing.service';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Poll subscription status to ensure webhook has been processed
    let pollCount = 0;
    const maxPolls = 10; // Max 10 attempts (10 seconds)

    const pollSubscriptionStatus = async () => {
      try {
        const stats = await billingService.getSubscriptionStats();
        console.log('Subscription verified after payment:', stats);
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying subscription:', error);
        pollCount++;

        // If we've tried enough times, just proceed anyway
        if (pollCount >= maxPolls) {
          setIsVerifying(false);
        } else {
          // Retry after 1 second
          setTimeout(pollSubscriptionStatus, 1000);
        }
      }
    };

    // Start polling
    pollSubscriptionStatus();
  }, []);

  useEffect(() => {
    // Start countdown only after verification is done
    if (!isVerifying && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate('/billing');
    }
  }, [isVerifying, countdown, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          {isVerifying ? (
            <Loader2 className="h-20 w-20 text-flotteq-blue mx-auto animate-spin" />
          ) : (
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {isVerifying ? 'Vérification en cours...' : 'Paiement réussi !'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isVerifying
            ? 'Nous vérifions votre paiement avec Stripe...'
            : `Votre abonnement a été activé avec succès. Redirection dans ${countdown} seconde${countdown > 1 ? 's' : ''}...`
          }
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="h-2 w-2 bg-flotteq-blue rounded-full animate-pulse" />
          <div className="h-2 w-2 bg-flotteq-blue rounded-full animate-pulse delay-75" />
          <div className="h-2 w-2 bg-flotteq-blue rounded-full animate-pulse delay-150" />
        </div>
        {!isVerifying && (
          <button
            onClick={() => navigate('/billing')}
            className="mt-6 text-flotteq-blue hover:text-flotteq-navy font-medium transition-colors"
          >
            Aller à la facturation maintenant
          </button>
        )}
      </div>
    </div>
  );
}
