#!/bin/bash

# Script para configurar el servidor de producción
# Ejecuta este script SOLO en el servidor de producción

set -e

echo "=========================================="
echo "Configuración de Servidor de Producción"
echo "SecurePass - Setup Script v1.0"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificación de seguridad
echo -e "${YELLOW}⚠️  ADVERTENCIA: Este script configurará tu servidor de producción${NC}"
echo "Asegúrate de ejecutarlo solo en el servidor correcto"
echo ""
read -p "¿Estás en el servidor de producción? (escribe 'yes' para continuar): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Cancelado por el usuario${NC}"
    exit 1
fi

# Verificar que somos root o tenemos sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Este script necesita permisos de root${NC}"
    echo "Ejecuta con: sudo $0"
    exit 1
fi

echo ""
echo "📋 Paso 1: Verificando dependencias..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Instálalo con:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    exit 1
else
    echo -e "${GREEN}✅ Docker instalado${NC}"
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    echo "Instálalo con:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install docker-compose-plugin"
    exit 1
else
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
fi

echo ""
echo "📁 Paso 2: Creando estructura de directorios..."

# Directorio base del proyecto
PROJECT_DIR="/opt/securepass"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Crear subdirectorios necesarios
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p backups

echo -e "${GREEN}✅ Directorios creados en $PROJECT_DIR${NC}"

echo ""
echo "🔐 Paso 3: Configurando credenciales..."

# Solicitar información
read -p "Usuario MongoDB (default: admin): " MONGO_USER
MONGO_USER=${MONGO_USER:-admin}

while true; do
    read -sp "Contraseña MongoDB (mínimo 16 caracteres): " MONGO_PASS
    echo ""
    if [ ${#MONGO_PASS} -lt 16 ]; then
        echo -e "${RED}❌ La contraseña debe tener al menos 16 caracteres${NC}"
    else
        read -sp "Confirma la contraseña: " MONGO_PASS_CONFIRM
        echo ""
        if [ "$MONGO_PASS" = "$MONGO_PASS_CONFIRM" ]; then
            break
        else
            echo -e "${RED}❌ Las contraseñas no coinciden${NC}"
        fi
    fi
done

read -p "Nombre de la base de datos (default: securepass): " MONGO_DB
MONGO_DB=${MONGO_DB:-securepass}

read -p "Dominio de tu aplicación (ej: tudominio.com): " DOMAIN_NAME
while [ -z "$DOMAIN_NAME" ]; do
    echo -e "${RED}❌ El dominio es obligatorio${NC}"
    read -p "Dominio de tu aplicación: " DOMAIN_NAME
done

read -p "Tu repositorio de GitHub (ej: usuario/repo): " GITHUB_REPO
while [ -z "$GITHUB_REPO" ]; do
    echo -e "${RED}❌ El repositorio es obligatorio${NC}"
    read -p "Tu repositorio de GitHub: " GITHUB_REPO
done

echo ""
read -sp "JWT Secret (presiona Enter para generar uno automáticamente): " JWT_SECRET
echo ""

if [ -z "$JWT_SECRET" ]; then
    # Generar JWT secret automáticamente
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    echo -e "${GREEN}✅ JWT Secret generado automáticamente${NC}"
fi

# Crear archivo .env.production
echo ""
echo "📝 Creando archivo .env.production..."

cat > .env.production << EOF
# ============================================
# MongoDB Configuration
# ============================================
MONGO_ROOT_USER=$MONGO_USER
MONGO_ROOT_PASSWORD=$MONGO_PASS
MONGO_DB_NAME=$MONGO_DB
MONGODB_PORT=27017

# ============================================
# API Configuration
# ============================================
API_PORT=8000
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# ============================================
# Frontend Configuration
# ============================================
WEB_PORT=3000
REACT_APP_API=https://api.$DOMAIN_NAME
FRONTEND_URL=https://$DOMAIN_NAME

# ============================================
# Nginx Configuration
# ============================================
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# ============================================
# GitHub Container Registry
# ============================================
GITHUB_REPOSITORY=$GITHUB_REPO

# ============================================
# Cloudinary Configuration (opcional - configurar después)
# ============================================
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ============================================
# Email Configuration (opcional - configurar después)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=SecurePass <noreply@securepass.com>
EMAIL_SENDER=SecurePass
EMAIL_REPLY=support@securepass.com

# ============================================
# Payment Providers (opcional - configurar después)
# ============================================
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
EOF

# Proteger el archivo .env
chmod 600 .env.production
chown $SUDO_USER:$SUDO_USER .env.production 2>/dev/null || true

echo -e "${GREEN}✅ Archivo .env.production creado${NC}"

echo ""
echo "🔒 Paso 4: Configurando permisos de seguridad..."

# Configurar permisos del directorio
chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR 2>/dev/null || true
chmod 755 $PROJECT_DIR

# Permisos especiales para archivos sensibles
chmod 600 .env.production

echo -e "${GREEN}✅ Permisos configurados${NC}"

echo ""
echo "📋 Paso 5: Creando archivo .gitignore de seguridad..."

cat > .gitignore << 'EOF'
# Nunca subir estos archivos
.env
.env.*
!.env.example
*.pem
*.key
*.crt
backups/
*.backup
*.sql
*.dump
EOF

echo -e "${GREEN}✅ .gitignore creado${NC}"

echo ""
echo "🔥 Paso 6: Configurando firewall..."

if command -v ufw &> /dev/null; then
    echo "Configurando UFW firewall..."

    # Permitir SSH
    ufw allow 22/tcp

    # Permitir HTTP y HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp

    # Habilitar firewall
    echo "y" | ufw enable

    echo -e "${GREEN}✅ Firewall configurado${NC}"
    echo "Puertos abiertos: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
else
    echo -e "${YELLOW}⚠️  UFW no está instalado. Configura tu firewall manualmente.${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo "=========================================="
echo ""
echo "📋 Resumen:"
echo "  - Directorio: $PROJECT_DIR"
echo "  - Base de datos: $MONGO_DB"
echo "  - Dominio: $DOMAIN_NAME"
echo "  - Archivo de configuración: .env.production"
echo ""
echo "🔐 Información de seguridad guardada:"
echo "  - Usuario MongoDB: $MONGO_USER"
echo "  - Contraseña guardada en .env.production (permisos 600)"
echo ""
echo "📝 Siguientes pasos:"
echo ""
echo "1. Copia docker-compose.production.yml a este servidor:"
echo "   scp docker-compose.production.yml usuario@servidor:$PROJECT_DIR/"
echo ""
echo "2. Copia la configuración de nginx:"
echo "   scp -r nginx/* usuario@servidor:$PROJECT_DIR/nginx/"
echo ""
echo "3. Configura GitHub Secrets en tu repositorio con estos valores:"
echo "   - SERVER_HOST: [IP de este servidor]"
echo "   - SERVER_USER: $SUDO_USER"
echo "   - DEPLOY_PATH: $PROJECT_DIR"
echo "   - DOMAIN_NAME: $DOMAIN_NAME"
echo "   - Copia el contenido de .env.production a los secrets correspondientes"
echo ""
echo "4. Configura SSL con Let's Encrypt:"
echo "   sudo certbot --nginx -d $DOMAIN_NAME -d api.$DOMAIN_NAME"
echo ""
echo "5. Inicia la aplicación:"
echo "   cd $PROJECT_DIR"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "⚠️  IMPORTANTE: Guarda las credenciales en un lugar seguro (gestor de contraseñas)"
echo ""
