// src/components/subscriptions/SubscriptionManager.tsx
import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SubscriptionModal from './SubscriptionModal';

/**
 * SubscriptionManager component that automatically handles subscription modal display
 * This component should be placed at the root level of the application
 * to ensure the subscription modal can be shown from anywhere
 */
const SubscriptionManager: React.FC = () => {
  const {
    showSubscriptionModal,
    setShowSubscriptionModal,
    onSubscriptionSuccess,
    subscriptionStatus,
    hasSubscription
  } = useSubscription();

  const handleModalClose = () => {
    // Allow closing modal only if not strictly required
    // If subscription is absolutely required, prevent closing
    if (subscriptionStatus.status === 'trial_expired' || 
        subscriptionStatus.status === 'expired' ||
        (subscriptionStatus.needsSubscription && !hasSubscription)) {
      // For strict requirements, show confirmation
      const shouldClose = window.confirm(
        'Vous devez sélectionner un plan d\'abonnement pour continuer à utiliser l\'application. Êtes-vous sûr de vouloir fermer cette fenêtre ?'
      );
      if (shouldClose) {
        setShowSubscriptionModal(false);
      }
    } else {
      setShowSubscriptionModal(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    onSubscriptionSuccess();
    // Optional: Show success notification
    // toast.success('Abonnement activé avec succès !');
  };

  return (
    <SubscriptionModal
      isOpen={showSubscriptionModal}
      onClose={handleModalClose}
      onSuccess={handleSubscriptionSuccess}
      showCloseButton={!subscriptionStatus.needsSubscription || hasSubscription}
      blurBackground={true}
    />
  );
};

export default SubscriptionManager;