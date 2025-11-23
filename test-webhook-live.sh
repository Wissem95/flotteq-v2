#!/bin/bash

# Test Webhook Stripe en temps réel
# Prérequis: stripe listen --forward-to localhost:3000/api/stripe/webhook

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BOOKING_ID="d9e91ba3-1ec4-4992-af89-86bd89902105"
PARTNER_ID="a0d2fb01-36dc-4981-b558-3846403381d2"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🧪 Test Webhook Stripe - Flow Complet Réel         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que Stripe CLI est en écoute
echo -e "${YELLOW}⚠️  ATTENTION: Vérifiez que Stripe CLI est en écoute !${NC}"
echo -e "${YELLOW}   Commande: stripe listen --forward-to localhost:3000/api/stripe/webhook${NC}"
echo ""
read -p "Stripe CLI en écoute ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Annulé${NC}"
    exit 1
fi

# Réinitialiser le booking pour le test
echo -e "${BLUE}🔄 Réinitialisation du booking de test...${NC}"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \
    "UPDATE bookings SET payment_status = 'pending', paid_at = NULL WHERE id = '$BOOKING_ID'" > /dev/null
echo -e "${GREEN}✅ Booking réinitialisé (payment_status = pending)${NC}"

# Supprimer commission existante
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \
    "DELETE FROM commissions WHERE booking_id = '$BOOKING_ID'" > /dev/null
echo -e "${GREEN}✅ Commission supprimée${NC}"
echo ""

# État avant webhook
echo -e "${BLUE}📊 État AVANT webhook:${NC}"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \
    "SELECT id, payment_status, paid_at FROM bookings WHERE id = '$BOOKING_ID'"
echo ""

# Déclencher webhook
echo -e "${BLUE}🚀 Déclenchement webhook payment_intent.succeeded...${NC}"
echo ""
echo -e "${YELLOW}Commande Stripe:${NC}"
echo "stripe trigger payment_intent.succeeded \\"
echo "  --override payment_intent:metadata.bookingId=$BOOKING_ID \\"
echo "  --override payment_intent:metadata.type=booking_payment \\"
echo "  --override payment_intent:metadata.partnerId=$PARTNER_ID \\"
echo "  --override payment_intent:metadata.tenantId=1 \\"
echo "  --override payment_intent:amount=10000"
echo ""

stripe trigger payment_intent.succeeded \
  --override payment_intent:metadata.bookingId=$BOOKING_ID \
  --override payment_intent:metadata.type=booking_payment \
  --override payment_intent:metadata.partnerId=$PARTNER_ID \
  --override payment_intent:metadata.tenantId=1 \
  --override payment_intent:amount=10000

echo ""
echo -e "${GREEN}✅ Webhook déclenché !${NC}"
echo ""

# Attendre un peu pour que le webhook soit traité
echo -e "${BLUE}⏳ Attente traitement webhook (2 secondes)...${NC}"
sleep 2
echo ""

# État après webhook
echo -e "${BLUE}📊 État APRÈS webhook:${NC}"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \
    "SELECT id, payment_status, paid_at FROM bookings WHERE id = '$BOOKING_ID'"
echo ""

# Vérifier commission
echo -e "${BLUE}💰 Commission créée:${NC}"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \
    "SELECT id, amount, status, paid_at FROM commissions WHERE booking_id = '$BOOKING_ID'"
echo ""

# Test idempotence
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔁 Test Idempotence - Rejeu du webhook...${NC}"
echo ""

stripe trigger payment_intent.succeeded \
  --override payment_intent:metadata.bookingId=$BOOKING_ID \
  --override payment_intent:metadata.type=booking_payment

echo ""
echo -e "${BLUE}⏳ Attente traitement 2ème webhook (2 secondes)...${NC}"
sleep 2
echo ""

# Vérifier qu'il n'y a toujours qu'une seule commission
echo -e "${BLUE}📊 Vérification idempotence:${NC}"
COMMISSION_COUNT=$(PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c \
    "SELECT COUNT(*) FROM commissions WHERE booking_id = '$BOOKING_ID'" | xargs)

if [ "$COMMISSION_COUNT" == "1" ]; then
    echo -e "${GREEN}✅ Idempotence validée: 1 seule commission (pas de doublon)${NC}"
else
    echo -e "${RED}❌ ÉCHEC: $COMMISSION_COUNT commissions trouvées (attendu: 1)${NC}"
fi
echo ""

# Résumé
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Test webhook complet terminé !${NC}"
echo ""
echo -e "${YELLOW}💡 Vérifiez les logs backend pour voir:${NC}"
echo "   - [StripeService] Processing webhook event: payment_intent.succeeded"
echo "   - [BookingsPaymentService] Booking marked as paid"
echo "   - [BookingsPaymentService] Commission marked as paid"
echo "   - (2ème fois) already marked as paid, skipping"
echo ""
echo -e "${YELLOW}📋 Checklist:${NC}"
echo "   ✓ Webhook reçu par Stripe CLI"
echo "   ✓ Booking payment_status = paid"
echo "   ✓ Commission créée (10€)"
echo "   ✓ Idempotence validée (1 seule commission)"
echo ""
