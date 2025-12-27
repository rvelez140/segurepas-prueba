#!/bin/bash

# Post-create script for Dev Container
# This script runs after the container is created

set -e

echo "🔧 Setting up SecurePass Development Environment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install API dependencies
echo "📦 Installing API dependencies..."
cd apps/api && npm install && cd ../..

# Install Web dependencies
echo "📦 Installing Web dependencies..."
cd apps/web && npm install && cd ../..

# Install Mobile dependencies
echo "📦 Installing Mobile dependencies..."
cd apps/mobile && npm install && cd ../..

# Install Desktop dependencies
echo "📦 Installing Desktop dependencies..."
cd apps/desktop && npm install && cd ../..

# Setup Husky hooks
echo "🪝 Setting up Git hooks..."
npm run prepare

# Create .env files if they don't exist
echo "📝 Creating environment files..."

# API .env
if [ ! -f apps/api/.env ]; then
  cat > apps/api/.env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://admin:admin123@localhost:27017/securepass_dev?authSource=admin

# Redis
REDIS_URL=redis://:redis123@localhost:6379

# JWT
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (optional in dev)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional in dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password

# Stripe (optional in dev)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal (optional in dev)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Firebase (optional in dev)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Sentry (optional in dev)
SENTRY_DSN=
EOF
  echo "✅ Created apps/api/.env"
fi

# Web .env
if [ ! -f apps/web/.env ]; then
  cat > apps/web/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SENTRY_DSN=
EOF
  echo "✅ Created apps/web/.env"
fi

# Mobile .env
if [ ! -f apps/mobile/.env ]; then
  cat > apps/mobile/.env << 'EOF'
API_URL=http://localhost:5000
SENTRY_DSN=
EOF
  echo "✅ Created apps/mobile/.env"
fi

echo "✨ Development environment setup complete!"
echo ""
echo "🚀 Quick start commands:"
echo "  npm run start:api     - Start API server"
echo "  npm run start:web     - Start Web app"
echo "  npm run start:mobile  - Start Mobile app"
echo "  npm run start:all     - Start all apps"
echo "  npm run lint          - Run linter"
echo "  npm run test:all      - Run all tests"
echo ""
echo "📚 Documentation: See README.md for more details"
