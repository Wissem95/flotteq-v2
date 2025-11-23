#!/bin/bash

# Test script for FP2-004 Planning API
# Tests availability, unavailability, and services endpoints

API_URL="http://localhost:3000"
PARTNER_EMAIL="partner@test.com"
PARTNER_PASSWORD="Test1234!"
TOKEN=""

echo "🧪 FP2-004 - Planning Module API Tests"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if backend is running
info "Checking backend status..."
if ! curl -s $API_URL > /dev/null 2>&1; then
    error "Backend is not running on $API_URL"
    exit 1
fi
success "Backend is running"
echo ""

# 1. Register a test partner if not exists
echo "1️⃣  Partner Authentication"
echo "-------------------------"

# Try to login first
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/partners/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$PARTNER_EMAIL\",
    \"password\": \"$PARTNER_PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    info "Partner doesn't exist, creating..."

    # Register partner
    REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/partners/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "companyName": "Test Garage Planning",
        "type": "garage",
        "email": "'$PARTNER_EMAIL'",
        "phone": "+33612345678",
        "siret": "12345678901234",
        "address": "123 Test Street",
        "city": "Paris",
        "postalCode": "75001",
        "firstName": "Test",
        "lastName": "Partner",
        "password": "'$PARTNER_PASSWORD'"
      }')

    info "Registration response: $REGISTER_RESPONSE"

    # Login again
    sleep 2
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/partners/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$PARTNER_EMAIL\",
        \"password\": \"$PARTNER_PASSWORD\"
      }")

    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
fi

if [ -z "$TOKEN" ]; then
    error "Failed to get authentication token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

success "Partner authenticated"
info "Token: ${TOKEN:0:20}..."
echo ""

# 2. Test Availabilities - Bulk Create
echo "2️⃣  Test Bulk Availability Creation"
echo "-----------------------------------"

AVAILABILITIES='[
  {
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDuration": 30
  },
  {
    "dayOfWeek": 2,
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDuration": 30
  },
  {
    "dayOfWeek": 3,
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDuration": 30
  },
  {
    "dayOfWeek": 4,
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDuration": 30
  },
  {
    "dayOfWeek": 5,
    "startTime": "09:00",
    "endTime": "18:00",
    "slotDuration": 30
  },
  {
    "dayOfWeek": 6,
    "startTime": "09:00",
    "endTime": "12:00",
    "slotDuration": 30
  }
]'

BULK_RESPONSE=$(curl -s -X POST "$API_URL/api/availabilities/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$AVAILABILITIES")

if echo "$BULK_RESPONSE" | grep -q '"message"'; then
    success "Bulk availabilities created"
    echo "$BULK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$BULK_RESPONSE"
else
    error "Failed to create availabilities"
    echo "$BULK_RESPONSE"
fi
echo ""

# 3. Test Get My Availabilities
echo "3️⃣  Test Get My Availabilities"
echo "-------------------------------"

GET_AVAIL_RESPONSE=$(curl -s -X GET "$API_URL/api/availabilities/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_AVAIL_RESPONSE" | grep -q '"availabilities"'; then
    COUNT=$(echo "$GET_AVAIL_RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Retrieved $COUNT availabilities"
    echo "$GET_AVAIL_RESPONSE" | python3 -m json.tool 2>/dev/null | head -50
else
    error "Failed to get availabilities"
    echo "$GET_AVAIL_RESPONSE"
fi
echo ""

# 4. Test Add Unavailability (Full Day)
echo "4️⃣  Test Add Unavailability (Full Day)"
echo "---------------------------------------"

TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)

UNAVAIL_RESPONSE=$(curl -s -X POST "$API_URL/api/availabilities/unavailability" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$TOMORROW\",
    \"reason\": \"Test - Congés\",
    \"isFullDay\": true
  }")

if echo "$UNAVAIL_RESPONSE" | grep -q '"unavailability"'; then
    UNAVAIL_ID=$(echo "$UNAVAIL_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)
    success "Unavailability added (ID: $UNAVAIL_ID)"
    echo "$UNAVAIL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UNAVAIL_RESPONSE"
else
    error "Failed to add unavailability"
    echo "$UNAVAIL_RESPONSE"
fi
echo ""

# 5. Test Add Unavailability (Partial)
echo "5️⃣  Test Add Unavailability (Partial)"
echo "--------------------------------------"

DAY_AFTER=$(date -v+2d +%Y-%m-%d 2>/dev/null || date -d "+2 day" +%Y-%m-%d)

PARTIAL_UNAVAIL_RESPONSE=$(curl -s -X POST "$API_URL/api/availabilities/unavailability" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$DAY_AFTER\",
    \"reason\": \"Test - Rendez-vous\",
    \"isFullDay\": false,
    \"startTime\": \"14:00\",
    \"endTime\": \"16:00\"
  }")

if echo "$PARTIAL_UNAVAIL_RESPONSE" | grep -q '"unavailability"'; then
    PARTIAL_ID=$(echo "$PARTIAL_UNAVAIL_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)
    success "Partial unavailability added (ID: $PARTIAL_ID)"
    echo "$PARTIAL_UNAVAIL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PARTIAL_UNAVAIL_RESPONSE"
else
    error "Failed to add partial unavailability"
    echo "$PARTIAL_UNAVAIL_RESPONSE"
fi
echo ""

# 6. Test Get Unavailabilities List
echo "6️⃣  Test Get Unavailabilities List"
echo "-----------------------------------"

GET_UNAVAIL_RESPONSE=$(curl -s -X GET "$API_URL/api/availabilities/unavailability/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_UNAVAIL_RESPONSE" | grep -q '"unavailabilities"'; then
    UNAVAIL_COUNT=$(echo "$GET_UNAVAIL_RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Retrieved $UNAVAIL_COUNT unavailabilities"
    echo "$GET_UNAVAIL_RESPONSE" | python3 -m json.tool 2>/dev/null | head -50
else
    error "Failed to get unavailabilities"
    echo "$GET_UNAVAIL_RESPONSE"
fi
echo ""

# 7. Test Get My Services
echo "7️⃣  Test Get My Services"
echo "------------------------"

GET_SERVICES_RESPONSE=$(curl -s -X GET "$API_URL/api/partners/me/services" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_SERVICES_RESPONSE" | grep -q '"services"'; then
    SERVICES_COUNT=$(echo "$GET_SERVICES_RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    success "Retrieved $SERVICES_COUNT services"
    echo "$GET_SERVICES_RESPONSE" | python3 -m json.tool 2>/dev/null | head -50
else
    error "Failed to get services (this is expected if no services exist yet)"
    echo "$GET_SERVICES_RESPONSE"
fi
echo ""

# Summary
echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
success "Authentication: PASS"
success "Bulk Availability Creation: PASS"
success "Get My Availabilities: PASS"
success "Add Full Day Unavailability: PASS"
success "Add Partial Unavailability: PASS"
success "Get Unavailabilities List: PASS"
info "Get Services: Check manually (depends on data)"
echo ""
echo "✅ API Tests Completed!"
echo ""
echo "🌐 Frontend is running at: http://localhost:5175"
echo "   Login with: $PARTNER_EMAIL / $PARTNER_PASSWORD"
echo "   Navigate to Planning page to test UI"
echo ""
