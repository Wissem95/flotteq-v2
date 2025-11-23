#!/bin/bash

# 🧪 Test E2E Commission & Paiement FlotteQ
# Ce script teste le flux complet : Booking → Payment → Commission Split

set -e

API_URL="http://localhost:3001/api"
PARTNER_EMAIL="Norautok@gmail.com"
PARTNER_PASSWORD="Wissem2002.@"
TENANT_EMAIL="3ws@3ws.com"
TENANT_PASSWORD="TestE2E123"

echo "🚀 Test E2E - Commission & Paiement FlotteQ"
echo "============================================"
echo ""

# 1️⃣ Login Tenant (pour créer booking)
echo "1️⃣ Login Tenant (3ws@3ws.com)..."
TENANT_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TENANT_EMAIL\",\"password\":\"$TENANT_PASSWORD\"}" \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TENANT_TOKEN" ]; then
  echo "❌ Erreur: Impossible de se connecter en tant que tenant"
  exit 1
fi
echo "✅ Token tenant récupéré"
echo ""

# 2️⃣ Login Partner (pour vérifier commission)
echo "2️⃣ Login Partner (Norautok)..."
PARTNER_TOKEN=$(curl -s -X POST "$API_URL/partners/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PARTNER_EMAIL\",\"password\":\"$PARTNER_PASSWORD\"}" \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))" 2>/dev/null)

if [ -z "$PARTNER_TOKEN" ]; then
  echo "❌ Erreur: Impossible de se connecter en tant que partner"
  exit 1
fi
echo "✅ Token partner récupéré"
echo ""

# 3️⃣ Récupérer commission rate actuelle
echo "3️⃣ Récupération du taux de commission Norautok..."
COMMISSION_RATE=$(curl -s -X GET "$API_URL/partners/me/commission-rate" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('commissionRate', 0))" 2>/dev/null)

echo "📊 Commission Rate actuelle: ${COMMISSION_RATE}%"
echo ""

# 4️⃣ Récupérer infos tenant (tenantId + vehicleId)
echo "4️⃣ Récupération tenantId..."
TENANT_INFO=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TENANT_TOKEN")

TENANT_ID=$(echo "$TENANT_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tenantId', ''))" 2>/dev/null)
echo "Tenant ID: $TENANT_ID"

# 5️⃣ Récupérer un véhicule du tenant
echo "5️⃣ Récupération d'un véhicule..."
VEHICLE_ID=$(curl -s -X GET "$API_URL/vehicles?limit=1" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') else '')" 2>/dev/null)

if [ -z "$VEHICLE_ID" ]; then
  echo "❌ Aucun véhicule trouvé pour ce tenant"
  exit 1
fi
echo "Vehicle ID: $VEHICLE_ID"
echo ""

# 6️⃣ Partner Norautok (ID fixe pour le test)
echo "6️⃣ Utilisation du partner Norautok..."
PARTNER_ID="a0d2fb01-36dc-4981-b558-3846403381d2"
echo "Partner ID: $PARTNER_ID (Norautok - Garage)"
echo ""

# 7️⃣ Récupérer un service du partner
echo "7️⃣ Récupération d'un service Norautok..."
SERVICE_ID=$(curl -s -X GET "$API_URL/partners/$PARTNER_ID/services" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)

if [ -z "$SERVICE_ID" ]; then
  echo "❌ Aucun service trouvé pour ce partner"
  exit 1
fi

SERVICE_INFO=$(curl -s -X GET "$API_URL/partners/$PARTNER_ID/services" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); s=data[0] if data else {}; print(f\"{s.get('name','')} - {s.get('price',0)}€\")" 2>/dev/null)

echo "Service: $SERVICE_INFO"
echo "Service ID: $SERVICE_ID"
echo ""

# 8️⃣ Créer un booking
echo "8️⃣ Création d'un booking de test..."
BOOKING_DATE=$(date -v+2d +%Y-%m-%d 2>/dev/null || date -d "+2 days" +%Y-%m-%d)

BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"partnerId\": \"$PARTNER_ID\",
    \"vehicleId\": \"$VEHICLE_ID\",
    \"serviceId\": \"$SERVICE_ID\",
    \"scheduledDate\": \"$BOOKING_DATE\",
    \"scheduledTime\": \"14:00\",
    \"endTime\": \"15:30\",
    \"customerNotes\": \"Test E2E commission\"
  }")

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('booking', {}).get('id', ''))" 2>/dev/null)

if [ -z "$BOOKING_ID" ]; then
  echo "❌ Erreur lors de la création du booking"
  echo "$BOOKING_RESPONSE"
  exit 1
fi

BOOKING_PRICE=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('booking', {}).get('price', 0))" 2>/dev/null)

echo "✅ Booking créé"
echo "   ID: $BOOKING_ID"
echo "   Prix: ${BOOKING_PRICE}€"
echo ""

# 9️⃣ Confirmer le booking (en tant que partner)
echo "9️⃣ Confirmation du booking par le partner..."
curl -s -X PATCH "$API_URL/bookings/$BOOKING_ID/confirm" \
  -H "Authorization: Bearer $PARTNER_TOKEN" > /dev/null

echo "✅ Booking confirmé"
echo ""

# 🔟 Créer PaymentIntent
echo "🔟 Création du PaymentIntent (simulation paiement)..."
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/bookings/$BOOKING_ID/payment" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID")

CLIENT_SECRET=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('clientSecret', ''))" 2>/dev/null)
AMOUNT=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('amount', 0))" 2>/dev/null)
COMMISSION_AMOUNT=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('commissionAmount', 0))" 2>/dev/null)
PARTNER_AMOUNT=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('partnerAmount', 0))" 2>/dev/null)

if [ -z "$CLIENT_SECRET" ]; then
  echo "❌ Erreur lors de la création du PaymentIntent"
  echo "$PAYMENT_RESPONSE"
  exit 1
fi

echo "✅ PaymentIntent créé"
echo ""
echo "💰 RÉPARTITION DES PAIEMENTS:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   💵 Montant total:        ${AMOUNT}€"
echo "   🏢 Commission FlotteQ:   ${COMMISSION_AMOUNT}€ (${COMMISSION_RATE}%)"
echo "   🔧 Montant partenaire:   ${PARTNER_AMOUNT}€ ($((100 - COMMISSION_RATE))%)"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ✅ Calcul de vérification
EXPECTED_COMMISSION=$(python3 -c "print(round($AMOUNT * $COMMISSION_RATE / 100, 2))")
EXPECTED_PARTNER=$(python3 -c "print(round($AMOUNT - $EXPECTED_COMMISSION, 2))")

echo "🧮 VÉRIFICATIONS:"
echo "   Commission attendue:  ${EXPECTED_COMMISSION}€"
echo "   Commission reçue:     ${COMMISSION_AMOUNT}€"

if [ "$EXPECTED_COMMISSION" = "$COMMISSION_AMOUNT" ]; then
  echo "   ✅ Commission correcte"
else
  echo "   ⚠️  Différence détectée!"
fi

echo ""
echo "   Partenaire attendu:   ${EXPECTED_PARTNER}€"
echo "   Partenaire reçu:      ${PARTNER_AMOUNT}€"

if [ "$EXPECTED_PARTNER" = "$PARTNER_AMOUNT" ]; then
  echo "   ✅ Montant partenaire correct"
else
  echo "   ⚠️  Différence détectée!"
fi
echo ""

# 📊 Vérifier en DB
echo "📊 Vérification en base de données..."
echo ""

DB_CHECK=$(PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c "
SELECT
  b.id,
  b.price as booking_price,
  b.payment_status,
  c.amount as commission_amount,
  c.status as commission_status,
  p.commission_rate
FROM bookings b
LEFT JOIN commissions c ON c.booking_id = b.id
JOIN partners p ON p.id = b.partner_id
WHERE b.id = '$BOOKING_ID'
" 2>/dev/null)

echo "Base de données:"
echo "$DB_CHECK" | awk '{print "   " $0}'
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TEST E2E TERMINÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Résumé:"
echo "   • Booking ID: $BOOKING_ID"
echo "   • Prix total: ${AMOUNT}€"
echo "   • Commission FlotteQ: ${COMMISSION_AMOUNT}€ (${COMMISSION_RATE}%)"
echo "   • Montant partenaire: ${PARTNER_AMOUNT}€"
echo "   • Client Secret: ${CLIENT_SECRET:0:30}..."
echo ""
echo "⚠️  Note: Le paiement n'a pas été finalisé (test mode)"
echo "   Pour finaliser, utilisez une carte test Stripe:"
echo "   • Numéro: 4242 4242 4242 4242"
echo "   • Date: 12/34"
echo "   • CVV: 123"
echo ""
echo "🧹 Nettoyage (optionnel):"
echo "   Pour supprimer ce booking de test:"
echo "   curl -X DELETE $API_URL/bookings/$BOOKING_ID -H \"Authorization: Bearer $PARTNER_TOKEN\""
echo ""
