#!/bin/bash

#######################################
# Script de Setup Inicial del Servidor
# Ejecutar una sola vez en el servidor nuevo
#######################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SecurePass Server Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar si se ejecuta como root o con sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor ejecuta con sudo${NC}"
    exit 1
fi

# Actualizar sistema
echo -e "${YELLOW}1. Actualizando sistema...${NC}"
apt-get update
apt-get upgrade -y

# Instalar Docker
echo -e "${YELLOW}2. Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker instalado${NC}"
else
    echo -e "${GREEN}✓ Docker ya está instalado${NC}"
fi

# Instalar Docker Compose
echo -e "${YELLOW}3. Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose instalado${NC}"
else
    echo -e "${GREEN}✓ Docker Compose ya está instalado${NC}"
fi

# Crear usuario para deployment si no existe
DEPLOY_USER="securepass"
echo -e "${YELLOW}4. Creando usuario de deployment...${NC}"
if id "$DEPLOY_USER" &>/dev/null; then
    echo -e "${GREEN}✓ Usuario $DEPLOY_USER ya existe${NC}"
else
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    echo -e "${GREEN}✓ Usuario $DEPLOY_USER creado${NC}"
fi

# Crear directorio de deployment
DEPLOY_PATH="/opt/securepass"
echo -e "${YELLOW}5. Creando directorio de deployment...${NC}"
mkdir -p "$DEPLOY_PATH"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH"
echo -e "${GREEN}✓ Directorio creado: $DEPLOY_PATH${NC}"

# Configurar firewall
echo -e "${YELLOW}6. Configurando firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${GREEN}✓ Firewall configurado${NC}"
else
    echo -e "${YELLOW}⚠ UFW no está instalado, saltando configuración de firewall${NC}"
fi

# Instalar Nginx (opcional, como reverse proxy adicional)
echo -e "${YELLOW}7. ¿Deseas instalar Nginx como reverse proxy adicional? (y/n)${NC}"
read -n 1 answer
echo ""
if [ "$answer" = "y" ]; then
    apt-get install -y nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx instalado${NC}"
else
    echo -e "${YELLOW}⚠ Nginx no instalado${NC}"
fi

# Instalar certbot para SSL
echo -e "${YELLOW}8. ¿Deseas instalar Certbot para SSL/HTTPS? (y/n)${NC}"
read -n 1 answer
echo ""
if [ "$answer" = "y" ]; then
    apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot instalado${NC}"
    echo -e "${YELLOW}Para obtener certificado SSL, ejecuta:${NC}"
    echo -e "  certbot --nginx -d tudominio.com"
else
    echo -e "${YELLOW}⚠ Certbot no instalado${NC}"
fi

# Configurar log rotation
echo -e "${YELLOW}9. Configurando log rotation...${NC}"
cat > /etc/logrotate.d/securepass <<EOF
/opt/securepass/logs/*.log {
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
echo -e "${GREEN}✓ Log rotation configurado${NC}"

# Configurar swap (si no existe)
echo -e "${YELLOW}10. Verificando swap...${NC}"
if [ $(swapon --show | wc -l) -eq 0 ]; then
    echo -e "${YELLOW}Creando swap de 2GB...${NC}"
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo -e "${GREEN}✓ Swap configurado${NC}"
else
    echo -e "${GREEN}✓ Swap ya existe${NC}"
fi

# Optimizaciones del sistema
echo -e "${YELLOW}11. Aplicando optimizaciones del sistema...${NC}"
cat >> /etc/sysctl.conf <<EOF

# SecurePass optimizations
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
vm.swappiness = 10
EOF
sysctl -p
echo -e "${GREEN}✓ Optimizaciones aplicadas${NC}"

# Generar clave SSH para GitHub
echo -e "${YELLOW}12. ¿Deseas generar clave SSH para GitHub? (y/n)${NC}"
read -n 1 answer
echo ""
if [ "$answer" = "y" ]; then
    su - "$DEPLOY_USER" -c "ssh-keygen -t ed25519 -C 'securepass-deploy' -f ~/.ssh/id_ed25519 -N ''"
    echo -e "${GREEN}✓ Clave SSH generada${NC}"
    echo -e "${YELLOW}Clave pública (agregar a GitHub Deploy Keys):${NC}"
    su - "$DEPLOY_USER" -c "cat ~/.ssh/id_ed25519.pub"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Setup completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Configurar secrets en GitHub:"
echo "   - SERVER_HOST: IP o dominio del servidor"
echo "   - SERVER_USER: $DEPLOY_USER"
echo "   - SERVER_SSH_KEY: clave privada SSH"
echo "   - DEPLOY_PATH: $DEPLOY_PATH"
echo ""
echo "2. Clonar el repositorio en $DEPLOY_PATH:"
echo "   su - $DEPLOY_USER"
echo "   cd $DEPLOY_PATH"
echo "   git clone <tu-repo-url> ."
echo ""
echo "3. Configurar archivo .env en $DEPLOY_PATH"
echo ""
echo "4. Ejecutar primer deployment:"
echo "   cd $DEPLOY_PATH"
echo "   ./scripts/deploy.sh production"
echo ""
