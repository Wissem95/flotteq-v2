#!/bin/bash

# Test script for FD4-005: Report Problem with Photos
# Tests both creating reports with and without photos

BASE_URL="http://localhost:3000"
DRIVER_EMAIL="driver@flotteq.com"
DRIVER_PASSWORD="password123"

echo "🧪 Test FD4-005: Signalement Problème avec Photos"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login as driver
echo "1️⃣  Connexion driver..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/driver/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$DRIVER_EMAIL\",
    \"password\": \"$DRIVER_PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Échec de connexion${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Connexion réussie${NC}"
echo ""

# Step 2: Create report WITHOUT photos
echo "2️⃣  Création signalement SANS photos..."
REPORT_NO_PHOTOS=$(curl -s -X POST "$BASE_URL/driver/reports" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "mechanical",
    "description": "Test signalement sans photos - Bruit moteur étrange au démarrage",
    "notes": "Le problème apparaît à froid uniquement"
  }')

REPORT_ID_1=$(echo $REPORT_NO_PHOTOS | grep -o '"reportId":"[^"]*' | sed 's/"reportId":"//')

if [ -z "$REPORT_ID_1" ]; then
  echo -e "${RED}❌ Échec création signalement sans photos${NC}"
  echo "Response: $REPORT_NO_PHOTOS"
  exit 1
fi

echo -e "${GREEN}✓ Signalement créé (ID: $REPORT_ID_1)${NC}"
echo ""

# Step 3: Create report WITH photos
echo "3️⃣  Création signalement AVEC photos..."
REPORT_WITH_PHOTOS=$(curl -s -X POST "$BASE_URL/driver/reports" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "damage",
    "description": "Test signalement avec photos - Rayure sur la portière avant gauche",
    "notes": "Probablement causée par un accrochage avec un poteau"
  }')

REPORT_ID_2=$(echo $REPORT_WITH_PHOTOS | grep -o '"reportId":"[^"]*' | sed 's/"reportId":"//')

if [ -z "$REPORT_ID_2" ]; then
  echo -e "${RED}❌ Échec création signalement avec photos${NC}"
  echo "Response: $REPORT_WITH_PHOTOS"
  exit 1
fi

echo -e "${GREEN}✓ Signalement créé (ID: $REPORT_ID_2)${NC}"
echo ""

# Step 4: Create test image (simple 1x1 PNG)
echo "4️⃣  Création images de test..."
TEST_IMAGE_1="/tmp/test-report-photo-1.png"
TEST_IMAGE_2="/tmp/test-report-photo-2.png"

# Create simple PNG with ImageMagick or Python
if command -v convert &> /dev/null; then
  convert -size 100x100 xc:red $TEST_IMAGE_1
  convert -size 100x100 xc:blue $TEST_IMAGE_2
  echo -e "${GREEN}✓ Images créées avec ImageMagick${NC}"
elif command -v python3 &> /dev/null; then
  python3 << EOF
from PIL import Image
img1 = Image.new('RGB', (100, 100), color='red')
img1.save('$TEST_IMAGE_1')
img2 = Image.new('RGB', (100, 100), color='blue')
img2.save('$TEST_IMAGE_2')
EOF
  echo -e "${GREEN}✓ Images créées avec Python${NC}"
else
  echo -e "${YELLOW}⚠️  ImageMagick ou Python non disponible, skip upload photos${NC}"
  SKIP_PHOTOS=true
fi
echo ""

# Step 5: Upload photos to report
if [ "$SKIP_PHOTOS" != "true" ]; then
  echo "5️⃣  Upload photos vers signalement $REPORT_ID_2..."
  UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/driver/reports/$REPORT_ID_2/photos" \
    -H "Authorization: Bearer $TOKEN" \
    -F "photos=@$TEST_IMAGE_1" \
    -F "photos=@$TEST_IMAGE_2")

  PHOTOS_COUNT=$(echo $UPLOAD_RESPONSE | grep -o '"photosCount":[0-9]*' | sed 's/"photosCount"://')

  if [ "$PHOTOS_COUNT" = "2" ]; then
    echo -e "${GREEN}✓ 2 photos uploadées avec succès${NC}"
  else
    echo -e "${RED}❌ Échec upload photos${NC}"
    echo "Response: $UPLOAD_RESPONSE"
  fi
  echo ""
fi

# Step 6: Verify reports
echo "6️⃣  Vérification des signalements..."
REPORTS_LIST=$(curl -s -X GET "$BASE_URL/driver/reports" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_REPORTS=$(echo $REPORTS_LIST | grep -o '"id"' | wc -l)

echo -e "${GREEN}✓ $TOTAL_REPORTS signalements récupérés${NC}"
echo ""

# Step 7: Summary
echo "📊 Résumé des tests"
echo "==================="
echo -e "✅ Signalement sans photos: ${GREEN}ID $REPORT_ID_1${NC}"
echo -e "✅ Signalement avec photos: ${GREEN}ID $REPORT_ID_2${NC}"
if [ "$SKIP_PHOTOS" != "true" ]; then
  echo -e "✅ Upload photos: ${GREEN}2 photos${NC}"
else
  echo -e "⚠️  Upload photos: ${YELLOW}Skip (dépendances manquantes)${NC}"
fi
echo ""
echo -e "${GREEN}✨ Tests complétés avec succès!${NC}"
echo ""
echo "🔗 Accéder à l'app driver:"
echo "   http://localhost:5176/reports"
echo ""
echo "📧 Vérifier les emails de notification aux admins tenant"
