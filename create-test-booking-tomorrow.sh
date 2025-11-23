#!/bin/bash

# Script pour créer une réservation de test pour demain
# Utile pour tester le système de rappels J-1

echo "========================================="
echo "🎯 Create Test Booking for Tomorrow"
echo "========================================="
echo ""

API_URL="http://localhost:3000/api"
TENANT_ID=1

# Dates
TOMORROW=$(date -v+1d +%Y-%m-%d)
echo "📅 Tomorrow: $TOMORROW"
echo ""

echo "🔐 Step 1: Login as tenant admin..."
read -p "Enter admin email (default: admin@flotteq.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@flotteq.com}

read -sp "Enter admin password (default: Admin123456!): " ADMIN_PASSWORD
echo ""
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin123456!}

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Login successful"
echo ""

echo "🔍 Step 2: Get available partners..."
PARTNERS=$(curl -s -X GET "$API_URL/partners/search?status=approved&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT_ID")

PARTNER_COUNT=$(echo $PARTNERS | jq -r '.total // 0')

if [ "$PARTNER_COUNT" = "0" ]; then
  echo "❌ No approved partners found"
  exit 1
fi

echo "Found $PARTNER_COUNT approved partner(s)"
FIRST_PARTNER_ID=$(echo $PARTNERS | jq -r '.partners[0].id')
FIRST_PARTNER_NAME=$(echo $PARTNERS | jq -r '.partners[0].companyName')
echo "Selected partner: $FIRST_PARTNER_NAME ($FIRST_PARTNER_ID)"
echo ""

echo "🔍 Step 3: Get partner services..."
SERVICES=$(curl -s -X GET "$API_URL/partners/$FIRST_PARTNER_ID/services" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT_ID")

SERVICE_ID=$(echo $SERVICES | jq -r '.[0].id')
SERVICE_NAME=$(echo $SERVICES | jq -r '.[0].name')

if [ "$SERVICE_ID" = "null" ]; then
  echo "❌ No services found for this partner"
  exit 1
fi

echo "Selected service: $SERVICE_NAME ($SERVICE_ID)"
echo ""

echo "🔍 Step 4: Get vehicles..."
VEHICLES=$(curl -s -X GET "$API_URL/vehicles?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT_ID")

VEHICLE_ID=$(echo $VEHICLES | jq -r '.vehicles[0].id')
VEHICLE_REG=$(echo $VEHICLES | jq -r '.vehicles[0].registration')

if [ "$VEHICLE_ID" = "null" ]; then
  echo "❌ No vehicles found"
  exit 1
fi

echo "Selected vehicle: $VEHICLE_REG ($VEHICLE_ID)"
echo ""

echo "📝 Step 5: Create booking for tomorrow..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"partnerId\": \"$FIRST_PARTNER_ID\",
    \"serviceId\": \"$SERVICE_ID\",
    \"vehicleId\": \"$VEHICLE_ID\",
    \"scheduledDate\": \"$TOMORROW\",
    \"scheduledTime\": \"10:00\",
    \"endTime\": \"11:00\",
    \"customerNotes\": \"Test booking for reminder system\"
  }")

BOOKING_ID=$(echo $CREATE_RESPONSE | jq -r '.id')

if [ "$BOOKING_ID" = "null" ] || [ -z "$BOOKING_ID" ]; then
  echo "❌ Failed to create booking"
  echo "$CREATE_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Booking created: $BOOKING_ID"
echo ""

echo "✅ Step 6: Partner confirms booking..."
# Get partner auth token
PARTNER_EMAIL=$(echo $PARTNERS | jq -r '.partners[0].email')
echo "Partner email: $PARTNER_EMAIL"

# For now, we'll use admin to confirm (in real scenario, partner would log in)
CONFIRM_RESPONSE=$(curl -s -X PATCH "$API_URL/bookings/$BOOKING_ID/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT_ID")

BOOKING_STATUS=$(echo $CONFIRM_RESPONSE | jq -r '.status')

if [ "$BOOKING_STATUS" != "confirmed" ]; then
  echo "⚠️  Could not confirm booking automatically"
  echo "You may need to confirm it manually via the partner dashboard"
else
  echo "✅ Booking confirmed!"
fi

echo ""
echo "========================================="
echo "✅ Test Booking Created Successfully"
echo "========================================="
echo ""
echo "📋 Booking Details:"
echo "  - ID: $BOOKING_ID"
echo "  - Partner: $FIRST_PARTNER_NAME"
echo "  - Service: $SERVICE_NAME"
echo "  - Vehicle: $VEHICLE_REG"
echo "  - Date: $TOMORROW at 10:00"
echo "  - Status: $BOOKING_STATUS"
echo ""
echo "📧 This booking should receive a reminder email tomorrow at 9:00 AM"
echo ""
echo "🔗 View in UI:"
echo "   http://localhost:5173/bookings/$BOOKING_ID"
echo ""
