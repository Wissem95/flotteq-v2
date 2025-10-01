// src/contexts/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  getCurrentSubscription,
  getSubscriptionStatus,
  needsSubscriptionSelection,
  handleSubscriptionError,
  type CurrentSubscription
} from '@/services/subscriptionService';

interface SubscriptionState {
  currentSubscription: CurrentSubscription | null;
  hasSubscription: boolean;
  isLoading: boolean;
  subscriptionStatus: {
    hasSubscription: boolean;
    status: string;
    message: string;
    needsSubscription: boolean;
    daysRemaining?: number;
  };
}

interface SubscriptionContextType extends SubscriptionState {
  // Modal state
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (show: boolean) => void;
  
  // Actions
  refreshSubscription: () => Promise<void>;
  checkSubscriptionRequired: () => Promise<boolean>;
  handleSubscriptionRequired: (reason?: string) => void;
  handleApiError: (error: any) => boolean; // Returns true if error was subscription-related
  
  // Subscription change handlers
  onSubscriptionSuccess: () => void;
  onSubscriptionCancelled: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  autoCheckOnLoad?: boolean;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
  autoCheckOnLoad = true
}) => {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    currentSubscription: null,
    hasSubscription: false,
    isLoading: true,
    subscriptionStatus: {
      hasSubscription: false,
      status: 'loading',
      message: 'Vérification du statut d\'abonnement...',
      needsSubscription: false
    }
  });

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Refresh subscription data from server
  const refreshSubscription = useCallback(async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true }));

      const [currentSubscription, subscriptionStatus] = await Promise.all([
        getCurrentSubscription(),
        getSubscriptionStatus()
      ]);

      setSubscriptionState({
        currentSubscription,
        hasSubscription: currentSubscription !== null,
        isLoading: false,
        subscriptionStatus
      });

      // Auto-show modal if subscription is required but not present
      if (subscriptionStatus.needsSubscription && autoCheckOnLoad) {
        setShowSubscriptionModal(true);
      }

      return;
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        subscriptionStatus: {
          hasSubscription: false,
          status: 'error',
          message: 'Impossible de vérifier le statut d\'abonnement',
          needsSubscription: true
        }
      }));
    }
  }, [autoCheckOnLoad]);

  // Check if subscription is required for current user
  const checkSubscriptionRequired = useCallback(async (): Promise<boolean> => {
    try {
      const { needsSelection } = await needsSubscriptionSelection();
      return needsSelection;
    } catch (error) {
      console.error('Error checking subscription requirement:', error);
      return true; // Default to requiring subscription on error
    }
  }, []);

  // Handle when subscription is required (show modal with reason)
  const handleSubscriptionRequired = useCallback((reason?: string) => {
    setSubscriptionState(prev => ({
      ...prev,
      subscriptionStatus: {
        ...prev.subscriptionStatus,
        needsSubscription: true,
        message: reason || 'Un abonnement est requis pour accéder à cette fonctionnalité'
      }
    }));
    setShowSubscriptionModal(true);
  }, []);

  // Handle API errors that might be subscription-related
  const handleApiError = useCallback((error: any): boolean => {
    const subscriptionError = handleSubscriptionError(error);
    
    if (subscriptionError.type !== 'generic_error') {
      // This is a subscription-related error
      let message = subscriptionError.message;
      
      switch (subscriptionError.type) {
        case 'subscription_required':
          message = 'Vous devez sélectionner un plan d\'abonnement pour continuer';
          break;
        case 'subscription_expired':
          message = `Votre abonnement ${subscriptionError.planName || ''} a expiré`;
          break;
        case 'trial_expired':
          message = 'Votre période d\'essai a expiré';
          break;
      }

      handleSubscriptionRequired(message);
      return true;
    }
    
    return false;
  }, [handleSubscriptionRequired]);

  // Handle successful subscription
  const onSubscriptionSuccess = useCallback(() => {
    setShowSubscriptionModal(false);
    refreshSubscription();
    
    // Show success message
    // Note: You might want to use a toast notification here
    console.log('Subscription successful! Refreshing data...');
  }, [refreshSubscription]);

  // Handle subscription cancellation
  const onSubscriptionCancelled = useCallback(() => {
    refreshSubscription();
    
    // Show cancellation message
    console.log('Subscription cancelled. Refreshing data...');
  }, [refreshSubscription]);

  // Load subscription data on mount
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Auto-check subscription periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSubscription();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshSubscription]);

  const contextValue: SubscriptionContextType = {
    ...subscriptionState,
    showSubscriptionModal,
    setShowSubscriptionModal,
    refreshSubscription,
    checkSubscriptionRequired,
    handleSubscriptionRequired,
    handleApiError,
    onSubscriptionSuccess,
    onSubscriptionCancelled
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook to use subscription context
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Higher-order component to protect routes that require subscription
export const withSubscriptionCheck = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithSubscriptionCheckComponent = (props: P) => {
    const { subscriptionStatus, handleSubscriptionRequired, isLoading } = useSubscription();

    useEffect(() => {
      if (!isLoading && subscriptionStatus.needsSubscription) {
        handleSubscriptionRequired('Cette page nécessite un abonnement actif');
      }
    }, [isLoading, subscriptionStatus.needsSubscription, handleSubscriptionRequired]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Vérification de l'abonnement...</span>
        </div>
      );
    }

    if (subscriptionStatus.needsSubscription) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Abonnement requis
          </h2>
          <p className="text-gray-600 mb-4">
            {subscriptionStatus.message}
          </p>
          <button
            onClick={() => handleSubscriptionRequired()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir les plans d'abonnement
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithSubscriptionCheckComponent.displayName = `withSubscriptionCheck(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithSubscriptionCheckComponent;
};

// Hook for API calls that might require subscription
export const useSubscriptionAwareApi = () => {
  const { handleApiError } = useSubscription();

  const apiCall = useCallback(function<T>(
    apiFunction: () => Promise<T>
  ): () => Promise<T | null> {
    return async (): Promise<T | null> => {
      try {
        return await apiFunction();
      } catch (error) {
        const wasSubscriptionError = handleApiError(error);
        if (!wasSubscriptionError) {
          // Re-throw if it's not a subscription error
          throw error;
        }
        return null;
      }
    };
  }, [handleApiError]);

  return { apiCall };
};

export default SubscriptionContext;