import { useState, useEffect } from 'react';
import { CreditCard, Edit, Loader2 } from 'lucide-react';
import { billingService, type PaymentMethod } from '@/api/services/billing.service';

export default function PaymentMethodCard() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethod();
  }, []);

  const loadPaymentMethod = async () => {
    try {
      setLoading(true);
      const data = await billingService.getPaymentMethod();
      setPaymentMethod(data);
    } catch (error) {
      console.error('Failed to load payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      await billingService.openCustomerPortal();
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      alert('Erreur lors de l\'ouverture du portail de gestion');
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandIcons: Record<string, string> = {
      visa: '💳 VISA',
      mastercard: '💳 Mastercard',
      amex: '💳 Amex',
    };
    return brandIcons[brand.toLowerCase()] || '💳 ' + brand;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Méthode de paiement</h2>
        </div>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-flotteq-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Méthode de paiement</h2>
        </div>
        {paymentMethod && (
          <button
            onClick={handleUpdatePaymentMethod}
            className="flex items-center gap-2 text-sm text-flotteq-blue hover:text-flotteq-navy transition-colors font-medium"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        )}
      </div>

      {!paymentMethod ? (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucune méthode de paiement enregistrée</p>
          <p className="text-gray-400 text-xs mt-2">
            Votre carte sera enregistrée automatiquement lors de votre premier paiement
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-flotteq-blue to-flotteq-navy text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">{getCardBrandIcon(paymentMethod.brand)}</span>
            <CreditCard className="h-8 w-8 opacity-50" />
          </div>
          <div className="mb-4">
            <div className="text-2xl font-mono tracking-wider">
              •••• •••• •••• {paymentMethod.last4}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>Expire le</span>
            <span className="font-medium">
              {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
