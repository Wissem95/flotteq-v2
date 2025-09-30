#!/bin/bash
echo "🧪 Testing migrations..."

# Backup current DB state
pg_dump -h localhost -U postgres -d flotteq_dev > /tmp/backup.sql

# Drop all tables
npm run migration:drop

# Run migrations
npm run migration:run

# Check tables exist
psql -h localhost -U postgres -d flotteq_dev -c "\dt"

echo "✅ Migration test complete"