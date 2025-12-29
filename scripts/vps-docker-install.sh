#!/bin/bash

#######################################
# Script de Instalación Docker en VPS con SSH
# Instalación completa para SecurePass usando Docker
# Uso: bash vps-docker-install.sh
#######################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SecurePass - Instalación Docker VPS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Variables de configuración
DEPLOY_PATH="/opt/securepass"
REPO_URL_SSH="git@github.com:rvelez140/segurepas-prueba.git"
REPO_URL_HTTPS="https://github.com/rvelez140/segurepas-prueba.git"
BRANCH="main"

# Función para mostrar progreso
show_progress() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Función para mostrar éxito
show_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para mostrar advertencia
show_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Función para mostrar error
show_error() {
    echo -e "${RED}✗ $1${NC}"
}

#######################################
# 1. VERIFICAR REQUISITOS
#######################################
show_progress "Verificando requisitos..."

# Verificar Git
if ! command -v git &> /dev/null; then
    show_error "Git no está instalado. Instalando..."
    sudo apt-get update -qq
    sudo apt-get install -y git
fi
show_success "Git instalado: $(git --version)"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    show_error "Docker no está instalado"
    echo -e "${YELLOW}Instala Docker primero con:${NC}"
    echo -e "  curl -fsSL https://get.docker.com | sh"
    exit 1
fi
show_success "Docker instalado: $(docker --version)"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    show_error "Docker Compose no está instalado"
    echo -e "${YELLOW}Instala Docker Compose primero${NC}"
    exit 1
fi
show_success "Docker Compose disponible"

# Verificar permisos de Docker
if ! docker ps &> /dev/null; then
    show_warning "No tienes permisos para usar Docker sin sudo"
    echo -e "${YELLOW}Agregándote al grupo docker...${NC}"
    sudo usermod -aG docker $USER
    show_warning "Necesitas cerrar sesión y volver a entrar para que los cambios surtan efecto"
    echo -e "${YELLOW}O ejecuta: newgrp docker${NC}"
fi

#######################################
# 2. DETERMINAR MÉTODO DE CLONACIÓN
#######################################
show_progress "Verificando acceso SSH a GitHub..."

USE_SSH=false
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    USE_SSH=true
    REPO_URL=$REPO_URL_SSH
    show_success "Clave SSH configurada, usando SSH para clonar"
else
    show_warning "No se detectó clave SSH, usando HTTPS"
    REPO_URL=$REPO_URL_HTTPS
fi

#######################################
# 3. CREAR DIRECTORIO Y CLONAR
#######################################
show_progress "Preparando directorio de instalación..."

# Crear directorio si no existe
if [ ! -d "$DEPLOY_PATH" ]; then
    sudo mkdir -p "$DEPLOY_PATH"
    sudo chown $USER:$USER "$DEPLOY_PATH"
    show_success "Directorio creado: $DEPLOY_PATH"
else
    show_warning "El directorio ya existe: $DEPLOY_PATH"
fi

# Clonar o actualizar repositorio
show_progress "Clonando/actualizando repositorio..."
if [ -d "$DEPLOY_PATH/.git" ]; then
    show_warning "Repositorio ya existe, actualizando..."
    cd "$DEPLOY_PATH"
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
    show_success "Repositorio actualizado"
else
    git clone -b $BRANCH $REPO_URL "$DEPLOY_PATH"
    cd "$DEPLOY_PATH"
    show_success "Repositorio clonado"
fi

#######################################
# 4. CONFIGURAR VARIABLES DE ENTORNO
#######################################
show_progress "Configurando variables de entorno..."

if [ ! -f "$DEPLOY_PATH/.env" ]; then
    if [ -f "$DEPLOY_PATH/.env.production.example" ]; then
        cp "$DEPLOY_PATH/.env.production.example" "$DEPLOY_PATH/.env"
        show_warning "Archivo .env creado desde .env.production.example"
    else
        show_error "No se encontró .env.production.example, usando valores por defecto"
        cat > "$DEPLOY_PATH/.env" <<'EOF'
# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=CHANGE_THIS_PASSWORD
MONGO_DB_NAME=securepass
MONGODB_PORT=37849

# API Configuration
API_PORT=48721
JWT_SECRET=CHANGE_THIS_SECRET_KEY
JWT_EXPIRES_IN=7d

# Web Configuration
WEB_PORT=52341

# Nginx Configuration
NGINX_HTTP_PORT=8472
NGINX_HTTPS_PORT=8473

# URLs (actualiza con tu dominio o IP)
FRONTEND_URL=http://localhost:8472
REACT_APP_API=http://localhost:8472/api

# GitHub Container Registry (para usar imágenes pre-construidas)
GITHUB_REPOSITORY=rvelez140/segurepas-prueba

# Cloudinary (opcional - para subir imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Configuration (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF
    fi

    show_warning "IMPORTANTE: Debes editar $DEPLOY_PATH/.env antes de iniciar"
    echo -e "${YELLOW}Presiona ENTER para editar ahora, o Ctrl+C para hacerlo después${NC}"
    read
    ${EDITOR:-nano} "$DEPLOY_PATH/.env"
else
    show_success "Archivo .env ya existe"
fi

#######################################
# 5. VERIFICAR/CREAR CONFIGURACIÓN NGINX
#######################################
show_progress "Verificando configuración de Nginx..."

NGINX_DIR="$DEPLOY_PATH/nginx"
if [ ! -d "$NGINX_DIR" ]; then
    mkdir -p "$NGINX_DIR/ssl"
    mkdir -p "$NGINX_DIR/logs"
fi

# Usar la configuración de desarrollo si no existe nginx.conf
if [ -f "$NGINX_DIR/nginx.conf.dev" ] && [ ! -f "$NGINX_DIR/nginx.conf.backup" ]; then
    show_warning "Usando configuración de desarrollo de Nginx (sin SSL)..."
    if [ -f "$NGINX_DIR/nginx.conf" ]; then
        cp "$NGINX_DIR/nginx.conf" "$NGINX_DIR/nginx.conf.backup"
    fi
    cp "$NGINX_DIR/nginx.conf.dev" "$NGINX_DIR/nginx.conf"
    show_success "Configuración de Nginx actualizada para desarrollo"
else
    show_success "Configuración de Nginx ya existe"
fi

#######################################
# 6. CONSTRUIR IMÁGENES DOCKER
#######################################
show_progress "Construyendo imágenes Docker..."
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"

cd "$DEPLOY_PATH"

# Opción: usar docker-compose para construir
show_progress "Construyendo con docker-compose..."
docker-compose -f docker-compose.local.yml build

show_success "Imágenes Docker construidas"

#######################################
# 7. INICIAR CONTENEDORES
#######################################
echo ""
echo -e "${YELLOW}¿Deseas iniciar los contenedores ahora? (y/n)${NC}"
read -n 1 start_answer
echo ""

if [ "$start_answer" = "y" ] || [ "$start_answer" = "Y" ]; then
    show_progress "Iniciando contenedores..."
    docker-compose -f docker-compose.local.yml up -d

    show_success "Contenedores iniciados"

    echo ""
    show_progress "Esperando a que los servicios estén listos..."
    sleep 10

    echo ""
    show_progress "Estado de los contenedores:"
    docker-compose -f docker-compose.local.yml ps

    echo ""
    show_success "Para ver los logs en tiempo real:"
    echo -e "  ${BLUE}cd $DEPLOY_PATH${NC}"
    echo -e "  ${BLUE}docker-compose -f docker-compose.local.yml logs -f${NC}"
fi

#######################################
# RESUMEN FINAL
#######################################
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Instalación completada${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Información importante:${NC}"
echo ""
echo -e "${BLUE}Directorio de instalación:${NC}"
echo -e "  $DEPLOY_PATH"
echo ""
echo -e "${BLUE}Archivo de configuración:${NC}"
echo -e "  $DEPLOY_PATH/.env"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo ""
echo -e "  ${GREEN}# Iniciar servicios${NC}"
echo -e "  cd $DEPLOY_PATH"
echo -e "  docker-compose -f docker-compose.local.yml up -d"
echo ""
echo -e "  ${GREEN}# Ver logs${NC}"
echo -e "  docker-compose -f docker-compose.local.yml logs -f"
echo ""
echo -e "  ${GREEN}# Ver estado${NC}"
echo -e "  docker-compose -f docker-compose.local.yml ps"
echo ""
echo -e "  ${GREEN}# Detener servicios${NC}"
echo -e "  docker-compose -f docker-compose.local.yml down"
echo ""
echo -e "  ${GREEN}# Reiniciar servicios${NC}"
echo -e "  docker-compose -f docker-compose.local.yml restart"
echo ""
echo -e "  ${GREEN}# Reconstruir imágenes${NC}"
echo -e "  docker-compose -f docker-compose.local.yml build --no-cache"
echo ""
echo -e "${BLUE}URLs de acceso:${NC}"
echo -e "  ${GREEN}Web:${NC} http://$(hostname -I | awk '{print $1}'):8472"
echo -e "  ${GREEN}API:${NC} http://$(hostname -I | awk '{print $1}'):8472/api"
echo -e "  ${GREEN}Docs API:${NC} http://$(hostname -I | awk '{print $1}'):8472/api/api-docs"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo -e "  1. Verifica que .env tenga los valores correctos"
echo -e "  2. Configura las credenciales de Cloudinary (si usas imágenes)"
echo -e "  3. Configura el email (si usas notificaciones)"
echo -e "  4. Abre los puertos 8472 y 8473 en tu firewall si es necesario"
echo -e "  5. Considera configurar SSL con certbot"
echo ""
echo -e "${GREEN}¡Instalación completada con éxito!${NC}"
echo ""
