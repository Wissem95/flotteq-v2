#!/bin/bash
echo "🚀 Starting production deployment..."

# Check environment
if [ "$NODE_ENV" != "production" ]; then
  echo "⚠️ Warning: NODE_ENV is not 'production'"
  exit 1
fi

# Run migrations
echo "📦 Running migrations..."
npm run migration:run

# Start application
echo "🎯 Starting application..."
npm run start:prod