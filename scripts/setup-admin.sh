#!/bin/bash

###############################################################################
# Script para configurar usuario administrador en SecurePass
#
# Este script ayuda a crear un usuario admin en el sistema SecurePass
# copiando y ejecutando el script dentro del contenedor Docker
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
CONTAINER_NAME="securepass-api"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CREATE_ADMIN_SCRIPT="$SCRIPT_DIR/create-admin.js"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SecurePass - Configuración Administrador ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Verificar que el contenedor esté corriendo
echo -e "${YELLOW}[1/4]${NC} Verificando contenedor Docker..."
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: El contenedor '${CONTAINER_NAME}' no está corriendo${NC}"
    echo -e "${YELLOW}   Sugerencia: Ejecuta 'docker-compose up -d' primero${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Contenedor encontrado y corriendo${NC}\n"

# Verificar que existe el script
echo -e "${YELLOW}[2/4]${NC} Verificando script create-admin.js..."
if [ ! -f "$CREATE_ADMIN_SCRIPT" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo create-admin.js${NC}"
    echo -e "${YELLOW}   Ruta esperada: ${CREATE_ADMIN_SCRIPT}${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Script encontrado${NC}\n"

# Copiar script al contenedor
echo -e "${YELLOW}[3/4]${NC} Copiando script al contenedor..."
docker cp "$CREATE_ADMIN_SCRIPT" "${CONTAINER_NAME}:/app/create-admin.js"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Script copiado exitosamente${NC}\n"
else
    echo -e "${RED}❌ Error al copiar el script${NC}"
    exit 1
fi

# Ejecutar script dentro del contenedor
echo -e "${YELLOW}[4/4]${NC} Ejecutando script en el contenedor...\n"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Pasar variables de entorno si están definidas
ENV_VARS=""
if [ ! -z "$ADMIN_EMAIL" ]; then
    ENV_VARS="$ENV_VARS -e ADMIN_EMAIL=$ADMIN_EMAIL"
fi
if [ ! -z "$ADMIN_PASSWORD" ]; then
    ENV_VARS="$ENV_VARS -e ADMIN_PASSWORD=$ADMIN_PASSWORD"
fi
if [ ! -z "$ADMIN_NAME" ]; then
    ENV_VARS="$ENV_VARS -e ADMIN_NAME=$ADMIN_NAME"
fi

docker exec -it $ENV_VARS "${CONTAINER_NAME}" node /app/create-admin.js

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Limpiar (opcional: eliminar el script del contenedor)
echo -e "${YELLOW}Limpiando archivos temporales...${NC}"
docker exec "${CONTAINER_NAME}" rm -f /app/create-admin.js
echo -e "${GREEN}✓ Proceso completado${NC}\n"

echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ¡Configuración completada exitosamente!  ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}\n"
