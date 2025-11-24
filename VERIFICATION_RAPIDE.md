# ✅ Vérification Rapide - Checklist 5 minutes

## Backend ✅

```bash
# 1. Migration payment_status exécutée ?
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status'\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log('✅ Column payment_status:', result.includes('payment_status') ? 'EXISTS' : 'MISSING');
"
```

```bash
# 2. Variables STRIPE configurées ?
cd /Users/wissem/Flotteq-v2/backend
grep -E "STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|PARTNER_FRONTEND_URL" .env | head -3
```

**Attendu** :
```
STRIPE_SECRET_KEY=sk_test_51SDSH0...
STRIPE_WEBHOOK_SECRET=whsec_90e3e80b...
PARTNER_FRONTEND_URL=http://localhost:5175
```

---

## Frontend Partner ✅

```bash
# 3. SettingsPage existe ?
ls -la /Users/wissem/Flotteq-v2/frontend-partner/src/pages/SettingsPage.tsx
```

```bash
# 4. Route /settings configurée ?
grep -n "path=\"/settings\"" /Users/wissem/Flotteq-v2/frontend-partner/src/App.tsx
```

**Attendu** : Ligne 48 (environ)

---

## Frontend Client ✅

```bash
# 5. SettingsPage créée ?
ls -la /Users/wissem/Flotteq-v2/frontend-client/src/pages/settings/SettingsPage.tsx
```

```bash
# 6. Route /settings ajoutée ?
grep -n "path=\"settings\"" /Users/wissem/Flotteq-v2/frontend-client/src/App.tsx
```

**Attendu** : Ligne 82

```bash
# 7. Menu Settings dans TenantLayout ?
grep -A 3 "icon: Settings" /Users/wissem/Flotteq-v2/frontend-client/src/layouts/TenantLayout.tsx
```

**Attendu** :
```tsx
{
  icon: Settings,
  label: 'Paramètres',
  path: '/settings',
}
```

---

## Idempotence Webhook ✅

```bash
# 8. Vérifier check idempotence dans bookings-payment.service.ts
grep -n "already marked as paid" /Users/wissem/Flotteq-v2/backend/src/modules/bookings/bookings-payment.service.ts
```

**Attendu** : 2 lignes (booking + commission)

---

## Test Onboarding Partner 🧪

```bash
# 1. Démarrer backend
cd /Users/wissem/Flotteq-v2/backend && npm run start:dev

# 2. Démarrer frontend partner (autre terminal)
cd /Users/wissem/Flotteq-v2/frontend-partner && npm run dev

# 3. Ouvrir http://localhost:5175/settings
# 4. Cliquer "Connecter mon compte bancaire"
# 5. Vérifier redirection Stripe
```

---

## Test Menu Client 🧪

```bash
# 1. Démarrer frontend client
cd /Users/wissem/Flotteq-v2/frontend-client && npm run dev

# 2. Ouvrir http://localhost:5174
# 3. Se connecter
# 4. Vérifier menu "Paramètres" visible (icône Settings)
# 5. Cliquer → Vérifier 2 onglets "Mon compte" et "Abonnement"
```

---

## Résumé Global

| Tâche | Fichier | Status |
|-------|---------|--------|
| Migration payment_status | [1760920000000-AddPaymentStatusToBookings.ts](backend/src/migrations/1760920000000-AddPaymentStatusToBookings.ts) | ✅ |
| Idempotence webhook | [bookings-payment.service.ts](backend/src/modules/bookings/bookings-payment.service.ts) | ✅ |
| SettingsPage Partner | [frontend-partner/src/pages/SettingsPage.tsx](frontend-partner/src/pages/SettingsPage.tsx) | ✅ Existant |
| SettingsPage Client | [frontend-client/src/pages/settings/SettingsPage.tsx](frontend-client/src/pages/settings/SettingsPage.tsx) | ✅ NOUVEAU |
| Route /settings Client | [frontend-client/src/App.tsx:82](frontend-client/src/App.tsx) | ✅ |
| Menu Settings | [frontend-client/src/layouts/TenantLayout.tsx:70](frontend-client/src/layouts/TenantLayout.tsx) | ✅ |

---

## Prochaines Étapes

1. **Exécuter tests complets** : [TESTS_STRIPE_INTEGRATION.md](TESTS_STRIPE_INTEGRATION.md)
2. **Vérifier Stripe Dashboard** : https://dashboard.stripe.com/test
3. **Tester onboarding partner** : Connecter compte bancaire
4. **Tester paiement booking** : Carte 4242 4242 4242 4242
5. **Vérifier webhooks** : `payment_intent.succeeded` reçu

---

**Durée totale** : ~5 minutes
**Objectif** : Valider que tous les fichiers sont en place avant tests E2E
