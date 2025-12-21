#!/bin/bash

# Script para generar credenciales seguras para producción
# NO subas las credenciales generadas a Git

echo "==================================="
echo "Generador de Credenciales Seguras"
echo "==================================="
echo ""

# Verificar que openssl está instalado
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl no está instalado"
    echo "Instálalo con: sudo apt-get install openssl"
    exit 1
fi

echo "🔐 Generando credenciales aleatorias seguras..."
echo ""

# Generar contraseña de MongoDB (32 caracteres alfanuméricos)
MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "# MongoDB Credentials"
echo "MONGO_ROOT_USER=admin"
echo "MONGO_ROOT_PASSWORD=$MONGO_PASSWORD"
echo "MONGO_DB_NAME=securepass"
echo "MONGODB_PORT=27017"
echo ""

# Generar JWT secret (64 caracteres)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
echo "# JWT Configuration"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_EXPIRES_IN=7d"
echo ""

# Generar token aleatorio para webhooks o API keys
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "# Webhook/API Secrets"
echo "WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""

# Generar API token
API_TOKEN=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "API_TOKEN=$API_TOKEN"
echo ""

echo "==================================="
echo "⚠️  IMPORTANTE - LEE ESTO"
echo "==================================="
echo ""
echo "1. Guarda estas credenciales en un lugar SEGURO (gestor de contraseñas)"
echo "2. NO las compartas por email, Slack, o chat"
echo "3. NO las subas a Git o repositorios públicos"
echo "4. Úsalas para crear tu archivo .env.production en el servidor"
echo "5. Configúralas como GitHub Secrets para CI/CD"
echo ""
echo "Para guardar en un archivo (NO subas este archivo a Git):"
echo "  ./generate-credentials.sh > .credentials.txt"
echo "  chmod 600 .credentials.txt"
echo ""
