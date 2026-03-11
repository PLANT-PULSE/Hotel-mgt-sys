#!/bin/bash

# Hotel Management System - Phase 1 Setup Script
# Installs dependencies and applies database migrations

set -e

echo "============================================"
echo "Phase 1: Backend Setup"
echo "============================================"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Generate Prisma client
echo "🔄 Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# Apply migrations
echo "🔄 Applying database migrations..."
cd backend
npx prisma migrate deploy || npx prisma migrate dev --name "add_stripe_and_reservations"
cd ..

echo ""
echo "✅ Phase 1 Complete!"
echo ""
echo "Next steps:"
echo "1. Ensure DATABASE_URL is set in .env"
echo "2. Ensure STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY are set"
echo "3. Ensure BLOB_READ_WRITE_TOKEN is set"
echo "4. Run 'cd backend && npm run start:dev' to start the backend"
echo ""
