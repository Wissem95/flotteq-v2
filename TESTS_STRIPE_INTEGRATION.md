# Tests Stripe Integration FlotteQ

## ✅ Tests à exécuter

### 1. Test Onboarding Partner Stripe Connect

**Objectif** : Vérifier qu'un partenaire peut connecter son compte bancaire via Stripe Connect

**Étapes** :
1. Se connecter sur `http://localhost:5175` avec un compte partner
2. Aller dans **Settings** (menu latéral)
3. Cliquer sur **"🔗 Connecter mon compte bancaire"**
4. Vérifier la redirection vers Stripe.com (formulaire d'onboarding Express)
5. Compléter le formulaire Stripe :
   - Pays : France
   - Email : celui du partner
   - Informations bancaires : IBAN de test `FR14 2004 1010 0505 0001 3M02 606`
   - Accepter les CGU Stripe
6. Vérifier le retour sur `/settings?stripe=success`
7. **Vérifications attendues** :
   - ✅ Toast "Configuration Stripe terminée avec succès !"
   - ✅ Statut "Paiements activés" (pastille verte)
   - ✅ Message "Vous recevrez automatiquement 90% du montant"
   - ✅ ID Compte affiché (commence par `acct_`)

**Vérification DB** :
```bash
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT id, company_name, stripe_account_id, stripe_onboarding_completed FROM partners WHERE email = 'YOUR_PARTNER_EMAIL'\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log(result);
"
```

**Attendu** :
- `stripe_account_id` = `acct_...`
- `stripe_onboarding_completed` = `true`

---

### 2. Test Paiement Booking avec Split Commission

**Objectif** : Vérifier qu'un paiement de booking split correctement les montants (90% partner, 10% FlotteQ)

**Pré-requis** :
- Un partner avec `stripe_onboarding_completed = true`
- Un booking avec `status = 'confirmed'` et `price = 100.00`

**Étapes** :

#### A. Créer un booking de test
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "PARTNER_UUID",
    "vehicleId": "VEHICLE_UUID",
    "serviceId": "SERVICE_UUID",
    "scheduledDate": "2025-10-25",
    "scheduledTime": "14:00",
    "endTime": "16:00",
    "price": 100.00,
    "customerNotes": "Test paiement Stripe"
  }'
```

Récupérer le `bookingId` dans la réponse.

#### B. Confirmer le booking (si partner)
```bash
curl -X PATCH http://localhost:3000/api/bookings/{bookingId}/confirm \
  -H "Authorization: Bearer YOUR_PARTNER_TOKEN"
```

#### C. Créer PaymentIntent
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/payment \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
  -H "Content-Type: application/json"
```

**Réponse attendue** :
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "publishableKey": "pk_test_...",
  "amount": 100,
  "commissionAmount": 10,
  "partnerAmount": 90
}
```

#### D. Simuler paiement avec Stripe CLI
```bash
stripe trigger payment_intent.succeeded \
  --override payment_intent:metadata.bookingId={bookingId} \
  --override payment_intent:metadata.type=booking_payment
```

Ou utiliser une carte de test dans le frontend :
- Numéro : `4242 4242 4242 4242`
- Date : `12/30`
- CVC : `123`

#### E. Vérifications attendues

**Logs backend** :
```
[BookingsPaymentService] Creating payment: Total 10000¢, Commission 1000¢ (10%), Partner 9000¢
[BookingsPaymentService] Commission created for booking xxx: 10€
[StripeService] ✅ Booking xxx payment processed successfully
[BookingsPaymentService] Booking xxx marked as paid
[BookingsPaymentService] Commission yyy marked as paid. Amount: 10€
```

**Vérification DB** :
```bash
# Vérifier booking payé
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT id, status, payment_status, paid_at FROM bookings WHERE id = 'BOOKING_ID'\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log('📦 Booking:');
console.log(result);
"

# Vérifier commission créée
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT id, amount, status, paid_at FROM commissions WHERE booking_id = 'BOOKING_ID'\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log('💰 Commission:');
console.log(result);
"
```

**Attendu** :
- Booking : `payment_status = 'paid'`, `paid_at` rempli
- Commission : `amount = 10.00`, `status = 'paid'`, `paid_at` rempli

---

### 3. Vérification Stripe Dashboard

**Objectif** : Confirmer que les paiements et transfers apparaissent dans Stripe

**Étapes** :

1. Se connecter sur https://dashboard.stripe.com/test
2. Aller dans **Payments** :
   - ✅ Payment de 100.00 EUR visible
   - ✅ Statut : Succeeded
   - ✅ Description : "Vidange - AC-273-DH" (ou le service/véhicule réel)
   - ✅ Metadata : `bookingId`, `partnerId`, `tenantId`, `type=booking_payment`

3. Aller dans **Connect > Transfers** :
   - ✅ Transfer de 90.00 EUR vers le compte partner
   - ✅ Destination : `acct_...` (ID du partner)
   - ✅ Application fee : 10.00 EUR (commission FlotteQ)

4. Aller dans **Connect > Accounts** :
   - ✅ Trouver le compte partner
   - ✅ Status : Complete
   - ✅ Charges enabled : Yes
   - ✅ Payouts enabled : Yes

---

## ⚠️ Idempotence Webhook

**Test** : Envoyer le même webhook 2 fois

```bash
# 1er appel
stripe trigger payment_intent.succeeded --override payment_intent:metadata.bookingId={bookingId}

# 2ème appel (même PaymentIntent)
stripe trigger payment_intent.succeeded --override payment_intent:metadata.bookingId={bookingId}
```

**Logs attendus** :
```
1er appel : "Booking xxx marked as paid"
2ème appel : "Booking xxx already marked as paid, skipping"
             "Commission yyy already marked as paid"
```

✅ Pas d'erreur, pas de double paiement

---

## 🎯 Checklist Finale

- [ ] Partner onboarding complet (stripe_onboarding_completed = true)
- [ ] PaymentIntent créé avec split correct (90/10)
- [ ] Webhook `payment_intent.succeeded` reçu et traité
- [ ] Booking.payment_status = 'paid'
- [ ] Commission créée avec status = 'paid'
- [ ] Stripe Dashboard : Payment + Transfer visibles
- [ ] Idempotence webhook testée (pas de doublons)
- [ ] Menu Settings visible dans frontend-client
- [ ] Page Settings accessible à `/settings`

---

## 🐛 Debugging

### Webhook non reçu ?
```bash
# Vérifier webhook secret configuré
echo $STRIPE_WEBHOOK_SECRET

# Tester webhook localement avec Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger payment_intent.succeeded
```

### Commission non créée ?
```sql
-- Vérifier table commissions
SELECT * FROM commissions WHERE booking_id = 'BOOKING_ID';

-- Vérifier booking
SELECT id, status, payment_status, commission_amount FROM bookings WHERE id = 'BOOKING_ID';
```

### Partner onboarding incomplet ?
```sql
SELECT id, company_name, stripe_account_id, stripe_onboarding_completed
FROM partners
WHERE email = 'partner@example.com';
```

Si `stripe_onboarding_completed = false` :
- Vérifier que `account.charges_enabled = true` ET `account.payouts_enabled = true` dans Stripe
- Refaire le processus d'onboarding avec "Continuer la configuration"

---

## 📊 Résultats attendus

**✅ Test Onboarding** : Partner peut connecter son compte bancaire
**✅ Test Paiement** : Split commission 90/10 fonctionne
**✅ Test Dashboard** : Paiements et transfers visibles dans Stripe
**✅ Idempotence** : Webhooks peuvent être rejoués sans effet

**🎉 Infrastructure Stripe 100% opérationnelle !**
