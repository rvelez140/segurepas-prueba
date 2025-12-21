#!/bin/bash

#######################################
# Script de Instalación Completa en VPS
# Instala Git, Docker y configura el proyecto
# Uso: curl -fsSL <URL_RAW_DE_ESTE_SCRIPT> | bash
# o: wget -O - <URL_RAW_DE_ESTE_SCRIPT> | bash
#######################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SecurePass - Instalación en VPS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script debe ejecutarse como root o con sudo${NC}"
    exit 1
fi

# Variables de configuración
DEPLOY_USER="securepass"
DEPLOY_PATH="/opt/securepass"
REPO_URL="https://github.com/rvelez140/segurepas-prueba.git"
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
# 1. ACTUALIZAR SISTEMA
#######################################
show_progress "Actualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
show_success "Sistema actualizado"

#######################################
# 2. INSTALAR GIT
#######################################
show_progress "Instalando Git..."
if ! command -v git &> /dev/null; then
    apt-get install -y git
    show_success "Git instalado: $(git --version)"
else
    show_success "Git ya está instalado: $(git --version)"
fi

#######################################
# 3. INSTALAR DOCKER
#######################################
show_progress "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Instalar dependencias
    apt-get install -y ca-certificates curl gnupg lsb-release

    # Agregar Docker GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Agregar repositorio Docker
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Habilitar e iniciar Docker
    systemctl enable docker
    systemctl start docker

    show_success "Docker instalado: $(docker --version)"
else
    show_success "Docker ya está instalado: $(docker --version)"
fi

#######################################
# 4. INSTALAR DOCKER COMPOSE
#######################################
show_progress "Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    # Instalar docker-compose standalone
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    show_success "Docker Compose instalado: $(docker-compose --version)"
else
    show_success "Docker Compose ya está instalado: $(docker-compose --version)"
fi

#######################################
# 5. CREAR USUARIO DE DEPLOYMENT
#######################################
show_progress "Configurando usuario de deployment..."
if id "$DEPLOY_USER" &>/dev/null; then
    show_success "Usuario $DEPLOY_USER ya existe"
else
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    show_success "Usuario $DEPLOY_USER creado y agregado al grupo docker"
fi

#######################################
# 6. CREAR DIRECTORIO DE DEPLOYMENT
#######################################
show_progress "Creando directorio de deployment..."
mkdir -p "$DEPLOY_PATH"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
show_success "Directorio creado: $DEPLOY_PATH"

#######################################
# 7. CLONAR REPOSITORIO
#######################################
show_progress "Clonando repositorio desde GitHub..."
if [ -d "$DEPLOY_PATH/.git" ]; then
    show_warning "El repositorio ya existe, actualizando..."
    su - "$DEPLOY_USER" -c "cd $DEPLOY_PATH && git pull origin $BRANCH"
else
    su - "$DEPLOY_USER" -c "git clone -b $BRANCH $REPO_URL $DEPLOY_PATH"
fi
show_success "Repositorio clonado/actualizado"

#######################################
# 8. CONFIGURAR FIREWALL
#######################################
show_progress "Configurando firewall UFW..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    show_success "Firewall configurado (puertos 22, 80, 443 abiertos)"
else
    apt-get install -y ufw
    ufw --force enable
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    show_success "Firewall instalado y configurado"
fi

#######################################
# 9. CONFIGURAR SWAP (si no existe)
#######################################
show_progress "Verificando memoria swap..."
if [ $(swapon --show | wc -l) -eq 0 ]; then
    show_warning "Creando swap de 2GB..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    show_success "Swap de 2GB configurado"
else
    show_success "Swap ya configurado"
fi

#######################################
# 10. OPTIMIZACIONES DEL SISTEMA
#######################################
show_progress "Aplicando optimizaciones del sistema..."
if ! grep -q "SecurePass optimizations" /etc/sysctl.conf; then
    cat >> /etc/sysctl.conf <<EOF

# SecurePass optimizations
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
vm.swappiness = 10
EOF
    sysctl -p > /dev/null
    show_success "Optimizaciones aplicadas"
else
    show_success "Optimizaciones ya aplicadas"
fi

#######################################
# 11. CONFIGURAR VARIABLES DE ENTORNO
#######################################
show_progress "Configurando variables de entorno..."
if [ ! -f "$DEPLOY_PATH/.env" ]; then
    if [ -f "$DEPLOY_PATH/.env.production.example" ]; then
        cp "$DEPLOY_PATH/.env.production.example" "$DEPLOY_PATH/.env"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH/.env"
        show_warning "Archivo .env creado desde .env.production.example"
        show_warning "IMPORTANTE: Debes editar $DEPLOY_PATH/.env con tus valores reales"
    else
        show_error "No se encontró .env.production.example"
    fi
else
    show_success "Archivo .env ya existe"
fi

#######################################
# 12. INSTALAR CERTBOT PARA SSL (OPCIONAL)
#######################################
echo ""
echo -e "${YELLOW}¿Deseas instalar Certbot para certificados SSL? (y/n)${NC}"
read -t 30 -n 1 ssl_answer || ssl_answer="n"
echo ""
if [ "$ssl_answer" = "y" ] || [ "$ssl_answer" = "Y" ]; then
    show_progress "Instalando Certbot..."
    apt-get install -y certbot python3-certbot-nginx
    show_success "Certbot instalado"
    show_warning "Para obtener certificado SSL, ejecuta después de configurar tu dominio:"
    echo -e "  ${BLUE}certbot certonly --standalone -d tudominio.com -d api.tudominio.com${NC}"
else
    show_warning "Certbot no instalado"
fi

#######################################
# 13. CONFIGURAR LOG ROTATION
#######################################
show_progress "Configurando log rotation..."
cat > /etc/logrotate.d/securepass <<EOF
$DEPLOY_PATH/nginx/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $DEPLOY_USER $DEPLOY_USER
    sharedscripts
}
EOF
show_success "Log rotation configurado"

#######################################
# RESUMEN FINAL
#######################################
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Instalación completada${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Componentes instalados:${NC}"
echo -e "  • Git: $(git --version | cut -d' ' -f3)"
echo -e "  • Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
echo -e "  • Docker Compose: $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)"
echo -e "  • Usuario: $DEPLOY_USER"
echo -e "  • Directorio: $DEPLOY_PATH"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo -e "${BLUE}1. Configura las variables de entorno:${NC}"
echo -e "   sudo nano $DEPLOY_PATH/.env"
echo ""
echo -e "${BLUE}2. Configura los siguientes valores en .env:${NC}"
echo -e "   • MONGO_ROOT_PASSWORD (contraseña segura para MongoDB)"
echo -e "   • JWT_SECRET (clave secreta para JWT)"
echo -e "   • CLOUDINARY_* (credenciales de Cloudinary)"
echo -e "   • EMAIL_* (configuración de email)"
echo -e "   • GOOGLE_* (OAuth de Google)"
echo -e "   • FRONTEND_URL y REACT_APP_API_URL (tus dominios)"
echo ""
echo -e "${BLUE}3. Si usas SSL con Certbot:${NC}"
echo -e "   sudo certbot certonly --standalone -d tudominio.com -d api.tudominio.com"
echo -e "   Luego copia los certificados:"
echo -e "   sudo mkdir -p $DEPLOY_PATH/nginx/ssl"
echo -e "   sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem $DEPLOY_PATH/nginx/ssl/"
echo -e "   sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem $DEPLOY_PATH/nginx/ssl/"
echo -e "   sudo chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH/nginx/ssl"
echo ""
echo -e "${BLUE}4. Construir las imágenes Docker:${NC}"
echo -e "   cd $DEPLOY_PATH"
echo -e "   sudo docker build -t securepass-api:latest ./apps/api"
echo -e "   sudo docker build -t securepass-web:latest ./apps/web"
echo ""
echo -e "${BLUE}5. Iniciar la aplicación:${NC}"
echo -e "   cd $DEPLOY_PATH"
echo -e "   sudo -u $DEPLOY_USER docker-compose -f docker-compose.production.yml up -d"
echo ""
echo -e "${BLUE}6. Ver logs:${NC}"
echo -e "   sudo docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo -e "${BLUE}7. Verificar estado:${NC}"
echo -e "   sudo docker-compose -f docker-compose.production.yml ps"
echo ""
echo -e "${GREEN}¡Instalación base completada con éxito!${NC}"
echo ""
