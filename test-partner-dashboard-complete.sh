#!/bin/bash

echo "🧪 TEST COMPLET - Dashboard Partner (Fix 401 + partnerId)"
echo "=========================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5175"
PARTNER_EMAIL="Norautok@gmail.com"
PARTNER_ID="a0d2fb01-36dc-4981-b558-3846403381d2"

# 1. Vérifier services lancés
echo "1️⃣ Vérification des services..."
echo "================================"

if curl -s "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend lancé${NC} (${BACKEND_URL})"
else
  echo -e "${RED}❌ Backend non disponible${NC}"
  echo "   Lancez: cd backend && npm run start:dev"
  exit 1
fi

if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend Partner lancé${NC} (${FRONTEND_URL})"
else
  echo -e "${YELLOW}⚠️  Frontend Partner non disponible${NC}"
  echo "   Lancez: cd frontend-partner && npm run dev"
fi

echo ""

# 2. Test API Login (sans Authorization header)
echo "2️⃣ Test API Login (fix 401)..."
echo "==============================="

# Note: On ne peut pas tester le mot de passe ici sans le connaître
echo -e "${BLUE}📋 Compte test disponible:${NC}"
echo "   Email: ${PARTNER_EMAIL}"
echo "   Partner ID: ${PARTNER_ID}"
echo ""
echo -e "${YELLOW}⚠️  Test API login nécessite le mot de passe${NC}"
echo "   Test manuel: Se connecter via ${FRONTEND_URL}/login"
echo ""

# 3. Vérifier données dans DB
echo "3️⃣ Vérification données Partner..."
echo "==================================="

BOOKINGS_COUNT=$(PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c "SELECT COUNT(*) FROM bookings WHERE partner_id = '${PARTNER_ID}';" 2>/dev/null | xargs)

if [ -n "$BOOKINGS_COUNT" ]; then
  echo -e "${GREEN}✅ Bookings trouvés: ${BOOKINGS_COUNT}${NC}"
else
  echo -e "${YELLOW}⚠️  Impossible de vérifier la DB${NC}"
fi

COMMISSIONS_COUNT=$(PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -t -c "SELECT COUNT(*) FROM commissions WHERE partner_id = '${PARTNER_ID}';" 2>/dev/null | xargs)

if [ -n "$COMMISSIONS_COUNT" ]; then
  echo -e "${GREEN}✅ Commissions trouvées: ${COMMISSIONS_COUNT}${NC}"
else
  echo -e "${YELLOW}⚠️  Impossible de vérifier la DB${NC}"
fi

echo ""

# 4. Instructions de test manuel
echo "4️⃣ INSTRUCTIONS TEST MANUEL"
echo "============================"
echo ""
echo -e "${BLUE}A. Test Fix 401 (Axios Interceptor)${NC}"
echo "   1. Ouvrir ${FRONTEND_URL}/login dans le navigateur"
echo "   2. Ouvrir DevTools (F12) → Network tab"
echo "   3. Se connecter avec: ${PARTNER_EMAIL}"
echo "   4. Vérifier requête POST /api/partners/auth/login"
echo "   5. ✅ Headers NE DOIT PAS contenir 'Authorization'"
echo "   6. ✅ Response: 200 OK avec accessToken"
echo ""

echo -e "${BLUE}B. Test Fix partnerId (LoginPage)${NC}"
echo "   1. Après login, ouvrir DevTools → Console"
echo "   2. Exécuter:"
echo "      JSON.parse(localStorage.getItem('partner_user'))"
echo "   3. ✅ Doit contenir: partnerId: \"${PARTNER_ID}\""
echo ""

echo -e "${BLUE}C. Test Dashboard KPIs${NC}"
echo "   1. Naviguer vers ${FRONTEND_URL}/dashboard"
echo "   2. Vérifier les valeurs affichées:"
echo "      ✅ RDV cette semaine: != 0 (si bookings existent)"
echo "      ✅ CA mois en cours: != 0.00€"
echo "      ✅ Commissions en attente: != 0.00€"
echo "      ✅ Taux d'acceptation: != 0%"
echo ""
echo "   3. Vérifier Network → XHR:"
echo "      ✅ GET /api/bookings?partnerId=${PARTNER_ID}&..."
echo "      ✅ GET /api/commissions/totals/${PARTNER_ID}?..."
echo "      ✅ Toutes les requêtes: 200 OK"
echo ""

echo -e "${BLUE}D. Test Persistence (Refresh)${NC}"
echo "   1. Appuyer sur F5 (refresh page)"
echo "   2. Vérifier Console:"
echo "      useAuthStore.getState().user.partnerId"
echo "   3. ✅ Doit retourner: \"${PARTNER_ID}\""
echo "   4. ✅ Dashboard affiche toujours les valeurs"
echo ""

echo -e "${BLUE}E. Test Logout/Login${NC}"
echo "   1. Se déconnecter"
echo "   2. Vérifier localStorage vide:"
echo "      localStorage.getItem('partner_token') // null"
echo "   3. Se reconnecter"
echo "   4. ✅ Pas de 401, partnerId présent, Dashboard OK"
echo ""

# 5. Checklist finale
echo "5️⃣ CHECKLIST FINALE"
echo "==================="
echo ""
echo "Corrections appliquées:"
echo "  ✅ frontend-partner/src/lib/axios.ts (interceptor)"
echo "  ✅ frontend-partner/src/pages/LoginPage.tsx (partnerId)"
echo "  ✅ backend/src/modules/partners/partner-auth.service.ts (getProfile)"
echo ""
echo "Tests à valider:"
echo "  [ ] Login fonctionne sans 401"
echo "  [ ] partnerId stocké dans localStorage"
echo "  [ ] partnerId présent dans authStore"
echo "  [ ] Dashboard affiche vraies données"
echo "  [ ] Requêtes API avec partnerId correct"
echo "  [ ] Refresh page conserve partnerId"
echo "  [ ] Logout/Login fonctionne"
echo ""

echo -e "${GREEN}✅ Script terminé !${NC}"
echo ""
echo -e "${YELLOW}📝 Note:${NC} Si Dashboard affiche toujours 0:"
echo "   → Vérifier si bookings/commissions existent pour ce partner"
echo "   → Vérifier dates (semaine/mois en cours)"
echo "   → Console DevTools pour voir erreurs API"
