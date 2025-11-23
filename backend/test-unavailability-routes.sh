#!/bin/bash

# Script de test des routes unavailability
# Usage: ./test-unavailability-routes.sh <partner-token>

TOKEN=$1

if [ -z "$TOKEN" ]; then
  echo "❌ Usage: ./test-unavailability-routes.sh <partner-token>"
  echo "Exemple: ./test-unavailability-routes.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  exit 1
fi

BASE_URL="http://localhost:3000/api/availabilities"

echo "🧪 Test des routes Unavailability"
echo "================================="
echo ""

# Test 1: GET /unavailability/list
echo "1️⃣ GET /unavailability/list"
curl -s -X GET "$BASE_URL/unavailability/list" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq -r '.message // .error // .'
echo ""

# Test 2: POST /unavailability (créer une période de test)
echo "2️⃣ POST /unavailability (création test)"
UNAVAIL_RESPONSE=$(curl -s -X POST "$BASE_URL/unavailability" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "reason": "Test script",
    "isFullDay": true
  }')

UNAVAIL_ID=$(echo $UNAVAIL_RESPONSE | jq -r '.unavailability.id // empty')

if [ -z "$UNAVAIL_ID" ]; then
  echo "❌ Erreur création: $UNAVAIL_RESPONSE"
else
  echo "✅ Créé avec ID: $UNAVAIL_ID"
fi
echo ""

# Test 3: PATCH /unavailability/:id (uniquement si création OK)
if [ ! -z "$UNAVAIL_ID" ]; then
  echo "3️⃣ PATCH /unavailability/$UNAVAIL_ID"
  curl -s -X PATCH "$BASE_URL/unavailability/$UNAVAIL_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "date": "2025-12-25",
      "reason": "Test script - MODIFIÉ",
      "isFullDay": true
    }' \
    | jq -r '.message // .error // .'
  echo ""

  # Test 4: DELETE /unavailability/:id (nettoyage)
  echo "4️⃣ DELETE /unavailability/$UNAVAIL_ID (nettoyage)"
  curl -s -X DELETE "$BASE_URL/unavailability/$UNAVAIL_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nHTTP Status: %{http_code}\n"
  echo ""
fi

echo "================================="
echo "✅ Tests terminés"
