#!/bin/sh
set -e

echo "🚀 Starting CivicPath Backend Container Initialization..."

# Execute Prisma migrations if DATABASE_URL is defined
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Executing database migrations..."
  ./node_modules/.bin/prisma migrate deploy || npx prisma migrate deploy || echo "⚠️ Warning: Database migration failed or database unreachable. Proceeding with startup..."
fi

if [ "$NODE_ENV" = "production" ] && [ "$SEED_DB" = "true" ] && [ -f "./prisma/seed.js" ]; then
  echo "🌱 Running Production Data Seeding..."
  node ./prisma/seed.js || echo "⚠️ Seeding failed or already seeded"
fi

echo "⚡ Container Initialization Complete. Executing application process..."
exec "$@"
