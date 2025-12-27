#!/bin/bash

##############################################################################
# Script de Construcción Automática de Imágenes Docker
#
# Este script construye todas las imágenes Docker del proyecto SecurePass
# de forma automática con un solo comando.
#
# Uso:
#   ./scripts/build-images.sh [opciones]
#
# Opciones:
#   --local          Construir solo imágenes locales (por defecto)
#   --production     Construir y etiquetar para producción (ghcr.io)
#   --push           Subir imágenes al registro (requiere --production)
#   --no-cache       Construir sin usar caché
#   --tag VERSION    Especificar tag de versión (por defecto: latest)
#   --help           Mostrar esta ayuda
#
# Ejemplos:
#   ./scripts/build-images.sh
#   ./scripts/build-images.sh --production --tag v1.0.0
#   ./scripts/build-images.sh --production --push
#   ./scripts/build-images.sh --no-cache
##############################################################################

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables por defecto
BUILD_MODE="local"
PUSH_IMAGES=false
NO_CACHE=""
TAG="latest"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-rvelez140/segurepas-prueba}"

# Directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

##############################################################################
# Funciones auxiliares
##############################################################################

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_help() {
    cat << EOF
Script de Construcción Automática de Imágenes Docker

Uso: $0 [opciones]

Opciones:
    --local          Construir solo imágenes locales (por defecto)
    --production     Construir y etiquetar para producción (ghcr.io)
    --push           Subir imágenes al registro (requiere --production)
    --no-cache       Construir sin usar caché
    --tag VERSION    Especificar tag de versión (por defecto: latest)
    --help           Mostrar esta ayuda

Ejemplos:
    # Construcción local básica
    $0

    # Construcción para producción con tag específico
    $0 --production --tag v1.0.0

    # Construcción y subida a registro
    $0 --production --push

    # Construcción sin caché
    $0 --no-cache

EOF
}

build_api_image() {
    local image_name=$1
    print_header "Construyendo imagen de API"

    print_info "Contexto: $PROJECT_ROOT/apps/api"
    print_info "Imagen: $image_name"

    docker build $NO_CACHE \
        -t "$image_name" \
        -f "$PROJECT_ROOT/apps/api/Dockerfile" \
        "$PROJECT_ROOT/apps/api"

    print_success "Imagen de API construida: $image_name"
}

build_web_image() {
    local image_name=$1
    print_header "Construyendo imagen de Web"

    print_info "Contexto: $PROJECT_ROOT/apps/web"
    print_info "Imagen: $image_name"

    docker build $NO_CACHE \
        -t "$image_name" \
        -f "$PROJECT_ROOT/apps/web/Dockerfile" \
        "$PROJECT_ROOT/apps/web"

    print_success "Imagen de Web construida: $image_name"
}

tag_for_production() {
    local local_image=$1
    local prod_image=$2

    print_info "Etiquetando $local_image -> $prod_image"
    docker tag "$local_image" "$prod_image"
    print_success "Imagen etiquetada para producción"
}

push_image() {
    local image_name=$1

    print_info "Subiendo imagen: $image_name"
    docker push "$image_name"
    print_success "Imagen subida exitosamente"
}

##############################################################################
# Parsear argumentos
##############################################################################

while [[ $# -gt 0 ]]; do
    case $1 in
        --local)
            BUILD_MODE="local"
            shift
            ;;
        --production)
            BUILD_MODE="production"
            shift
            ;;
        --push)
            PUSH_IMAGES=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

##############################################################################
# Validaciones
##############################################################################

if [ "$PUSH_IMAGES" = true ] && [ "$BUILD_MODE" != "production" ]; then
    print_error "La opción --push requiere --production"
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

# Verificar que Docker está corriendo
if ! docker info &> /dev/null; then
    print_error "Docker no está corriendo"
    exit 1
fi

##############################################################################
# Inicio del proceso de construcción
##############################################################################

print_header "Construcción de Imágenes Docker - SecurePass"
echo ""
print_info "Modo: $BUILD_MODE"
print_info "Tag: $TAG"
print_info "No cache: $([ -n "$NO_CACHE" ] && echo "Sí" || echo "No")"
print_info "Push: $([ "$PUSH_IMAGES" = true ] && echo "Sí" || echo "No")"
echo ""

# Cambiar al directorio del proyecto
cd "$PROJECT_ROOT"

##############################################################################
# Construcción de imágenes
##############################################################################

if [ "$BUILD_MODE" = "local" ]; then
    # Construcción local
    build_api_image "securepass-api:$TAG"
    build_web_image "securepass-web:$TAG"

    # Etiquetar como latest si no es latest
    if [ "$TAG" != "latest" ]; then
        docker tag "securepass-api:$TAG" "securepass-api:latest"
        docker tag "securepass-web:$TAG" "securepass-web:latest"
        print_success "Imágenes también etiquetadas como :latest"
    fi

elif [ "$BUILD_MODE" = "production" ]; then
    # Construcción para producción
    API_LOCAL="securepass-api:$TAG"
    WEB_LOCAL="securepass-web:$TAG"

    API_PROD="ghcr.io/$GITHUB_REPOSITORY/api:$TAG"
    WEB_PROD="ghcr.io/$GITHUB_REPOSITORY/web:$TAG"

    # Construir imágenes locales
    build_api_image "$API_LOCAL"
    build_web_image "$WEB_LOCAL"

    # Etiquetar para producción
    tag_for_production "$API_LOCAL" "$API_PROD"
    tag_for_production "$WEB_LOCAL" "$WEB_PROD"

    # También etiquetar como latest
    if [ "$TAG" != "latest" ]; then
        API_PROD_LATEST="ghcr.io/$GITHUB_REPOSITORY/api:latest"
        WEB_PROD_LATEST="ghcr.io/$GITHUB_REPOSITORY/web:latest"

        tag_for_production "$API_LOCAL" "$API_PROD_LATEST"
        tag_for_production "$WEB_LOCAL" "$WEB_PROD_LATEST"
    fi

    # Subir imágenes si se especificó --push
    if [ "$PUSH_IMAGES" = true ]; then
        print_header "Subiendo imágenes al registro"

        # Verificar autenticación
        print_info "Verificando autenticación con GitHub Container Registry..."
        if ! docker pull "ghcr.io/$GITHUB_REPOSITORY/api:latest" 2>/dev/null && \
           ! echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin 2>/dev/null; then
            print_warning "Asegúrate de estar autenticado con: docker login ghcr.io"
            print_info "O configura GITHUB_TOKEN y GITHUB_USER"
        fi

        push_image "$API_PROD"
        push_image "$WEB_PROD"

        if [ "$TAG" != "latest" ]; then
            push_image "$API_PROD_LATEST"
            push_image "$WEB_PROD_LATEST"
        fi
    fi
fi

##############################################################################
# Resumen final
##############################################################################

print_header "Construcción Completada"
echo ""
print_success "Todas las imágenes han sido construidas exitosamente"
echo ""
print_info "Imágenes disponibles:"

if [ "$BUILD_MODE" = "local" ]; then
    echo "  - securepass-api:$TAG"
    echo "  - securepass-web:$TAG"
    if [ "$TAG" != "latest" ]; then
        echo "  - securepass-api:latest"
        echo "  - securepass-web:latest"
    fi
else
    echo "  - ghcr.io/$GITHUB_REPOSITORY/api:$TAG"
    echo "  - ghcr.io/$GITHUB_REPOSITORY/web:$TAG"
    if [ "$TAG" != "latest" ]; then
        echo "  - ghcr.io/$GITHUB_REPOSITORY/api:latest"
        echo "  - ghcr.io/$GITHUB_REPOSITORY/web:latest"
    fi
fi

echo ""
print_info "Próximos pasos:"
if [ "$BUILD_MODE" = "local" ]; then
    echo "  - Ejecutar: docker-compose -f docker-compose.local.yml up -d"
else
    if [ "$PUSH_IMAGES" = false ]; then
        echo "  - Subir imágenes: $0 --production --push"
    fi
    echo "  - Ejecutar: docker-compose -f docker-compose.production.yml up -d"
fi

echo ""
print_success "¡Listo! 🚀"
