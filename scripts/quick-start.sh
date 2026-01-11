#!/bin/bash

#===============================================================================
# SecurePass - Script de Inicio Rapido
#===============================================================================
# ISO 27001 - A.12.1.1: Procedimientos de operacion documentados
#
# Este script configura e inicia SecurePass con las credenciales de fabrica.
# Uso: ./scripts/quick-start.sh
#===============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║              SecurePass - Inicio Rapido                      ║${NC}"
echo -e "${BLUE}║              ISO 27001 Compliant Setup                       ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar Docker
echo -e "${YELLOW}[1/6] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker no esta instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose no esta instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker esta disponible${NC}"

# Ir al directorio raiz del proyecto
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)
echo -e "${GREEN}✓ Directorio del proyecto: $PROJECT_ROOT${NC}"

# Copiar archivo de configuracion de fabrica si no existe .env
echo -e "${YELLOW}[2/6] Configurando variables de entorno...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.factory" ]; then
        cp .env.factory .env
        echo -e "${GREEN}✓ Archivo .env creado desde .env.factory${NC}"
    else
        echo -e "${RED}Error: No se encontro .env.factory${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}! Archivo .env ya existe, usando configuracion existente${NC}"
fi

# Crear directorios necesarios
echo -e "${YELLOW}[3/6] Creando directorios necesarios...${NC}"
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p scripts/mongo-init
echo -e "${GREEN}✓ Directorios creados${NC}"

# Generar certificados SSL autofirmados si no existen
echo -e "${YELLOW}[4/6] Verificando certificados SSL...${NC}"
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo "Generando certificados SSL autofirmados para desarrollo..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/privkey.pem \
        -out nginx/ssl/fullchain.pem \
        -subj "/C=US/ST=State/L=City/O=SecurePass/CN=localhost" \
        2>/dev/null
    echo -e "${GREEN}✓ Certificados SSL generados${NC}"
else
    echo -e "${GREEN}✓ Certificados SSL existentes${NC}"
fi

# Construir e iniciar contenedores
echo -e "${YELLOW}[5/6] Construyendo e iniciando contenedores Docker...${NC}"
echo "(Esto puede tomar varios minutos la primera vez)"
echo ""

# Usar docker compose o docker-compose segun disponibilidad
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD down 2>/dev/null || true
$COMPOSE_CMD up -d --build

# Esperar a que los servicios esten listos
echo ""
echo -e "${YELLOW}[6/6] Esperando que los servicios esten listos...${NC}"
echo "Verificando estado de los servicios..."

MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    # Verificar API
    if curl -s http://localhost:48721/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API esta lista${NC}"
        break
    fi

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}Timeout esperando que los servicios inicien${NC}"
        echo "Revise los logs con: docker-compose logs"
        exit 1
    fi

    echo -n "."
    sleep 2
done

# Mostrar credenciales de fabrica
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              SecurePass Iniciado Exitosamente                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                CREDENCIALES DE ACCESO                        ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Email:     factory@securepass.local                         ║${NC}"
echo -e "${BLUE}║  Usuario:   factory_admin                                    ║${NC}"
echo -e "${BLUE}║  Password:  Factory@SecureP@ss2024!                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  URLS DE ACCESO:                                             ║${NC}"
echo -e "${YELLOW}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${YELLOW}║  Web App:     http://localhost:52341                         ║${NC}"
echo -e "${YELLOW}║  API:         http://localhost:48721                         ║${NC}"
echo -e "${YELLOW}║  API Health:  http://localhost:48721/health                  ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  ⚠️  ADVERTENCIA DE SEGURIDAD ISO 27001                       ║${NC}"
echo -e "${RED}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${RED}║  Cambie las credenciales de fabrica inmediatamente           ║${NC}"
echo -e "${RED}║  despues del primer inicio de sesion.                        ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Para ver los logs: $COMPOSE_CMD logs -f"
echo "Para detener: $COMPOSE_CMD down"
echo ""
