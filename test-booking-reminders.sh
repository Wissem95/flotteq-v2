#!/bin/bash

# Script de test pour les rappels de booking J-1
# B3-003 : Notifications email bookings

echo "========================================="
echo "📧 Test : Booking Reminders (J-1)"
echo "========================================="
echo ""

# Configuration
API_URL="http://localhost:3000/api"
TENANT_ID=1
ADMIN_EMAIL="admin@flotteq.com"
ADMIN_PASSWORD="Admin123456!"

echo "🔐 Step 1: Login as admin..."
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

echo "📅 Step 2: Get tomorrow's date..."
TOMORROW=$(date -v+1d +%Y-%m-%d)
echo "Tomorrow: $TOMORROW"
echo ""

echo "🔍 Step 3: Check for confirmed bookings tomorrow..."
BOOKINGS=$(curl -s -X GET "$API_URL/bookings?status=confirmed&startDate=$TOMORROW&endDate=$TOMORROW" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: $TENANT_ID")

BOOKING_COUNT=$(echo $BOOKINGS | jq -r '.total // 0')
echo "Found $BOOKING_COUNT confirmed booking(s) for tomorrow"

if [ "$BOOKING_COUNT" = "0" ]; then
  echo ""
  echo "⚠️  No bookings found for tomorrow"
  echo "💡 To test properly:"
  echo "   1. Create a booking for tomorrow via the API or UI"
  echo "   2. Confirm it (status: confirmed)"
  echo "   3. Wait for the CRON job to run at 9 AM tomorrow"
  echo "   OR trigger manually by calling the method in the service"
  echo ""
else
  echo ""
  echo "📋 Bookings details:"
  echo $BOOKINGS | jq -r '.bookings[] | "  - ID: \(.id) | Partner: \(.partnerName) | Service: \(.serviceName) | Time: \(.scheduledTime)"'
  echo ""
  echo "✅ These bookings will receive a reminder email at 9 AM today"
fi

echo ""
echo "========================================="
echo "📝 CRON Configuration:"
echo "========================================="
echo "Job: sendDailyBookingReminders()"
echo "Schedule: Every day at 9:00 AM"
echo "Expression: CronExpression.EVERY_DAY_AT_9AM"
echo "Target: Confirmed bookings scheduled for tomorrow"
echo ""
echo "📧 Email Template: booking-reminder.hbs"
echo "📨 Queue: email (via Bull + Redis)"
echo ""
echo "========================================="
echo "✅ Test Complete"
echo "========================================="
