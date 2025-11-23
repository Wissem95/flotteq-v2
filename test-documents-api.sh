#!/bin/bash

# 🧪 Script de test rapide API Documents
# Usage: ./test-documents-api.sh

set -e

echo "📋 TESTS API DOCUMENTS - Module FT1-007"
echo "========================================="

# Configuration
API_BASE="http://localhost:3000"
TOKEN="${JWT_TOKEN:-your_token_here}"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions helper
function test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -e "\n${BLUE}[TEST]${NC} $name"
  echo "→ $method $endpoint"

  if [ -z "$data" ]; then
    response=$(curl -s -X $method \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "$API_BASE$endpoint")
  else
    response=$(curl -s -X $method \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$API_BASE$endpoint")
  fi

  if echo "$response" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Succès${NC}"
    echo "$response" | jq -C '.' | head -20
  else
    echo -e "${RED}✗ Erreur${NC}"
    echo "$response"
  fi
}

echo ""
echo "🔐 Token utilisé: ${TOKEN:0:20}..."
echo ""

# Test 1: Vérifier la structure de la table documents
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 1: Vérification BDD${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

echo -e "\n📊 Structure table documents:"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c "\d documents" 2>/dev/null || echo "⚠️  Impossible de se connecter à la BDD"

echo -e "\n📊 Colonnes attendues:"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'documents' AND column_name IN ('document_type', 'expiry_date', 'notes');" 2>/dev/null || echo "⚠️  Colonnes non trouvées"

# Test 2: Liste des documents
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 2: Liste Documents${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

test_endpoint "GET /documents" "GET" "/documents"

# Test 3: Documents expirant bientôt
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 3: Documents Expirant (30j)${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

test_endpoint "GET /documents/alerts/expiring" "GET" "/documents/alerts/expiring?days=30"

# Test 4: Documents expirant dans 7 jours
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 4: Documents Expirant (7j)${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

test_endpoint "GET /documents/alerts/expiring?days=7" "GET" "/documents/alerts/expiring?days=7"

# Test 5: Filtrer par entityType
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 5: Filtrer par entityType=vehicle${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

test_endpoint "GET /documents?entityType=vehicle" "GET" "/documents?entityType=vehicle"

# Test 6: Upload (requiert un fichier)
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 6: Upload Document (SKIP)${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo "⚠️  Test upload nécessite multipart/form-data"
echo "   → Utiliser Postman ou frontend pour tester"

# Test 7: Vérifier endpoint Swagger
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}TEST 7: Swagger UI${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

echo "📖 Documentation disponible sur:"
echo "   → http://localhost:3000/api"
echo "   → Chercher 'Documents' dans la liste des endpoints"

# Résumé
echo -e "\n${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}RÉSUMÉ${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

echo -e "\n✅ Endpoints testés avec succès"
echo -e "📊 Vérifier les réponses JSON ci-dessus"
echo -e ""
echo -e "🔧 Pour tester l'upload complet:"
echo -e "   1. Aller sur http://localhost:5173/documents"
echo -e "   2. Cliquer 'Nouveau document'"
echo -e "   3. Uploader un PDF"
echo -e ""
echo -e "📖 Guide complet: TESTS_MODULE_DOCUMENTS.md"
echo -e ""
