#!/bin/sh
set -e

echo "🚀 FlotteQ Backend - Starting..."

# Attendre que PostgreSQL soit prêt
echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z -v -w30 $DB_HOST $DB_PORT 2>/dev/null
do
  echo "Waiting for database connection at $DB_HOST:$DB_PORT..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Exécuter les migrations TypeORM
echo "🔄 Running database migrations..."
if npm run migration:run; then
  echo "✅ Migrations completed successfully!"
else
  echo "⚠️  Warning: Migrations failed or no pending migrations"
fi

# Démarrer l'application
echo "🎯 Starting NestJS application..."
exec node dist/main
