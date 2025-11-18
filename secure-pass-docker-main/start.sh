#!/bin/bash

# ==============================================
# SecurePass - Script de Inicio Rápido
# ==============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat << "EOF"
   _____                          ____
  / ___/___  _______  __________  / __ \____ ___________
  \__ \/ _ \/ ___/ / / / ___/ _ \/ /_/ / __ `/ ___/ ___/
 ___/ /  __/ /__/ /_/ / /  /  __/ ____/ /_/ (__  |__  )
/____/\___/\___/\__,_/_/   \___/_/    \__,_/____/____/

    Sistema Multi-Tenant de Control de Acceso
EOF
echo -e "${NC}"

# Función para mostrar mensajes
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que Docker está instalado
info "Verificando requisitos..."

if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instalar Docker primero."
    echo "  Visita: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado."
    echo "  Visita: https://docs.docker.com/compose/install/"
    exit 1
fi

success "Docker y Docker Compose instalados"

# Verificar que Docker está corriendo
if ! docker info &> /dev/null; then
    error "Docker no está corriendo. Por favor iniciar Docker primero."
    exit 1
fi

success "Docker está corriendo"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    warning "Archivo .env no encontrado. Creando desde .env.example..."

    if [ -f .env.example ]; then
        cp .env.example .env
        success "Archivo .env creado"

        echo ""
        warning "IMPORTANTE: Debes configurar las siguientes variables en .env:"
        echo "  - CLOUDINARY_CLOUD_NAME"
        echo "  - CLOUDINARY_API_KEY"
        echo "  - CLOUDINARY_API_SECRET"
        echo "  - EMAIL_USER"
        echo "  - EMAIL_PASSWORD"
        echo ""

        read -p "¿Deseas configurar estas variables ahora? (s/n): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Ss]$ ]]; then
            info "Abriendo .env para editar..."
            ${EDITOR:-nano} .env
        else
            warning "Recuerda configurar .env antes de usar funcionalidades de imágenes y email"
        fi
    else
        error "No se encontró .env.example"
        exit 1
    fi
else
    success "Archivo .env encontrado"
fi

echo ""
info "Iniciando SecurePass..."
echo ""

# Preguntar el modo
echo "Selecciona el modo de ejecución:"
echo "  1) Desarrollo (con hot-reload)"
echo "  2) Producción (optimizado)"
echo ""
read -p "Opción [1]: " MODE
MODE=${MODE:-1}

if [ "$MODE" == "2" ]; then
    export NODE_ENV=production
    export BUILD_TARGET=production
    info "Modo: PRODUCCIÓN"

    # Build de imágenes
    info "Construyendo imágenes de producción..."
    docker-compose build --no-cache

    # Iniciar en background
    info "Iniciando servicios en segundo plano..."
    docker-compose up -d

    echo ""
    success "SecurePass iniciado en modo producción"
    echo ""
    info "Para ver logs: docker-compose logs -f"
    info "Para detener: docker-compose down"

else
    export NODE_ENV=development
    export BUILD_TARGET=development
    info "Modo: DESARROLLO"

    # Iniciar en foreground
    info "Iniciando servicios (Ctrl+C para detener)..."
    echo ""
    docker-compose up
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "SecurePass está corriendo!"
echo ""
echo "  📱 Frontend:  http://localhost:3000"
echo "  🔌 API:       http://localhost:8000"
echo "  🗄️  MongoDB:   localhost:27017"
echo ""
echo "  📚 Documentación: README-MULTITENANT.md"
echo "  🆘 Ayuda:         ./help.sh o make help"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
