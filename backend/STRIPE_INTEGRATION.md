# Intégration Stripe - FlotteQ Backend

## Vue d'ensemble

L'intégration Stripe permet de gérer les abonnements des tenants FlotteQ avec :
- Création automatique de customer Stripe lors de l'inscription
- Gestion des abonnements avec période d'essai de 14 jours
- Webhooks pour synchroniser les événements de paiement
- Contrôle d'accès basé sur le statut d'abonnement

## Architecture

### Modules

- **StripeModule** (`src/stripe/`)
  - `stripe.service.ts` - Service principal pour les opérations Stripe
  - `stripe.controller.ts` - Endpoints pour webhooks et portal client
  - `dto/` - DTOs pour les requêtes Stripe
  - `types/` - Types TypeScript pour Stripe

### Entité Tenant (étendue)

Nouveaux champs ajoutés à `Tenant`:
```typescript
stripeCustomerId: string        // ID du customer Stripe
stripeSubscriptionId: string    // ID de la subscription Stripe
subscriptionStatus: string      // trial, active, past_due, cancelled, incomplete
trialEndsAt: Date              // Date de fin de la période d'essai
subscriptionStartedAt: Date    // Date de début de l'abonnement
subscriptionEndedAt: Date      // Date de fin de l'abonnement
```

## Configuration

### Variables d'environnement

Ajouter dans `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
STRIPE_TRIAL_DAYS=14
FRONTEND_URL=http://localhost:3000
```

### Configuration Stripe Dashboard

1. **Créer un Product**
   - Nom: "FlotteQ Monthly Plan" (ou selon votre besoin)
   - Type: Recurring

2. **Créer un Price**
   - Montant: 49€/mois (ou selon votre modèle)
   - Copier le `price_xxx` ID dans `STRIPE_PRICE_ID`

3. **Configurer les Webhooks**
   - URL: `https://votreapi.com/stripe/webhook`
   - Events à écouter:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.trial_will_end`
   - Copier le Webhook Secret dans `STRIPE_WEBHOOK_SECRET`

## Flux d'utilisation

### 1. Création d'un tenant

Lors de la création d'un tenant via `POST /tenants`:
1. Le tenant est créé en DB avec `subscriptionStatus = 'trial'`
2. Un customer Stripe est créé automatiquement
3. Une subscription avec 14 jours de trial est créée
4. Le tenant reçoit `stripeCustomerId` et `stripeSubscriptionId`

### 2. Webhooks Stripe

Les événements Stripe sont reçus via `POST /stripe/webhook`:

#### customer.subscription.created
- Met à jour `subscriptionStatus` et `subscriptionStartedAt`
- Définit `trialEndsAt` si en période d'essai

#### customer.subscription.updated
- Met à jour le `subscriptionStatus` (active, past_due, etc.)
- Enregistre `subscriptionEndedAt` si annulé

#### invoice.payment_succeeded
- Confirme le paiement
- Set `subscriptionStatus = 'active'`

#### invoice.payment_failed
- Set `subscriptionStatus = 'past_due'`
- Le tenant reçoit une alerte pour mettre à jour son moyen de paiement

### 3. Contrôle d'accès

Le `SubscriptionGuard` bloque l'accès si:
- La subscription est expirée (`past_due`, `cancelled`, `incomplete`)
- La période d'essai est terminée

Pour appliquer le guard:
```typescript
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Get('protected-endpoint')
async protectedRoute() { }
```

### 4. Portal client

Les tenants peuvent gérer leur abonnement via:
```
POST /stripe/create-portal-session
```

Retourne une URL vers le Stripe Customer Portal où ils peuvent:
- Mettre à jour leur moyen de paiement
- Voir leurs factures
- Annuler leur abonnement

## Méthodes StripeService

### createCustomer(tenant, email)
Crée un customer Stripe avec metadata tenant.

### createSubscription(customerId, priceId)
Crée une subscription avec période d'essai.

### getSubscriptionStatus(subscriptionId)
Récupère le statut actuel d'une subscription.

### cancelSubscription(subscriptionId)
Annule une subscription.

### createPortalSession(customerId, returnUrl)
Génère une URL vers le portal client.

### isTrial(tenant)
Vérifie si un tenant est en période d'essai valide.

### isActive(tenant)
Vérifie si un tenant a un accès actif (subscription active ou trial valide).

### handleWebhook(signature, payload)
Traite les webhooks Stripe avec vérification de signature.

## Tests

### Exécuter les tests

```bash
# Tests Stripe
npm test -- stripe

# Tests TenantsService (avec Stripe)
npm test -- tenants.service.spec

# Tous les tests
npm test
```

### Couverture des tests

- ✅ StripeService (26 tests)
  - Création de customer
  - Création de subscription
  - Gestion des statuts
  - Webhooks handlers
  - Vérifications d'accès

- ✅ StripeController
  - Webhook endpoint
  - Portal session creation

- ✅ TenantsService (18 tests)
  - Intégration Stripe lors de la création
  - Méthode `canAccess()`

## Tests en local avec Stripe CLI

### Installation
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

### Écouter les webhooks
```bash
stripe listen --forward-to localhost:3000/stripe/webhook
```

### Déclencher des events de test
```bash
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Sécurité

⚠️ **Important:**
- Toujours vérifier la signature des webhooks
- Ne jamais exposer `STRIPE_SECRET_KEY`
- Utiliser `sk_test_` en développement, `sk_live_` en production
- Configurer le webhook secret différemment par environnement

## Migration

La migration TypeORM suivante a été appliquée:
```
src/migrations/1759327952020-AddStripeFieldsToTenants.ts
```

Pour rollback:
```bash
npm run migration:revert
```

## Statuts d'abonnement

| Status | Description | Accès autorisé |
|--------|-------------|----------------|
| `trial` | Période d'essai en cours | ✅ Oui |
| `active` | Abonnement actif | ✅ Oui |
| `past_due` | Paiement en retard | ❌ Non |
| `cancelled` | Abonnement annulé | ❌ Non |
| `incomplete` | Paiement initial incomplet | ❌ Non |

## Roadmap

- [ ] Notifications par email lors des événements de paiement
- [ ] Dashboard admin pour voir les statuts Stripe
- [ ] Support des coupons de réduction
- [ ] Facturation par usage (si applicable)
- [ ] Gestion des upgrades/downgrades de plan

## Support

Pour les questions liées à Stripe:
- Documentation Stripe: https://stripe.com/docs/api
- Support Stripe: https://support.stripe.com

Pour les questions sur FlotteQ:
- Voir TENANT_IMPLEMENTATION.md
- Contacter l'équipe technique
