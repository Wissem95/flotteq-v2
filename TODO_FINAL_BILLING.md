# ✅ TODO Final - Module Billing FlotteQ

**Date :** 2025-10-10
**Temps total estimé :** 30-45 minutes

---

## 📋 CE QUI RESTE À FAIRE

### 🎯 PRIORITÉ HAUTE (À faire maintenant - 30 min)

#### ✅ 1. Configuration Stripe Dashboard (15 min)

**Pourquoi :** Sans cela, les boutons upgrade ne fonctionneront pas.

**Étapes :**
1. [ ] Créer compte Stripe sur https://dashboard.stripe.com/register (si pas déjà fait)
2. [ ] Activer le **mode Test** (toggle en haut à droite)
3. [ ] Créer 4 Products :
   - [ ] Starterss (29€/mois) → Copier Price ID
   - [ ] Standard (49.99€/mois) → Copier Price ID
   - [ ] Business (99€/mois) → Copier Price ID
   - [ ] Enterprise (299€/mois) → Copier Price ID
4. [ ] Aller dans **Developers** → **API keys** :
   - [ ] Copier **Publishable key** (pk_test_...)
   - [ ] Copier **Secret key** (sk_test_...)
5. [ ] Aller dans **Developers** → **Webhooks** :
   - [ ] Créer endpoint : `http://localhost:3000/api/stripe/webhook`
   - [ ] Sélectionner events : subscription.*, invoice.*
   - [ ] Copier **Webhook signing secret** (whsec_...)

**📄 Guide détaillé :** [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md) (Section "ÉTAPE 1")

---

#### ✅ 2. Configuration Backend (5 min)

**Étapes :**

1. [ ] Ouvrir `backend/.env`
2. [ ] Modifier ces lignes (remplacer par VOS clés) :
   ```env
   STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
   STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI
   FRONTEND_URL=http://localhost:5174
   ```

3. [ ] Remplir les Price IDs en base de données :
   ```bash
   # Se connecter à PostgreSQL
   PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev
   ```

   ```sql
   -- Remplacer price_XXX par vos vrais Price IDs de Stripe
   UPDATE subscription_plans SET "stripePriceId" = 'price_XXX' WHERE name = 'Starterss';
   UPDATE subscription_plans SET "stripePriceId" = 'price_YYY' WHERE name = 'Standard';
   UPDATE subscription_plans SET "stripePriceId" = 'price_ZZZ' WHERE name = 'Business';
   UPDATE subscription_plans SET "stripePriceId" = 'price_AAA' WHERE name = 'Enterprise';

   -- Vérifier
   SELECT name, price, "stripePriceId" FROM subscription_plans;
   ```

4. [ ] Redémarrer le backend :
   ```bash
   cd backend
   npm run start:dev
   ```

**📄 Guide détaillé :** [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md) (Section "ÉTAPE 2")

---

#### ✅ 3. Configuration Frontend (5 min)

**Étapes :**

1. [ ] Créer `frontend-client/.env` :
   ```bash
   cd frontend-client
   touch .env
   ```

2. [ ] Éditer `frontend-client/.env` :
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
   ```

3. [ ] Redémarrer le frontend :
   ```bash
   npm run dev
   ```

**📄 Guide détaillé :** [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md) (Section "ÉTAPE 3")

---

#### ✅ 4. Tests Fonctionnels (5 min)

**Checklist de test :**

1. [ ] Page `/billing` s'affiche sans erreur
2. [ ] Usage véhicules affiche **1/10** (pas 0/10)
3. [ ] Modal upgrade s'ouvre au click
4. [ ] Click "Choisir ce plan" redirige vers Stripe Checkout
5. [ ] Test paiement avec carte `4242 4242 4242 4242`
6. [ ] Redirect vers `/billing/success` après paiement
7. [ ] Webhook reçu dans Stripe Dashboard (200 OK)

**📄 Guide détaillé :** [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md) (Section "ÉTAPE 4")

---

### 🟡 PRIORITÉ MOYENNE (Optionnel - 1-2h)

#### ✅ 5. Tests avec Nouveau Tenant (30 min)

**Pourquoi :** Vérifier que le système fonctionne pour les futurs clients.

**Étapes :**

1. [ ] Créer un nouveau tenant de test :
   - Email : `test-billing@example.com`
   - Nom : `Test Billing Corp`

2. [ ] Vérifier automatiquement créé :
   ```sql
   SELECT id, email, stripe_customer_id
   FROM tenants
   WHERE email = 'test-billing@example.com';
   -- Doit avoir un stripe_customer_id !
   ```

3. [ ] Créer 1 véhicule

4. [ ] Vérifier usage incrémenté :
   ```sql
   SELECT usage
   FROM subscriptions
   WHERE "tenantId" = (SELECT id FROM tenants WHERE email = 'test-billing@example.com');
   -- Doit afficher : {"vehicles": 1, "users": 1, "drivers": 0}
   ```

5. [ ] Aller sur `/billing` et vérifier affichage correct

---

#### ✅ 6. Créer Script de Synchronisation (1h)

**Pourquoi :** Sécurité si un usage n'est pas bien tracké.

**Fichier à créer :** `backend/src/scripts/sync-subscriptions.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FixUsageSync } from '../modules/subscriptions/fix-usage-sync';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const syncService = app.get(FixUsageSync);

  console.log('🔄 Synchronizing all subscriptions...');
  await syncService.syncAllSubscriptions();
  console.log('✅ Done!');

  await app.close();
}

bootstrap();
```

**Usage :**
```bash
cd backend
ts-node src/scripts/sync-subscriptions.ts
```

**Optionnel :** Ajouter dans package.json :
```json
{
  "scripts": {
    "sync:subscriptions": "ts-node src/scripts/sync-subscriptions.ts"
  }
}
```

---

### 🟢 PRIORITÉ BASSE (Post-MVP - 2-3h)

#### ✅ 7. Tests Unitaires Backend (1h)

**Fichier :** `backend/src/modules/subscriptions/subscriptions.controller.spec.ts`

Ajouter tests pour :
- [ ] `POST /create-checkout-session`
- [ ] `GET /invoices`
- [ ] `GET /invoices/:id/download`
- [ ] `GET /payment-method`

---

#### ✅ 8. Tests E2E Frontend (1h)

**Fichier :** `frontend-client/cypress/e2e/billing.cy.ts`

Ajouter tests pour :
- [ ] Affichage page billing
- [ ] Ouverture modal upgrade
- [ ] Redirect Stripe Checkout
- [ ] Affichage factures

---

#### ✅ 9. Monitoring & Alertes (30 min)

- [ ] Configurer alertes Stripe (Dashboard → Settings → Notifications)
- [ ] Logger tous les webhooks reçus
- [ ] Ajouter Sentry/logging pour erreurs billing

---

#### ✅ 10. Documentation Utilisateur (30 min)

- [ ] Guide "Comment upgrader mon plan"
- [ ] Guide "Comment gérer ma carte bancaire"
- [ ] Guide "Comment télécharger mes factures"
- [ ] FAQ billing

---

## 📊 Résumé Visuel

```
┌─────────────────────────────────────────────────────┐
│  PRIORITÉ HAUTE (30 min)                            │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. Config Stripe Dashboard      [15 min]    │  │
│  │ 2. Config Backend .env          [5 min]     │  │
│  │ 3. Config Frontend .env         [5 min]     │  │
│  │ 4. Tests fonctionnels           [5 min]     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ⚠️ BLOQUANT - À faire MAINTENANT                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  PRIORITÉ MOYENNE (1-2h)                            │
│  ┌──────────────────────────────────────────────┐  │
│  │ 5. Tests nouveau tenant         [30 min]    │  │
│  │ 6. Script synchronisation       [1h]        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ✅ Recommandé - Cette semaine                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  PRIORITÉ BASSE (2-3h)                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ 7. Tests unitaires backend      [1h]        │  │
│  │ 8. Tests E2E frontend           [1h]        │  │
│  │ 9. Monitoring & alertes         [30 min]    │  │
│  │ 10. Documentation utilisateur   [30 min]    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  📅 Optionnel - Prochaines semaines                │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Validation Finale

**Avant de dire "C'est terminé", vérifier :**

### Backend ✅
- [ ] `STRIPE_SECRET_KEY` configuré dans `.env`
- [ ] `STRIPE_WEBHOOK_SECRET` configuré dans `.env`
- [ ] 4 plans ont `stripePriceId` rempli en DB
- [ ] Backend démarre sans erreur
- [ ] Logs montrent "Stripe configured"

### Frontend ✅
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` configuré dans `.env`
- [ ] Frontend démarre sans erreur
- [ ] Page `/billing` accessible
- [ ] Aucune erreur console

### Stripe Dashboard ✅
- [ ] 4 Products créés avec prix mensuels
- [ ] Webhook endpoint configuré
- [ ] Mode Test activé

### Tests Manuels ✅
- [ ] Page billing affiche plan actuel
- [ ] Usage véhicules/users correct (pas 0%)
- [ ] Modal upgrade s'ouvre
- [ ] Redirect Stripe Checkout fonctionne
- [ ] Carte test `4242...` acceptée
- [ ] Webhook reçu (200 OK)

---

## 🎯 PROCHAINE ÉTAPE IMMÉDIATE

**👉 COMMENCER PAR :** [GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md)

Suivez le guide étape par étape, ça prend 30 minutes maximum.

---

## 📞 En Cas de Problème

### Problème : Modal upgrade ne s'ouvre pas
**Solution :** Vérifier console navigateur (F12) pour voir l'erreur

### Problème : Erreur "No Stripe customer found"
**Solution :** Voir [FT1-008_BUGFIX_USAGE_AND_STRIPE.md](FT1-008_BUGFIX_USAGE_AND_STRIPE.md)

### Problème : Redirect Stripe ne fonctionne pas
**Solution :** Vérifier que `stripePriceId` est rempli en DB

### Problème : Webhook erreur 500
**Solution :** Vérifier `STRIPE_WEBHOOK_SECRET` dans `.env`

---

## 📚 Documentation Disponible

1. **[GUIDE_CONFIGURATION_STRIPE.md](GUIDE_CONFIGURATION_STRIPE.md)** ⭐
   → Guide complet configuration Stripe (COMMENCEZ ICI)

2. **[FT1-008_IMPLEMENTATION_COMPLETE.md](FT1-008_IMPLEMENTATION_COMPLETE.md)**
   → Implémentation complète du module Billing (48% → 95%)

3. **[FT1-008_BUGFIX_USAGE_AND_STRIPE.md](FT1-008_BUGFIX_USAGE_AND_STRIPE.md)**
   → Correction des 3 bugs identifiés

4. **[FT1-008_AUTO_USAGE_TRACKING.md](FT1-008_AUTO_USAGE_TRACKING.md)**
   → Suivi automatique de l'usage (véhicules/users/drivers)

---

## ✅ Checklist Simplifiée

**Pour aller vite (minimum viable) :**

```bash
# 1. Créer Products sur Stripe Dashboard (15 min)
# 2. Copier les 3 clés Stripe (2 min)

# 3. Backend .env
echo "STRIPE_SECRET_KEY=sk_test_xxx" >> backend/.env
echo "STRIPE_WEBHOOK_SECRET=whsec_xxx" >> backend/.env

# 4. Frontend .env
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx" > frontend-client/.env

# 5. Remplir Price IDs en DB (3 min)
psql ... # Voir guide

# 6. Redémarrer tout (2 min)
# Backend : npm run start:dev
# Frontend : npm run dev

# 7. Tester (3 min)
# Aller sur /billing, cliquer upgrade, tester paiement

# TOTAL : 25-30 minutes ✅
```

---

**🚀 Vous êtes prêt ! Suivez le guide et vous aurez un système billing fonctionnel en 30 minutes.**
