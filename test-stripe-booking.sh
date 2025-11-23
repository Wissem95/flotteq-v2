#!/bin/bash

# Script de test automatisé pour paiement Booking Stripe
# Usage: ./test-stripe-booking.sh

set -e

echo "🧪 Test Paiement Booking Stripe"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api"
PGPASSWORD="flotteq123"
export PGPASSWORD

# Fonction pour récupérer des données de test
get_test_data() {
    echo -e "${BLUE}📊 Récupération des données de test...${NC}"

    # Récupérer un partner avec Stripe configuré
    PARTNER_DATA=$(psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c \
        "SELECT id, company_name, stripe_account_id, stripe_onboarding_completed
         FROM partners
         WHERE stripe_account_id IS NOT NULL
         LIMIT 1")

    if [ -z "$PARTNER_DATA" ]; then
        echo -e "${RED}❌ Aucun partner avec Stripe configuré trouvé${NC}"
        echo -e "${YELLOW}💡 Exécutez d'abord le Test 1 (Onboarding Partner)${NC}"
        exit 1
    fi

    PARTNER_ID=$(echo $PARTNER_DATA | awk '{print $1}')
    echo -e "${GREEN}✅ Partner trouvé: ID=$PARTNER_ID${NC}"

    # Récupérer un tenant
    TENANT_DATA=$(psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c \
        "SELECT id, name FROM tenants LIMIT 1")
    TENANT_ID=$(echo $TENANT_DATA | awk '{print $1}')
    echo -e "${GREEN}✅ Tenant trouvé: ID=$TENANT_ID${NC}"

    # Récupérer un véhicule
    VEHICLE_ID=$(psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c \
        "SELECT id FROM vehicles WHERE tenant_id = $TENANT_ID LIMIT 1" | xargs)
    echo -e "${GREEN}✅ Vehicle trouvé: ID=$VEHICLE_ID${NC}"

    # Récupérer un service du partner
    SERVICE_ID=$(psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c \
        "SELECT id FROM partner_services WHERE partner_id = '$PARTNER_ID' LIMIT 1" | xargs)
    echo -e "${GREEN}✅ Service trouvé: ID=$SERVICE_ID${NC}"

    # Récupérer tokens (simulation - en production utiliser vrais tokens)
    echo -e "${YELLOW}⚠️  Note: Utilisation de tokens simulés (remplacer par vrais tokens en production)${NC}"

    echo ""
}

# Fonction pour créer un booking
create_booking() {
    echo -e "${BLUE}1️⃣  Création du booking...${NC}"

    BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
        -d "{
            \"partnerId\": \"$PARTNER_ID\",
            \"vehicleId\": \"$VEHICLE_ID\",
            \"serviceId\": \"$SERVICE_ID\",
            \"scheduledDate\": \"2025-10-25\",
            \"scheduledTime\": \"14:00\",
            \"endTime\": \"16:00\",
            \"price\": 100.00,
            \"customerNotes\": \"Test paiement Stripe automatisé\"
        }" 2>&1)

    if echo "$BOOKING_RESPONSE" | grep -q "statusCode.*40"; then
        echo -e "${RED}❌ Erreur création booking (Auth requise)${NC}"
        echo -e "${YELLOW}💡 Utilisez l'interface web pour créer un booking manuellement${NC}"
        return 1
    fi

    BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$BOOKING_ID" ]; then
        echo -e "${RED}❌ Impossible d'extraire booking ID${NC}"
        echo "$BOOKING_RESPONSE"
        return 1
    fi

    echo -e "${GREEN}✅ Booking créé: $BOOKING_ID${NC}"
    echo ""
}

# Fonction pour créer PaymentIntent directement en DB
create_test_booking_db() {
    echo -e "${BLUE}1️⃣  Création booking de test en DB...${NC}"

    BOOKING_ID=$(psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c \
        "INSERT INTO bookings (partner_id, tenant_id, vehicle_id, service_id, scheduled_date, scheduled_time, end_time, status, price, commission_amount)
         VALUES ('$PARTNER_ID', $TENANT_ID, '$VEHICLE_ID', '$SERVICE_ID', '2025-10-25', '14:00', '16:00', 'confirmed', 100.00, 10.00)
         RETURNING id" | xargs)

    echo -e "${GREEN}✅ Booking créé en DB: $BOOKING_ID${NC}"
    echo ""
}

# Fonction principale
main() {
    echo -e "${BLUE}📋 Étape 1: Récupération données de test${NC}"
    get_test_data

    echo -e "${BLUE}📋 Étape 2: Création booking de test${NC}"
    create_test_booking_db

    echo -e "${BLUE}📋 Étape 3: Instructions pour tester le paiement${NC}"
    echo ""
    echo -e "${YELLOW}=== COPIER/COLLER CES COMMANDES ===${NC}"
    echo ""
    echo -e "${GREEN}# 1. Créer PaymentIntent${NC}"
    echo "curl -X POST $API_URL/bookings/$BOOKING_ID/payment \\"
    echo "  -H 'Authorization: Bearer YOUR_TENANT_TOKEN' \\"
    echo "  -H 'Content-Type: application/json'"
    echo ""
    echo -e "${GREEN}# 2. Simuler paiement avec Stripe CLI${NC}"
    echo "stripe trigger payment_intent.succeeded \\"
    echo "  --override payment_intent:metadata.bookingId=$BOOKING_ID \\"
    echo "  --override payment_intent:metadata.type=booking_payment"
    echo ""
    echo -e "${GREEN}# 3. Vérifier résultat en DB${NC}"
    echo "psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\"
    echo "  \"SELECT id, status, payment_status, paid_at FROM bookings WHERE id = '$BOOKING_ID'\""
    echo ""
    echo -e "${GREEN}# 4. Vérifier commission créée${NC}"
    echo "psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\"
    echo "  \"SELECT id, amount, status, paid_at FROM commissions WHERE booking_id = '$BOOKING_ID'\""
    echo ""

    echo -e "${BLUE}📋 Étape 4: Test Idempotence${NC}"
    echo ""
    echo -e "${YELLOW}=== TESTER IDEMPOTENCE ===${NC}"
    echo ""
    echo -e "${GREEN}# Rejouer le webhook 2 fois (doit skip la 2ème fois)${NC}"
    echo "stripe trigger payment_intent.succeeded \\"
    echo "  --override payment_intent:metadata.bookingId=$BOOKING_ID \\"
    echo "  --override payment_intent:metadata.type=booking_payment"
    echo ""
    echo "# Attendu dans logs backend:"
    echo "# 2ème appel: 'Booking already marked as paid, skipping'"
    echo ""

    echo -e "${GREEN}✅ Booking de test prêt: $BOOKING_ID${NC}"
    echo ""
    echo -e "${YELLOW}💡 Astuce: Installez Stripe CLI avec 'brew install stripe/stripe-cli/stripe'${NC}"
    echo -e "${YELLOW}💡 Puis connectez-vous avec 'stripe login'${NC}"
}

# Exécution
main
