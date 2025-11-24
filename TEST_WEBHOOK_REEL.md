# 🎯 Test Webhook Stripe Réel

**Date** : 2025-10-23
**Stripe CLI** : ✅ En écoute sur `localhost:3000/api/stripe/webhook`
**Webhook Secret** : `whsec_90e3e80beb3f3661750dc47be80d384857cedad7a54316b5746783294c4a9782`

---

## ✅ Configuration Actuelle

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Output** :
```
> Ready! You are using Stripe API Version [2025-08-27.basil]
> Your webhook signing secret is whsec_90e3e80beb3f3661750dc47be80d384857cedad7a54316b5746783294c4a9782
```

---

## 🧪 Test avec Webhook Réel

### Booking de test disponible
```
Booking ID:    d9e91ba3-1ec4-4992-af89-86bd89902105
Partner ID:    a0d2fb01-36dc-4981-b558-3846403381d2
Prix:          100.00€
Commission:    10.00€
Status:        confirmed
```

### Commandes à exécuter

#### 1. Déclencher webhook payment_intent.succeeded

**Terminal 2** (nouveau terminal) :
```bash
stripe trigger payment_intent.succeeded \
  --override payment_intent:metadata.bookingId=d9e91ba3-1ec4-4992-af89-86bd89902105 \
  --override payment_intent:metadata.type=booking_payment \
  --override payment_intent:metadata.partnerId=a0d2fb01-36dc-4981-b558-3846403381d2 \
  --override payment_intent:metadata.tenantId=1 \
  --override payment_intent:amount=10000
```

#### 2. Observer les logs

**Terminal 1** (Stripe CLI) :
```
Attendu:
- Event received: payment_intent.succeeded
- Forwarded to: localhost:3000/api/stripe/webhook
- Response: 200 OK
```

**Terminal Backend** :
```
Attendu dans logs NestJS:
[StripeService] Processing webhook event: payment_intent.succeeded
[BookingsPaymentService] Handling payment success for PaymentIntent pi_xxx
[BookingsPaymentService] Booking d9e91ba3... marked as paid
[BookingsPaymentService] Commission xxx marked as paid. Amount: 10€
[StripeService] ✅ Booking d9e91ba3... payment processed successfully
```

#### 3. Vérifier en base de données

```bash
# Vérifier booking mis à jour
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT id, payment_status, paid_at FROM bookings WHERE id = 'd9e91ba3-1ec4-4992-af89-86bd89902105'\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log('📦 Booking après webhook:');
console.log(result);
"

# Vérifier commission mise à jour
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT id, status, paid_at FROM commissions WHERE booking_id = 'd9e91ba3-1ec4-4992-af89-86bd89902105'\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log('💰 Commission après webhook:');
console.log(result);
"
```

---

## 🔁 Test Idempotence avec Webhook Réel

### Rejouer le webhook
```bash
# Déclencher 2 fois le même événement
stripe trigger payment_intent.succeeded \
  --override payment_intent:metadata.bookingId=d9e91ba3-1ec4-4992-af89-86bd89902105 \
  --override payment_intent:metadata.type=booking_payment
```

### Logs attendus

**1er appel** :
```
[BookingsPaymentService] Booking d9e91ba3... marked as paid
[BookingsPaymentService] Commission xxx marked as paid
```

**2ème appel** :
```
[BookingsPaymentService] Booking d9e91ba3... already marked as paid, skipping
[BookingsPaymentService] Commission xxx already marked as paid
```

---

## 📊 Checklist Validation

- [ ] Stripe CLI en écoute (port 3000)
- [ ] Webhook `payment_intent.succeeded` déclenché
- [ ] Logs backend montrent traitement webhook
- [ ] Booking `payment_status` = `paid`
- [ ] Commission `status` = `paid`
- [ ] Idempotence : 2ème appel skip les updates
- [ ] Pas de doublons en DB

---

## 🎯 Résultats Attendus

### Stripe CLI Output
```
2025-10-23 12:45:00  --> payment_intent.succeeded [evt_xxx]
2025-10-23 12:45:00  <-- [200] POST http://localhost:3000/api/stripe/webhook
```

### Backend Logs
```
[BookingsPaymentService] Creating payment: Total 10000¢, Commission 1000¢ (10%), Partner 9000¢
[BookingsPaymentService] Commission created for booking d9e91ba3...
[StripeService] ✅ Booking payment processed successfully
```

### Base de données
```sql
SELECT id, payment_status, paid_at
FROM bookings
WHERE id = 'd9e91ba3-1ec4-4992-af89-86bd89902105';

-- Résultat attendu:
-- payment_status: paid
-- paid_at: 2025-10-23 12:45:00.xxx

SELECT COUNT(*)
FROM commissions
WHERE booking_id = 'd9e91ba3-1ec4-4992-af89-86bd89902105';

-- Résultat attendu: 1 (pas de doublon)
```

---

## 🚀 Prochaines Étapes

Après validation du webhook :

1. **Créer un nouveau booking** pour tester le flow complet
2. **Appeler l'API** `POST /bookings/:id/payment`
3. **Simuler paiement** avec carte test Stripe
4. **Vérifier Stripe Dashboard** (Payments + Transfers)

---

**Note** : Ce test utilise le VRAI webhook Stripe, contrairement au test précédent qui simulait directement en DB.
