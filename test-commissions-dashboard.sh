#!/bin/bash

# Script de test du Dashboard Commissions (FI2-002)

echo "🧪 Test Dashboard Commissions - FI2-002"
echo "========================================"
echo ""

# Configuration
API_URL="http://localhost:3000/api"
ADMIN_TOKEN=""

# Fonction pour afficher les résultats
print_result() {
  if [ $1 -eq 0 ]; then
    echo "✅ $2"
  else
    echo "❌ $2"
  fi
}

echo "📝 Veuillez vous connecter en tant qu'admin pour obtenir le token..."
echo ""

# Test 1 : Obtenir le token admin
echo "1️⃣  Test connexion admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@flotteq.com",
    "password": "Admin123!"
  }')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Impossible de se connecter. Vérifiez que le backend est lancé et que l'admin existe."
  exit 1
fi

echo "✅ Token obtenu: ${ADMIN_TOKEN:0:20}..."
echo ""

# Test 2 : GET /commissions/stats
echo "2️⃣  Test GET /commissions/stats..."
STATS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/commissions/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

HTTP_CODE=$(echo "$STATS_RESPONSE" | tail -n1)
STATS_BODY=$(echo "$STATS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Status: 200 OK"
  echo "📊 Stats récupérées:"
  echo "$STATS_BODY" | jq '.stats' 2>/dev/null || echo "$STATS_BODY"
else
  echo "❌ Status: $HTTP_CODE"
  echo "$STATS_BODY"
fi
echo ""

# Test 3 : GET /commissions/pending
echo "3️⃣  Test GET /commissions/pending..."
PENDING_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/commissions/pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

HTTP_CODE=$(echo "$PENDING_RESPONSE" | tail -n1)
PENDING_BODY=$(echo "$PENDING_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Status: 200 OK"
  COUNT=$(echo "$PENDING_BODY" | jq '.count' 2>/dev/null || echo "?")
  echo "📋 Commissions en attente: $COUNT"
else
  echo "❌ Status: $HTTP_CODE"
  echo "$PENDING_BODY"
fi
echo ""

# Test 4 : GET /commissions (liste)
echo "4️⃣  Test GET /commissions?page=1&limit=5..."
LIST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/commissions?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

HTTP_CODE=$(echo "$LIST_RESPONSE" | tail -n1)
LIST_BODY=$(echo "$LIST_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Status: 200 OK"
  TOTAL=$(echo "$LIST_BODY" | jq '.total' 2>/dev/null || echo "?")
  echo "📊 Total commissions: $TOTAL"
else
  echo "❌ Status: $HTTP_CODE"
  echo "$LIST_BODY"
fi
echo ""

# Test 5 : Vérifier que l'export Excel fonctionne
echo "5️⃣  Test GET /commissions/export..."
EXPORT_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/commissions/export" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o /tmp/commissions_test.xlsx)

HTTP_CODE=$(echo "$EXPORT_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  FILE_SIZE=$(stat -f%z /tmp/commissions_test.xlsx 2>/dev/null || stat -c%s /tmp/commissions_test.xlsx 2>/dev/null)
  if [ "$FILE_SIZE" -gt 0 ]; then
    echo "✅ Status: 200 OK - Fichier Excel généré ($FILE_SIZE bytes)"
    rm /tmp/commissions_test.xlsx
  else
    echo "⚠️  Status: 200 mais fichier vide"
  fi
else
  echo "❌ Status: $HTTP_CODE"
fi
echo ""

# Résumé
echo "========================================="
echo "✅ Tests terminés !"
echo ""
echo "📌 Étapes suivantes :"
echo "1. Vérifier le frontend : npm run dev (frontend-internal)"
echo "2. Naviguer vers http://localhost:5173/commissions"
echo "3. Vérifier les 4 KPIs"
echo "4. Vérifier le Top 10 Partenaires"
echo "5. Vérifier les commissions en attente"
echo "6. Vérifier le graphique d'évolution"
echo "7. Tester l'export Excel"
echo "8. Tester 'Marquer comme payé'"
echo ""
