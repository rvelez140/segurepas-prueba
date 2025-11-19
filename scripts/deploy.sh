#!/bin/bash

#######################################
# Script de Deployment para SecurePass
# Uso: ./deploy.sh [environment]
# environment: production (default) o staging
#######################################

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SecurePass Deployment Script${NC}"
echo -e "${GREEN}  Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar que existe el archivo docker-compose
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: $COMPOSE_FILE no encontrado${NC}"
    echo "Usando docker-compose.yml por defecto"
    COMPOSE_FILE="docker-compose.yml"
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Advertencia: .env no encontrado${NC}"
    echo "Creando .env desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Por favor, configura las variables en .env antes de continuar${NC}"
        exit 1
    else
        echo -e "${RED}Error: .env.example tampoco existe${NC}"
        exit 1
    fi
fi

# Función para hacer backup de la base de datos
backup_database() {
    echo -e "${YELLOW}Creando backup de la base de datos...${NC}"
    mkdir -p "$BACKUP_DIR"

    # Obtener credenciales del .env
    source .env

    # Hacer backup con docker
    docker-compose -f "$COMPOSE_FILE" exec -T mongodb mongodump \
        --username="$MONGO_ROOT_USER" \
        --password="$MONGO_ROOT_PASSWORD" \
        --authenticationDatabase=admin \
        --out=/tmp/backup_$TIMESTAMP

    # Copiar backup al host
    docker cp securepass-mongodb:/tmp/backup_$TIMESTAMP "$BACKUP_DIR/backup_$TIMESTAMP"

    echo -e "${GREEN}✓ Backup creado: $BACKUP_DIR/backup_$TIMESTAMP${NC}"
}

# Función para pull de las últimas imágenes
pull_images() {
    echo -e "${YELLOW}Descargando últimas imágenes...${NC}"
    docker-compose -f "$COMPOSE_FILE" pull
    echo -e "${GREEN}✓ Imágenes actualizadas${NC}"
}

# Función para detener servicios
stop_services() {
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✓ Servicios detenidos${NC}"
}

# Función para iniciar servicios
start_services() {
    echo -e "${YELLOW}Iniciando servicios...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d
    echo -e "${GREEN}✓ Servicios iniciados${NC}"
}

# Función para verificar salud de servicios
check_health() {
    echo -e "${YELLOW}Verificando salud de los servicios...${NC}"
    sleep 10  # Esperar un poco para que los servicios inicien

    # Verificar API
    for i in {1..30}; do
        if docker-compose -f "$COMPOSE_FILE" exec -T api wget --spider -q http://localhost:8000/health 2>/dev/null; then
            echo -e "${GREEN}✓ API está saludable${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}✗ API no responde después de 30 intentos${NC}"
            return 1
        fi
        echo "Esperando API... intento $i/30"
        sleep 2
    done

    # Mostrar estado de contenedores
    echo -e "\n${YELLOW}Estado de contenedores:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Función para limpiar recursos antiguos
cleanup() {
    echo -e "${YELLOW}Limpiando recursos antiguos...${NC}"
    docker image prune -af
    docker volume prune -f
    echo -e "${GREEN}✓ Limpieza completada${NC}"
}

# Función para mostrar logs
show_logs() {
    echo -e "\n${YELLOW}Últimos logs de la aplicación:${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
}

# Main deployment flow
main() {
    echo "1. Iniciando proceso de deployment..."

    # Hacer backup si es producción
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "2. Creando backup..."
        backup_database || echo -e "${YELLOW}Advertencia: No se pudo crear backup${NC}"
    fi

    echo "3. Descargando nuevas imágenes..."
    pull_images

    echo "4. Deteniendo servicios actuales..."
    stop_services

    echo "5. Iniciando nuevos servicios..."
    start_services

    echo "6. Verificando salud..."
    if check_health; then
        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}  ✓ Deployment completado exitosamente${NC}"
        echo -e "${GREEN}========================================${NC}"

        # Mostrar URLs
        source .env
        echo -e "\n${GREEN}Aplicación disponible en:${NC}"
        echo -e "  Web: http://localhost:${WEB_PORT:-3000}"
        echo -e "  API: http://localhost:${API_PORT:-8000}"
    else
        echo -e "\n${RED}========================================${NC}"
        echo -e "${RED}  ✗ Deployment falló${NC}"
        echo -e "${RED}========================================${NC}"
        show_logs
        exit 1
    fi

    # Limpiar recursos antiguos
    echo -e "\n7. Limpiando recursos antiguos..."
    cleanup

    # Mantener solo los últimos 5 backups
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "\n8. Limpiando backups antiguos..."
        ls -t "$BACKUP_DIR" | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}"
    fi
}

# Ejecutar deployment
main

# Preguntar si desea ver logs en vivo
echo -e "\n${YELLOW}¿Deseas ver los logs en vivo? (y/n)${NC}"
read -t 10 -n 1 answer || answer="n"
if [ "$answer" = "y" ]; then
    echo -e "\n${GREEN}Mostrando logs (Ctrl+C para salir)...${NC}"
    docker-compose -f "$COMPOSE_FILE" logs -f
fi
