#!/bin/bash

# Script de test pour FD4-003 Dashboard Driver
# Usage: ./test-driver-dashboard.sh

set -e

echo "🧪 Test FD4-003 : Dashboard Driver"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:3000"
API_BASE="$BACKEND_URL/api"

# Fonction pour vérifier si un endpoint répond
check_endpoint() {
  local endpoint=$1
  local token=$2
  local description=$3

  echo -n "  Testing $description... "

  if [ -n "$token" ]; then
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $token" "$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" "$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✓${NC}"
    return 0
  else
    echo -e "${RED}✗ (HTTP $http_code)${NC}"
    return 1
  fi
}

echo "📋 Phase 1: Vérification Backend"
echo "--------------------------------"

# Test si backend est accessible
if ! curl -s "$BACKEND_URL" > /dev/null; then
  echo -e "${RED}✗ Backend non accessible sur $BACKEND_URL${NC}"
  echo "  → Lancez d'abord: cd backend && npm run start:dev"
  exit 1
fi
echo -e "${GREEN}✓${NC} Backend accessible"

echo ""
echo "📋 Phase 2: Test endpoints API Driver"
echo "------------------------------------"

# Note: Pour tester les endpoints protégés, il faudrait d'abord se connecter
# Pour le moment, on vérifie juste que les routes existent

echo -e "${YELLOW}ℹ️  Les endpoints driver nécessitent une authentification${NC}"
echo "   Pour tester complètement:"
echo "   1. Créer un driver dans la base"
echo "   2. Se connecter avec les credentials"
echo "   3. Utiliser le token pour appeler les endpoints"
echo ""

echo "📋 Phase 3: Vérification Build Frontend"
echo "--------------------------------------"

cd "$(dirname "$0")/frontend-driver"

echo -n "  Building frontend-driver... "
if npm run build > /tmp/fd4-003-build.log 2>&1; then
  echo -e "${GREEN}✓${NC}"

  # Vérifier que les fichiers sont générés
  if [ -f "dist/index.html" ]; then
    echo -e "  ${GREEN}✓${NC} dist/index.html généré"
  fi

  if [ -d "dist/assets" ]; then
    js_count=$(find dist/assets -name "*.js" | wc -l)
    css_count=$(find dist/assets -name "*.css" | wc -l)
    echo -e "  ${GREEN}✓${NC} Assets générés: $js_count JS, $css_count CSS"
  fi
else
  echo -e "${RED}✗${NC}"
  echo "  Erreurs de build:"
  cat /tmp/fd4-003-build.log | grep "error" | head -5
  exit 1
fi

echo ""
echo "📋 Phase 4: Vérification Composants"
echo "----------------------------------"

# Vérifier que les nouveaux fichiers existent
check_file() {
  local file=$1
  local description=$2

  echo -n "  Checking $description... "
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ (Not found: $file)${NC}"
    return 1
  fi
}

check_file "src/api/services/driver-stats.service.ts" "DriverStatsService"
check_file "src/components/dashboard/MyVehicleCard.tsx" "MyVehicleCard"
check_file "src/components/dashboard/MaintenanceAlert.tsx" "MaintenanceAlert"
check_file "src/pages/DriverDashboard.tsx" "DriverDashboard"

echo ""
echo "📋 Phase 5: Vérification TypeScript"
echo "----------------------------------"

echo -n "  Type checking... "
if npx tsc --noEmit > /tmp/fd4-003-tsc.log 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "  Erreurs TypeScript:"
  cat /tmp/fd4-003-tsc.log | grep "error TS" | head -5
fi

echo ""
echo "📋 Phase 6: Vérification Accessibilité"
echo "------------------------------------"

# Vérifier que les touch targets sont présents
echo -n "  Touch targets (min-h-[48px])... "
touch_count=$(grep -r "min-h-\[48px\]" src/pages/DriverDashboard.tsx | wc -l)
if [ "$touch_count" -ge 4 ]; then
  echo -e "${GREEN}✓${NC} ($touch_count trouvés)"
else
  echo -e "${YELLOW}⚠${NC} ($touch_count trouvés, attendu >= 4)"
fi

# Vérifier que les aria-labels sont présents
echo -n "  Aria labels... "
aria_count=$(grep -r "aria-label" src/pages/DriverDashboard.tsx | wc -l)
if [ "$aria_count" -ge 4 ]; then
  echo -e "${GREEN}✓${NC} ($aria_count trouvés)"
else
  echo -e "${YELLOW}⚠${NC} ($aria_count trouvés, attendu >= 4)"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ Tests FD4-003 terminés${NC}"
echo "===================================="
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Lancer backend: cd backend && npm run start:dev"
echo "  2. Lancer frontend: cd frontend-driver && npm run dev"
echo "  3. Créer un driver de test"
echo "  4. Se connecter et tester le dashboard"
echo ""
echo "📖 Documentation complète: FD4-003_IMPLEMENTATION_COMPLETE.md"
