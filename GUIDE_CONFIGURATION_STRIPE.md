# 🔧 Guide Configuration Stripe - FlotteQ

**Temps estimé :** 30 minutes
**Difficulté :** Facile
**Prérequis :** Compte Stripe (gratuit)

---

## 📋 CHECKLIST COMPLÈTE

### ✅ Déjà Fait (par Claude)
- [x] Backend endpoints billing créés
- [x] Frontend pages billing créées
- [x] Auto-tracking usage implémenté
- [x] Stripe SDK installé backend
- [x] `@stripe/stripe-js` installé frontend
- [x] Webhooks handler créé
- [x] Bug usage synchronisé pour tenant actuel

### ⚠️ À FAIRE PAR VOUS

#### 1. Configuration Stripe Dashboard (15 min)
- [ ] Créer compte Stripe (ou se connecter)
- [ ] Créer des Products et Prices
- [ ] Configurer webhooks
- [ ] Copier clés API

#### 2. Configuration Backend (5 min)
- [ ] Mettre à jour `.env` backend avec clés Stripe
- [ ] Remplir `stripePriceId` en base de données

#### 3. Configuration Frontend (5 min)
- [ ] Créer `.env` frontend
- [ ] Ajouter clé publique Stripe

#### 4. Tests (5 min)
- [ ] Tester création checkout session
- [ ] Tester affichage page billing
- [ ] Vérifier webhooks reçus

---

## 🎯 ÉTAPE 1 : Configuration Stripe Dashboard

### 1.1 Créer un Compte Stripe (si pas encore fait)

1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte avec votre email
3. Vérifier votre email
4. Activer le mode **Test** (toggle en haut à droite)

### 1.2 Créer les Products et Prices

#### Produit 1 : Starterss (29€/mois)

1. Aller dans **Products** → **Add product**
2. Remplir :
   - **Name:** `Starterss`
   - **Description:** `Plan de démarrage - 10 véhicules, 5 utilisateurs`
   - **Pricing model:** `Standard pricing`
   - **Price:** `29.00` EUR
   - **Billing period:** `Monthly`
   - **Payment type:** `Recurring`
3. Cliquer **Save product**
4. **IMPORTANT:** Copier le **Price ID** (commence par `price_...`)
   ```
   Exemple: price_1Abc2DefGhIjK3LmN
   ```

#### Produit 2 : Standard (49.99€/mois)

Répéter les mêmes étapes avec :
- **Name:** `Standard`
- **Description:** `Plan standard - 50 véhicules, 10 utilisateurs`
- **Price:** `49.99` EUR
- Copier le **Price ID**

#### Produit 3 : Business (99€/mois)

- **Name:** `Business`
- **Description:** `Plan business - 50 véhicules, 20 utilisateurs`
- **Price:** `99.00` EUR
- Copier le **Price ID**

#### Produit 4 : Enterprise (299€/mois)

- **Name:** `Enterprise`
- **Description:** `Plan entreprise - Véhicules et utilisateurs illimités`
- **Price:** `299.00` EUR
- Copier le **Price ID**

### 1.3 Récupérer les Clés API

1. Aller dans **Developers** → **API keys**
2. Copier :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (cliquer "Reveal" puis copier, commence par `sk_test_...`)

**⚠️ IMPORTANT :** Gardez ces clés secrètes ! Ne les committez jamais sur Git.

### 1.4 Configurer les Webhooks

1. Aller dans **Developers** → **Webhooks**
2. Cliquer **Add endpoint**
3. Remplir :
   - **Endpoint URL:** `http://localhost:3000/api/stripe/webhook` (dev)
     ou `https://votre-domaine.com/api/stripe/webhook` (prod)
   - **Description:** `FlotteQ Billing Events`
4. Cliquer **Select events** et cocher :
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Cliquer **Add endpoint**
6. **Copier le Webhook signing secret** (commence par `whsec_...`)

---

## 🎯 ÉTAPE 2 : Configuration Backend

### 2.1 Mettre à Jour backend/.env

Ouvrir `backend/.env` et modifier :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET_ICI

# Frontend URL (pour redirects Stripe)
FRONTEND_URL=http://localhost:5174
```

**Exemple complet :**
```env
STRIPE_SECRET_KEY=sk_test_51SDSHxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrst
FRONTEND_URL=http://localhost:5174
```

### 2.2 Remplir les Price IDs en Base de Données

Ouvrir un terminal et exécuter :

```bash
# Se connecter à PostgreSQL
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev
```

Puis copier-coller ces commandes SQL (en remplaçant par VOS Price IDs) :

```sql
-- Mettre à jour Starterss (29€)
UPDATE subscription_plans
SET "stripePriceId" = 'price_VOTRE_PRICE_ID_STARTERSS'
WHERE name = 'Starterss';

-- Mettre à jour Standard (49.99€)
UPDATE subscription_plans
SET "stripePriceId" = 'price_VOTRE_PRICE_ID_STANDARD'
WHERE name = 'Standard';

-- Mettre à jour Business (99€)
UPDATE subscription_plans
SET "stripePriceId" = 'price_VOTRE_PRICE_ID_BUSINESS'
WHERE name = 'Business';

-- Mettre à jour Enterprise (299€)
UPDATE subscription_plans
SET "stripePriceId" = 'price_VOTRE_PRICE_ID_ENTERPRISE'
WHERE name = 'Enterprise';

-- Vérifier que tout est bien rempli
SELECT id, name, price, "stripePriceId"
FROM subscription_plans
ORDER BY price ASC;
```

**Résultat attendu :**
```
 id |    name    | price  |     stripePriceId
----+------------+--------+------------------------
 10 | Starterss  |  29.00 | price_1Abc2DefGhIjK...
 14 | Standard   |  49.99 | price_1Xyz3UvwRst4...
 11 | Business   |  99.00 | price_1Mno5PqrStu6...
 12 | Enterprise | 299.00 | price_1Jkl7HijKlm8...
```

### 2.3 Redémarrer le Backend

```bash
cd backend
npm run start:dev
```

Vérifier dans les logs :
```
✅ Stripe configured with secret key: sk_test_51...
✅ Application is running on: http://localhost:3000
```

---

## 🎯 ÉTAPE 3 : Configuration Frontend

### 3.1 Créer frontend-client/.env

```bash
cd frontend-client
cp .env.example .env  # Si .env.example existe
# Sinon créer directement .env
```

Éditer `frontend-client/.env` :

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

**Exemple complet :**
```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SDSHxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.2 Redémarrer le Frontend

```bash
cd frontend-client
npm run dev
```

---

## 🎯 ÉTAPE 4 : Tests Complets

### Test 1 : Vérifier Configuration Backend

```bash
# Tester que Stripe répond
curl http://localhost:3000/api/subscriptions/plans

# Résultat attendu : Liste des 4 plans avec stripePriceId rempli
```

### Test 2 : Page Billing Accessible

1. Ouvrir navigateur : http://localhost:5174
2. Se connecter avec `3ws@3ws.com`
3. Cliquer sur **Facturation** dans le menu
4. Vérifier :
   - ✅ Plan actuel affiché (Starterss 29€)
   - ✅ Usage véhicules : 1/10 (10%)
   - ✅ Usage utilisateurs : 2/5 (40%)
   - ✅ Aucune erreur console

### Test 3 : Modal Upgrade

1. Sur la page `/billing`
2. Cliquer bouton **"Passer à un plan payant"** ou **"Mettre à niveau"**
3. Vérifier :
   - ✅ Modal s'ouvre avec 3-4 plans
   - ✅ Chaque plan affiche prix et features
   - ✅ Plan actuel marqué "Plan actuel"

### Test 4 : Créer Checkout Session (TEST IMPORTANT)

1. Dans le modal, cliquer **"Choisir ce plan"** sur Standard
2. Vérifier :
   - ✅ Loader apparaît
   - ✅ Redirect vers `checkout.stripe.com`
   - ✅ Page Stripe Checkout affiche :
     - Montant : 49.99€/mois
     - Nom produit : Standard

**⚠️ NE PAS PAYER** (c'est en mode test)

3. Utiliser carte de test Stripe :
   - **Numéro :** `4242 4242 4242 4242`
   - **Date :** N'importe quelle date future (ex: 12/25)
   - **CVC :** N'importe quel 3 chiffres (ex: 123)
   - **Nom :** Votre nom

4. Cliquer **Pay**

5. Vérifier redirect vers `/billing/success` ✅

### Test 5 : Vérifier Webhook Reçu

1. Aller sur Stripe Dashboard → **Developers** → **Webhooks**
2. Cliquer sur votre endpoint
3. Vérifier dans l'onglet **Recent deliveries** :
   - ✅ `customer.subscription.created` (200 OK)
   - ✅ `invoice.payment_succeeded` (200 OK)

**Si erreur 500 :** Vérifier logs backend pour voir l'erreur.

---

## 🐛 Dépannage

### Erreur : "No Stripe customer found"

**Cause :** Votre tenant n'a pas de `stripe_customer_id`

**Solution :**
```sql
-- Vérifier
SELECT id, name, stripe_customer_id FROM tenants WHERE email = 'votre@email.com';

-- Si NULL, créer un fake customer pour les tests
UPDATE tenants
SET stripe_customer_id = 'cus_test_' || substr(md5(random()::text), 1, 10)
WHERE email = 'votre@email.com';
```

### Erreur : "This plan does not have a Stripe price configured"

**Cause :** Le `stripePriceId` n'est pas rempli en DB

**Solution :** Retourner à l'étape 2.2 et remplir les Price IDs

### Erreur 401 Stripe API

**Cause :** Clé secrète invalide

**Solution :**
1. Vérifier que vous avez copié la **bonne clé** (sk_test_...)
2. Vérifier qu'il n'y a **pas d'espace** avant/après dans `.env`
3. Redémarrer le backend

### Webhook signature failed

**Cause :** Webhook secret invalide

**Solution :**
1. Copier à nouveau le webhook secret depuis Stripe Dashboard
2. Mettre à jour `STRIPE_WEBHOOK_SECRET` dans backend/.env
3. Redémarrer backend

---

## 📊 Récapitulatif Configuration

### Fichiers Modifiés

```
backend/.env
├─ STRIPE_SECRET_KEY=sk_test_xxx...
├─ STRIPE_WEBHOOK_SECRET=whsec_xxx...
└─ FRONTEND_URL=http://localhost:5174

frontend-client/.env
├─ VITE_API_URL=http://localhost:3000/api
└─ VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...

Database (subscription_plans)
├─ Starterss → stripePriceId: price_xxx...
├─ Standard → stripePriceId: price_yyy...
├─ Business → stripePriceId: price_zzz...
└─ Enterprise → stripePriceId: price_aaa...
```

### Services Stripe Utilisés

| Service | Endpoint | Usage |
|---------|----------|-------|
| **Checkout Sessions** | `POST /v1/checkout/sessions` | Créer session paiement upgrade |
| **Customer Portal** | `POST /v1/billing_portal/sessions` | Gérer carte bancaire |
| **Invoices** | `GET /v1/invoices` | Liste factures |
| **Payment Methods** | `GET /v1/customers/:id` | Afficher carte |
| **Webhooks** | `POST /api/stripe/webhook` | Événements temps réel |

---

## 🚀 Production (Plus Tard)

### Passer en Mode LIVE

1. **Stripe Dashboard** : Désactiver le mode Test (toggle en haut)
2. **Créer de vrais Products** avec vrais prix
3. **Copier les nouvelles clés LIVE** :
   - `pk_live_xxx...`
   - `sk_live_xxx...`
4. **Mettre à jour `.env` backend et frontend** avec clés LIVE
5. **Configurer webhook prod** : `https://votre-domaine.com/api/stripe/webhook`
6. **Remplir les nouveaux Price IDs** en DB
7. **Tester avec vraie carte** (sera débité !)

### Sécurité Production

- ✅ Ne JAMAIS committer les fichiers `.env`
- ✅ Utiliser variables d'environnement serveur
- ✅ Activer HTTPS (obligatoire pour Stripe)
- ✅ Vérifier signature webhook en production
- ✅ Monitorer les webhooks (alertes si erreurs)

---

## ✅ Checklist Finale

Avant de dire "C'est bon !" :

- [ ] Stripe Dashboard configuré (products, webhooks)
- [ ] 4 Price IDs copiés et testés
- [ ] `backend/.env` mis à jour avec les 2 clés Stripe
- [ ] `frontend-client/.env` créé avec clé publique
- [ ] Les 4 plans en DB ont `stripePriceId` rempli
- [ ] Backend redémarré sans erreur
- [ ] Frontend redémarré sans erreur
- [ ] Page `/billing` accessible et sans erreur console
- [ ] Modal upgrade s'ouvre avec les plans
- [ ] Click "Choisir ce plan" redirige vers Stripe Checkout
- [ ] Checkout test fonctionne avec carte `4242...`
- [ ] Webhook reçu dans Stripe Dashboard (200 OK)

**Si tous les ✅ sont cochés : CONFIGURATION TERMINÉE ! 🎉**

---

## 📞 Support

**Problème non résolu ?**

1. Vérifier les logs backend (`npm run start:dev`)
2. Vérifier console navigateur (F12)
3. Vérifier Stripe Dashboard → Webhooks → Recent deliveries
4. Relire ce guide étape par étape

**Ressources utiles :**
- [Stripe Testing Cards](https://stripe.com/docs/testing#cards)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)

---

**Configuration Stripe : Prêt à démarrer ! 🚀**
