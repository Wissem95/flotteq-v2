# Intégration du système d'abonnement - Guide rapide

## Modifications requises

### 1. Remplacer App.tsx
Remplacez le contenu de `/src/App.tsx` par celui de `/src/App.updated.tsx`.

### 2. Structure des nouveaux fichiers créés

```
src/
├── services/
│   └── subscriptionService.ts       # Service API pour les abonnements
├── contexts/
│   └── SubscriptionContext.tsx      # Contexte React pour l'état des abonnements
└── components/
    └── subscriptions/
        ├── SubscriptionModal.tsx     # Modal de sélection d'abonnement
        └── SubscriptionManager.tsx   # Gestionnaire automatique de la modal
```

## Fonctionnalités

### Déclenchement automatique de la modal
La modal s'affiche automatiquement quand :
- Un tenant n'a pas d'abonnement actif
- Un essai gratuit expire
- Un abonnement expire
- L'utilisateur accède à une fonctionnalité protégée

### Protection des routes
Utilisez le HOC `withSubscriptionCheck` pour protéger des pages :

```tsx
import { withSubscriptionCheck } from '@/contexts/SubscriptionContext';

const ProtectedPage = withSubscriptionCheck(() => (
  <div>Contenu réservé aux abonnés</div>
));
```

### Appels API conscients de l'abonnement
Utilisez `useSubscriptionAwareApi` pour les appels API :

```tsx
import { useSubscriptionAwareApi } from '@/contexts/SubscriptionContext';

const MyComponent = () => {
  const { apiCall } = useSubscriptionAwareApi();
  
  const fetchData = () => {
    apiCall(() => api.get('/protected-endpoint'))
      .then(data => {
        if (data) {
          // Succès
        }
        // Si null, c'était une erreur d'abonnement (modal déjà affichée)
      });
  };
};
```

### Accès au contexte d'abonnement

```tsx
import { useSubscription } from '@/contexts/SubscriptionContext';

const MyComponent = () => {
  const {
    hasSubscription,
    currentSubscription,
    subscriptionStatus,
    handleSubscriptionRequired
  } = useSubscription();
  
  // Logique basée sur l'abonnement...
};
```

## Backend - Routes protégées

Les routes suivantes sont maintenant protégées par le middleware `require_subscription` :
- `/api/analytics/*` - Analyses avancées
- `/api/finances/*` - Gestion financière
- `/api/transactions/*` - Gestion des transactions

### Réponses d'erreur 402 Payment Required

Quand une fonctionnalité nécessite un abonnement, l'API renvoie :

```json
{
  "error": "Subscription required",
  "message": "This feature requires an active subscription",
  "subscription_required": true,
  "tenant": { "id": 1, "name": "Example" },
  "action_required": "select_subscription_plan"
}
```

Le frontend intercepte automatiquement ces erreurs et affiche la modal.

## Test

Pour tester avec le tenant FlotteQ sans abonnement :
1. Connectez-vous en tant que tenant FlotteQ
2. Accédez à une page protégée (Analytics, Finances, Transactions)
3. La modal devrait s'afficher automatiquement

## Personnalisation

### Modifier les plans d'abonnement
Ajoutez/modifiez les plans dans la base de données via l'interface admin interne à `/internal/subscriptions/plans`.

### Changer l'apparence de la modal
Modifiez `SubscriptionModal.tsx` pour ajuster le design, les couleurs, etc.

### Ajouter des notifications
Intégrez un système de toast pour les succès/erreurs :

```tsx
// Dans SubscriptionManager.tsx
import { toast } from "@/components/ui/use-toast";

const handleSubscriptionSuccess = () => {
  toast({
    title: "Abonnement activé !",
    description: "Votre abonnement a été activé avec succès.",
  });
  onSubscriptionSuccess();
};
```