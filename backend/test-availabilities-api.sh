#!/bin/bash

# Script pour tester les endpoints d'availabilities

echo "🧪 Test des endpoints Availabilities Module"
echo "============================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/availabilities"

# Test 1: Vérifier qu'un partner existe (on utilise un UUID de test)
echo -e "${BLUE}📋 Test 1: GET /api/availabilities/{partnerId} (Public - voir schedule)${NC}"
PARTNER_ID="550e8400-e29b-41d4-a716-446655440000" # UUID de test
curl -s -X GET "${API_URL}/${PARTNER_ID}" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 2: Tester la route de recherche de slots (sans auth - public)
echo -e "${BLUE}📅 Test 2: GET /api/availabilities/{partnerId}/slots?date=2025-12-15&duration=30 (Public - recherche slots)${NC}"
curl -s -X GET "${API_URL}/${PARTNER_ID}/slots?date=2025-12-15&duration=30" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 3: Documentation Swagger
echo -e "${BLUE}📚 Test 3: Routes disponibles dans Swagger${NC}"
echo "Les endpoints suivants sont disponibles:"
echo ""
echo "🔒 PARTNER ONLY (nécessite JWT + partnerId):"
echo "  POST   /api/availabilities                - Créer une règle"
echo "  POST   /api/availabilities/bulk           - Créer plusieurs règles"
echo "  PATCH  /api/availabilities/:id            - Modifier une règle"
echo "  DELETE /api/availabilities/:id            - Supprimer une règle"
echo "  GET    /api/availabilities/me             - Mes règles"
echo ""
echo "🔒 UNAVAILABILITIES (nécessite JWT + partnerId):"
echo "  POST   /api/availabilities/unavailability      - Bloquer une date"
echo "  DELETE /api/availabilities/unavailability/:id  - Débloquer"
echo "  GET    /api/availabilities/unavailability/list - Lister"
echo ""
echo "🌐 PUBLIC (sans auth):"
echo "  GET    /api/availabilities/:partnerId           - Voir le schedule"
echo "  GET    /api/availabilities/:partnerId/slots     - Trouver créneaux disponibles"
echo ""
echo ""

# Test 4: Vérifier la structure de la base de données
echo -e "${BLUE}💾 Test 4: Vérification de la base de données${NC}"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c "
SELECT
  'availabilities' as table_name,
  COUNT(*) as count
FROM availabilities
UNION ALL
SELECT
  'unavailabilities' as table_name,
  COUNT(*) as count
FROM unavailabilities;
" 2>/dev/null || echo "Connexion DB failed"

echo ""
echo ""

echo -e "${GREEN}✅ Tests terminés!${NC}"
echo ""
echo "Pour tester les endpoints protégés (partner only), vous devez:"
echo "1. Créer un partner via /api/partners"
echo "2. Se connecter via /api/auth/partner/login"
echo "3. Utiliser le JWT obtenu dans le header Authorization: Bearer {token}"
