#!/bin/bash

###############################################################################
# Script para generar archivo .env con valores seguros
#
# Este script ayuda a crear un archivo .env con contraseñas y secrets seguros
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║  SecurePass - Generador de archivo .env   ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env"
ENV_EXAMPLE=".env.production.example"

# Verificar si ya existe .env
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un archivo .env${NC}"
    read -p "¿Deseas sobrescribirlo? (si/no): " OVERWRITE
    if [ "$OVERWRITE" != "si" ] && [ "$OVERWRITE" != "s" ]; then
        echo -e "${RED}Operación cancelada${NC}"
        exit 0
    fi
    mv "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓ Backup creado${NC}\n"
fi

# Verificar que existe el ejemplo
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo -e "${RED}❌ No se encuentra $ENV_EXAMPLE${NC}"
    exit 1
fi

echo -e "${CYAN}Generando valores seguros...${NC}\n"

# Generar valores aleatorios
MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -hex 64)

echo -e "${GREEN}✓ Contraseñas generadas${NC}"

# Solicitar IP del servidor
echo ""
read -p "Ingresa la IP de tu servidor VPS (o presiona Enter para localhost): " SERVER_IP
SERVER_IP=${SERVER_IP:-localhost}

# Solicitar email para notificaciones (opcional)
echo ""
read -p "Ingresa tu email para notificaciones (opcional, presiona Enter para omitir): " EMAIL_USER

# Copiar ejemplo a .env
cp "$ENV_EXAMPLE" "$ENV_FILE"

# Reemplazar valores
sed -i "s/MONGO_ROOT_PASSWORD=.*/MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}/" "$ENV_FILE"
sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" "$ENV_FILE"
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://${SERVER_IP}:8472/api|" "$ENV_FILE"
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${SERVER_IP}:8472|" "$ENV_FILE"

if [ ! -z "$EMAIL_USER" ]; then
    sed -i "s/EMAIL_USER=.*/EMAIL_USER=${EMAIL_USER}/" "$ENV_FILE"
fi

# Proteger el archivo
chmod 600 "$ENV_FILE"

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Archivo .env creado exitosamente${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}\n"

echo -e "${CYAN}📋 Valores generados:${NC}"
echo -e "${YELLOW}MONGO_ROOT_PASSWORD:${NC} ${MONGO_PASSWORD}"
echo -e "${YELLOW}JWT_SECRET:${NC} ${JWT_SECRET}"
echo -e "${YELLOW}SERVER_IP:${NC} ${SERVER_IP}"
echo ""

echo -e "${BLUE}📝 Pasos siguientes:${NC}"
echo "1. Revisa y edita el archivo .env si necesitas ajustar alguna configuración"
echo "2. Completa las credenciales de Cloudinary (si vas a usar uploads de imágenes)"
echo "3. Completa las credenciales de Email (si vas a usar notificaciones)"
echo "4. Ejecuta: ./scripts/aapanel-deploy.sh"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "- El archivo .env contiene información sensible"
echo "- NUNCA lo subas a git (ya está en .gitignore)"
echo "- Guarda una copia segura de las contraseñas generadas"
echo ""

# Preguntar si quiere ver el archivo
read -p "¿Deseas ver el contenido del archivo .env ahora? (si/no): " SHOW_FILE
if [ "$SHOW_FILE" = "si" ] || [ "$SHOW_FILE" = "s" ]; then
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cat "$ENV_FILE"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo -e "${GREEN}✓ Configuración completada${NC}"
