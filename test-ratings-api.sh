#!/bin/bash

# Test script for B3-002 Ratings API
# Tests all rating endpoints with proper authentication

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "🧪 Testing Ratings API (B3-002)"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test variables (replace with actual values from your DB)
TENANT_TOKEN="your-tenant-jwt-token"
PARTNER_ID="your-partner-id"
BOOKING_ID="your-completed-booking-id"

echo -e "${YELLOW}⚠️  Before running this script:${NC}"
echo "1. Make sure backend is running (npm run start:dev)"
echo "2. Update TENANT_TOKEN, PARTNER_ID, and BOOKING_ID variables"
echo "3. Ensure you have at least one completed booking"
echo ""

# Test 1: Create rating (Tenant only)
echo -e "${YELLOW}Test 1: Create rating for completed booking${NC}"
curl -X POST "${BASE_URL}/ratings" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"${BOOKING_ID}\",
    \"score\": 4.5,
    \"comment\": \"Excellent service, very professional!\"
  }" | jq .
echo ""
echo ""

# Test 2: Check if booking can be rated
echo -e "${YELLOW}Test 2: Check if booking can be rated${NC}"
curl -X GET "${BASE_URL}/ratings/can-rate/${BOOKING_ID}" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" | jq .
echo ""
echo ""

# Test 3: Get tenant's ratings history
echo -e "${YELLOW}Test 3: Get tenant's ratings history${NC}"
curl -X GET "${BASE_URL}/ratings/my-ratings?page=1&limit=10" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" | jq .
echo ""
echo ""

# Test 4: Get partner ratings (Public - no auth required)
echo -e "${YELLOW}Test 4: Get partner ratings (Public)${NC}"
curl -X GET "${BASE_URL}/ratings/partner/${PARTNER_ID}?page=1&limit=10" | jq .
echo ""
echo ""

# Test 5: Try to create duplicate rating (should fail)
echo -e "${YELLOW}Test 5: Try to create duplicate rating (should fail)${NC}"
curl -X POST "${BASE_URL}/ratings" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"${BOOKING_ID}\",
    \"score\": 5.0,
    \"comment\": \"Another rating\"
  }" | jq .
echo ""
echo ""

# Test 6: Try to rate with invalid score (should fail)
echo -e "${YELLOW}Test 6: Try to rate with invalid score (should fail)${NC}"
curl -X POST "${BASE_URL}/ratings" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"${BOOKING_ID}\",
    \"score\": 6.0,
    \"comment\": \"Invalid score\"
  }" | jq .
echo ""
echo ""

# Verify partner rating was updated
echo -e "${YELLOW}Test 7: Verify partner rating updated in database${NC}"
PGPASSWORD=flotteq123 psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \
  "SELECT id, company_name, rating, total_reviews FROM partners WHERE id = '${PARTNER_ID}';"
echo ""

echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo "Expected results:"
echo "1. ✅ Rating created successfully"
echo "2. ❌ Can rate = false (already rated)"
echo "3. ✅ Tenant ratings list returned"
echo "4. ✅ Partner ratings list returned (with averageScore)"
echo "5. ❌ 409 Conflict - already rated"
echo "6. ❌ 400 Bad Request - invalid score"
echo "7. ✅ Partner rating and totalReviews updated"
