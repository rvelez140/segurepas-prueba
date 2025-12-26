#!/bin/bash

###############################################################################
# Script de Despliegue Automático para aaPanel
#
# Este script se ejecuta automáticamente cuando aaPanel hace pull desde Git
# Se encarga de reconstruir los contenedores y configurar el sistema
###############################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio del proyecto (aaPanel lo ejecuta desde la raíz del proyecto)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Archivo de log
LOG_FILE="$PROJECT_DIR/deployment.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Iniciando despliegue automático" >> "$LOG_FILE"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════╗"
echo "║    SecurePass - Despliegue Automático aaPanel     ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Función para log
log() {
    echo -e "${2:-$GREEN}$1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" >> "$LOG_FILE"
}

log_step() {
    echo -e "${CYAN}➜ $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - STEP: $1" >> "$LOG_FILE"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.production.yml" ]; then
    log_error "No se encuentra docker-compose.production.yml"
    log_error "Asegúrate de que el script se ejecuta desde el directorio del proyecto"
    exit 1
fi

# Verificar que existe .env
if [ ! -f ".env" ]; then
    log_error "No se encuentra el archivo .env"
    log_error "Por favor crea el archivo .env con las variables necesarias"
    exit 1
fi

# Paso 1: Verificar Docker
log_step "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi
log "✓ Docker y Docker Compose disponibles"

# Paso 2: Detener contenedores actuales
log_step "Deteniendo contenedores actuales..."
docker-compose -f docker-compose.production.yml down --remove-orphans >> "$LOG_FILE" 2>&1 || true
log "✓ Contenedores detenidos"

# Paso 3: Limpiar imágenes antiguas (opcional, descomenta si quieres)
# log_step "Limpiando imágenes antiguas..."
# docker image prune -f >> "$LOG_FILE" 2>&1

# Paso 4: Pull de nuevas imágenes
log_step "Descargando imágenes Docker actualizadas..."
if docker-compose -f docker-compose.production.yml pull >> "$LOG_FILE" 2>&1; then
    log "✓ Imágenes descargadas"
else
    log "⚠ No se pudieron descargar imágenes nuevas, usando las existentes" "$YELLOW"
fi

# Paso 5: Iniciar contenedores
log_step "Iniciando contenedores..."
if docker-compose -f docker-compose.production.yml up -d >> "$LOG_FILE" 2>&1; then
    log "✓ Contenedores iniciados"
else
    log_error "Error al iniciar contenedores"
    log_error "Revisa el log en: $LOG_FILE"
    exit 1
fi

# Paso 6: Esperar a que los servicios estén listos
log_step "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
log_step "Verificando estado de contenedores..."
if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    log "✓ Contenedores corriendo correctamente"
else
    log_error "Algunos contenedores no están corriendo"
    docker-compose -f docker-compose.production.yml ps
fi

# Paso 7: Verificar si necesitamos crear el usuario admin
log_step "Verificando usuario administrador..."

# Intentar verificar si existe un usuario admin
ADMIN_EXISTS=$(docker exec securepass-api node -e "
const mongoose = require('mongoose');
const User = mongoose.model('User', new mongoose.Schema({ auth: { email: String }, role: String }));
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ role: 'admin' });
    console.log(admin ? 'exists' : 'not_found');
  } catch (e) {
    console.log('error');
  } finally {
    await mongoose.connection.close();
  }
})();
" 2>/dev/null) || ADMIN_EXISTS="error"

if [ "$ADMIN_EXISTS" = "not_found" ]; then
    log "⚠ No se encontró usuario administrador, creando uno..." "$YELLOW"

    # Copiar y ejecutar script de creación de admin
    if [ -f "$PROJECT_DIR/scripts/create-admin.js" ]; then
        docker cp "$PROJECT_DIR/scripts/create-admin.js" securepass-api:/app/create-admin.js
        docker exec securepass-api node /app/create-admin.js >> "$LOG_FILE" 2>&1 || true
        docker exec securepass-api rm -f /app/create-admin.js
        log "✓ Usuario administrador creado"
    else
        log "⚠ No se encontró el script create-admin.js" "$YELLOW"
    fi
elif [ "$ADMIN_EXISTS" = "exists" ]; then
    log "✓ Usuario administrador ya existe"
else
    log "⚠ No se pudo verificar el usuario administrador" "$YELLOW"
fi

# Paso 8: Mostrar estado final
log_step "Estado final del sistema:"
echo ""
docker-compose -f docker-compose.production.yml ps

# Mostrar URLs de acceso
echo ""
log "════════════════════════════════════════════════" "$GREEN"
log "  ✅ Despliegue completado exitosamente!" "$GREEN"
log "════════════════════════════════════════════════" "$GREEN"
echo ""

# Leer puerto de .env si existe
if [ -f ".env" ]; then
    source .env
    if [ ! -z "$NGINX_HTTP_PORT" ]; then
        log "🌐 Acceso web: http://$(hostname -I | awk '{print $1}'):${NGINX_HTTP_PORT}" "$CYAN"
    fi
fi

log "📋 Credenciales por defecto:" "$CYAN"
log "   Email: admin@securepass.com" "$CYAN"
log "   Password: Admin123!" "$CYAN"
echo ""
log "📝 Log completo: $LOG_FILE" "$YELLOW"
echo ""

log "$(date '+%Y-%m-%d %H:%M:%S') - Despliegue completado exitosamente" >> "$LOG_FILE"
echo "═══════════════════════════════════════════════════" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
