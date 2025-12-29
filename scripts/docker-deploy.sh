#!/bin/bash

# =============================================================================
# SecurePass - Script de Despliegue Docker
# =============================================================================
#
# Uso:
#   ./scripts/docker-deploy.sh [command]
#
# Comandos:
#   start     - Inicia todos los servicios (por defecto)
#   stop      - Detiene todos los servicios
#   restart   - Reinicia todos los servicios
#   rebuild   - Reconstruye y reinicia las imagenes
#   logs      - Muestra los logs en tiempo real
#   status    - Muestra el estado de los contenedores
#   clean     - Elimina contenedores, imagenes y volumenes
#   admin     - Crea/actualiza el usuario administrador
#
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Archivo docker-compose a usar
COMPOSE_FILE="docker-compose.local.yml"

# Verificar si existe archivo .env
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Advertencia: No se encontro archivo .env${NC}"
        echo -e "${BLUE}Copiando .env.example a .env...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}Por favor, edite el archivo .env con sus configuraciones${NC}"
    fi
}

# Funcion para mostrar el banner
show_banner() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "     SecurePass - Docker Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

# Iniciar servicios
start_services() {
    echo -e "${GREEN}Iniciando servicios...${NC}"
    docker compose -f "$COMPOSE_FILE" up -d
    echo -e "${GREEN}Servicios iniciados correctamente${NC}"
    show_urls
}

# Detener servicios
stop_services() {
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    docker compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}Servicios detenidos${NC}"
}

# Reiniciar servicios
restart_services() {
    echo -e "${YELLOW}Reiniciando servicios...${NC}"
    docker compose -f "$COMPOSE_FILE" restart
    echo -e "${GREEN}Servicios reiniciados${NC}"
}

# Reconstruir imagenes
rebuild_services() {
    echo -e "${YELLOW}Reconstruyendo imagenes...${NC}"
    docker compose -f "$COMPOSE_FILE" down
    docker compose -f "$COMPOSE_FILE" build --no-cache
    docker compose -f "$COMPOSE_FILE" up -d
    echo -e "${GREEN}Imagenes reconstruidas y servicios iniciados${NC}"
    show_urls
}

# Mostrar logs
show_logs() {
    echo -e "${BLUE}Mostrando logs (Ctrl+C para salir)...${NC}"
    docker compose -f "$COMPOSE_FILE" logs -f
}

# Mostrar estado
show_status() {
    echo -e "${BLUE}Estado de los contenedores:${NC}"
    docker compose -f "$COMPOSE_FILE" ps
}

# Limpiar todo
clean_all() {
    echo -e "${RED}ADVERTENCIA: Esto eliminara todos los contenedores, imagenes y volumenes de SecurePass${NC}"
    read -p "Esta seguro? (si/no): " confirm
    if [ "$confirm" = "si" ] || [ "$confirm" = "s" ]; then
        echo -e "${YELLOW}Limpiando...${NC}"
        docker compose -f "$COMPOSE_FILE" down -v --rmi all
        echo -e "${GREEN}Limpieza completada${NC}"
    else
        echo -e "${BLUE}Operacion cancelada${NC}"
    fi
}

# Crear usuario admin
create_admin() {
    echo -e "${BLUE}Creando/actualizando usuario administrador...${NC}"

    # Verificar que el contenedor API este corriendo
    if ! docker compose -f "$COMPOSE_FILE" ps api | grep -q "Up"; then
        echo -e "${YELLOW}El contenedor API no esta corriendo. Iniciando...${NC}"
        docker compose -f "$COMPOSE_FILE" up -d api mongodb
        sleep 10
    fi

    # Ejecutar script de creacion de admin
    docker compose -f "$COMPOSE_FILE" exec -T api node scripts/create-admin.js <<< "si"

    echo -e "${GREEN}Usuario administrador configurado${NC}"
    echo -e "${BLUE}Credenciales:${NC}"
    echo -e "  Email:    ${ADMIN_EMAIL:-admin@solucionesrv.net}"
    echo -e "  Username: ${ADMIN_USERNAME:-admin}"
    echo -e "  Password: ${ADMIN_PASSWORD:-Admin12345!}"
}

# Mostrar URLs de acceso
show_urls() {
    echo ""
    echo -e "${GREEN}==============================================${NC}"
    echo -e "${GREEN}  SecurePass esta listo!${NC}"
    echo -e "${GREEN}==============================================${NC}"
    echo ""
    echo -e "${BLUE}URLs de acceso:${NC}"
    echo -e "  Web:     http://localhost:${NGINX_HTTP_PORT:-8472}"
    echo -e "  API:     http://localhost:${NGINX_HTTP_PORT:-8472}/api"
    echo -e "  Swagger: http://localhost:${API_PORT:-48721}/api-docs"
    echo ""
    echo -e "${BLUE}Credenciales de administrador:${NC}"
    echo -e "  Email:    ${ADMIN_EMAIL:-admin@solucionesrv.net}"
    echo -e "  Username: ${ADMIN_USERNAME:-admin}"
    echo -e "  Password: ${ADMIN_PASSWORD:-Admin12345!}"
    echo ""
    echo -e "${YELLOW}Nota: Puede iniciar sesion con email O username${NC}"
    echo ""
}

# Mostrar ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start    - Inicia todos los servicios (por defecto)"
    echo "  stop     - Detiene todos los servicios"
    echo "  restart  - Reinicia todos los servicios"
    echo "  rebuild  - Reconstruye y reinicia las imagenes"
    echo "  logs     - Muestra los logs en tiempo real"
    echo "  status   - Muestra el estado de los contenedores"
    echo "  clean    - Elimina contenedores, imagenes y volumenes"
    echo "  admin    - Crea/actualiza el usuario administrador"
    echo "  help     - Muestra esta ayuda"
}

# Main
show_banner
check_env

# Cargar variables de entorno
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

case "${1:-start}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    rebuild)
        rebuild_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    admin)
        create_admin
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando desconocido: $1${NC}"
        show_help
        exit 1
        ;;
esac
