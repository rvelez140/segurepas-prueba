# Guía de Instalación en VPS

Esta guía te ayudará a instalar y configurar SecurePass en tu VPS desde cero, incluyendo Git y Docker.

## 📋 Requisitos

- VPS con Ubuntu 20.04 LTS o superior (también compatible con Debian)
- Acceso root o sudo
- Al menos 2GB de RAM (recomendado 4GB)
- Al menos 20GB de espacio en disco
- Dominio apuntando a tu VPS (opcional, pero recomendado para SSL)

## 🚀 Instalación Rápida (Método Automático)

### Opción 1: Instalación directa con curl

```bash
curl -fsSL https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install.sh | sudo bash
```

### Opción 2: Instalación directa con wget

```bash
wget -O - https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install.sh | sudo bash
```

### Opción 3: Descarga y ejecución manual

```bash
# Descargar script
wget https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install.sh

# Hacer ejecutable
chmod +x vps-install.sh

# Ejecutar
sudo ./vps-install.sh
```

## 📝 ¿Qué hace el script de instalación?

El script `vps-install.sh` realiza las siguientes tareas automáticamente:

1. ✅ Actualiza el sistema operativo
2. ✅ Instala Git
3. ✅ Instala Docker y Docker Compose
4. ✅ Crea usuario de deployment (`securepass`)
5. ✅ Clona el repositorio en `/opt/securepass`
6. ✅ Configura el firewall (puertos 22, 80, 443)
7. ✅ Crea memoria swap de 2GB
8. ✅ Aplica optimizaciones del sistema
9. ✅ Crea archivo `.env` desde el template
10. ✅ Configura log rotation
11. ⚠️ Opcionalmente instala Certbot para SSL

## ⚙️ Configuración Post-Instalación

### 1. Configurar Variables de Entorno

Después de la instalación, edita el archivo `.env`:

```bash
sudo nano /opt/securepass/.env
```

Configura los siguientes valores importantes:

```bash
# MongoDB
MONGO_ROOT_PASSWORD=tu_contraseña_segura_aqui

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria

# Dominios
FRONTEND_URL=https://tudominio.com
REACT_APP_API=https://api.tudominio.com/api

# Cloudinary (para subida de archivos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### 2. Configurar SSL/HTTPS con Certbot (Recomendado)

Si instalaste Certbot durante la instalación:

```bash
# Obtener certificado SSL
sudo certbot certonly --standalone -d tudominio.com -d api.tudominio.com

# Copiar certificados al proyecto
sudo mkdir -p /opt/securepass/nginx/ssl
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem /opt/securepass/nginx/ssl/
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem /opt/securepass/nginx/ssl/
sudo chown -R securepass:securepass /opt/securepass/nginx/ssl

# Configurar renovación automática
sudo certbot renew --dry-run
```

### 3. Actualizar configuración de Nginx

Edita el archivo de configuración de Nginx para usar tu dominio:

```bash
sudo nano /opt/securepass/nginx/nginx.conf
```

Reemplaza `tudominio.com` y `api.tudominio.com` con tus dominios reales.

### 4. Construir las Imágenes Docker

```bash
cd /opt/securepass

# Construir imagen de la API
sudo docker build -t securepass-api:latest ./apps/api

# Construir imagen de la Web
sudo docker build -t securepass-web:latest ./apps/web
```

### 5. Actualizar docker-compose para usar imágenes locales

Edita el archivo `docker-compose.production.yml`:

```bash
sudo nano /opt/securepass/docker-compose.production.yml
```

Cambia las líneas de imagen:

```yaml
# En la sección api:
image: securepass-api:latest  # En lugar de ghcr.io/${GITHUB_REPOSITORY}/api:latest

# En la sección web:
image: securepass-web:latest  # En lugar de ghcr.io/${GITHUB_REPOSITORY}/web:latest
```

### 6. Iniciar la Aplicación

```bash
cd /opt/securepass
sudo docker-compose -f docker-compose.production.yml up -d
```

### 7. Verificar Estado

```bash
# Ver estado de contenedores
sudo docker-compose -f docker-compose.production.yml ps

# Ver logs
sudo docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
sudo docker-compose -f docker-compose.production.yml logs -f api
sudo docker-compose -f docker-compose.production.yml logs -f web
```

## 🔧 Instalación Manual (Método Paso a Paso)

Si prefieres instalar manualmente cada componente:

### 1. Actualizar Sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Instalar Git

```bash
sudo apt-get install -y git
git --version
```

### 3. Instalar Docker

```bash
# Instalar dependencias
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Agregar Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar repositorio Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
docker --version
```

### 4. Instalar Docker Compose

```bash
# Obtener última versión
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)

# Descargar e instalar
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

### 5. Clonar Repositorio

```bash
# Crear directorio
sudo mkdir -p /opt/securepass

# Clonar repositorio
sudo git clone https://github.com/rvelez140/segurepas-prueba.git /opt/securepass

# Cambiar al directorio
cd /opt/securepass
```

### 6. Continuar con pasos 1-7 de Configuración Post-Instalación

## 🛠️ Comandos Útiles

### Gestión de Docker

```bash
# Iniciar servicios
sudo docker-compose -f docker-compose.production.yml up -d

# Detener servicios
sudo docker-compose -f docker-compose.production.yml down

# Reiniciar servicios
sudo docker-compose -f docker-compose.production.yml restart

# Ver logs en tiempo real
sudo docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
sudo docker-compose -f docker-compose.production.yml logs -f api

# Ejecutar comando en contenedor
sudo docker-compose -f docker-compose.production.yml exec api sh

# Reconstruir imágenes
sudo docker-compose -f docker-compose.production.yml build

# Limpiar imágenes no usadas
sudo docker system prune -a
```

### Backup de Base de Datos

```bash
# Crear backup
sudo docker-compose -f docker-compose.production.yml exec mongodb mongodump \
  --username=admin \
  --password=tu_password \
  --authenticationDatabase=admin \
  --out=/tmp/backup_$(date +%Y%m%d)

# Copiar backup al host
sudo docker cp securepass-mongodb:/tmp/backup_$(date +%Y%m%d) ./backups/
```

### Actualizar Aplicación

```bash
cd /opt/securepass

# Obtener últimos cambios
sudo git pull origin main

# Reconstruir imágenes
sudo docker build -t securepass-api:latest ./apps/api
sudo docker build -t securepass-web:latest ./apps/web

# Reiniciar servicios
sudo docker-compose -f docker-compose.production.yml down
sudo docker-compose -f docker-compose.production.yml up -d
```

## 🔒 Seguridad

### Recomendaciones de Seguridad

1. **Firewall**: El script configura UFW automáticamente
2. **SSL/HTTPS**: Usa siempre certificados SSL en producción
3. **Contraseñas**: Usa contraseñas fuertes para MongoDB y JWT_SECRET
4. **Actualizaciones**: Mantén el sistema actualizado
5. **Backups**: Configura backups automáticos de la base de datos
6. **SSH**: Desactiva login con password, usa solo llaves SSH
7. **Fail2ban**: Considera instalar fail2ban para proteger SSH

### Configurar Fail2ban (Opcional)

```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🐛 Solución de Problemas

### Puerto 80 o 443 ya en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :80
sudo lsof -i :443

# Detener nginx si está corriendo
sudo systemctl stop nginx
```

### Contenedores no inician

```bash
# Ver logs detallados
sudo docker-compose -f docker-compose.production.yml logs

# Verificar recursos del sistema
free -h
df -h
```

### Error de permisos

```bash
# Asegúrate que el usuario tenga permisos correctos
sudo chown -R securepass:securepass /opt/securepass
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Guía de Docker Compose](https://docs.docker.com/compose/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Documentación del Proyecto](./README.md)
- [Guía de Deployment](./DEPLOYMENT.md)

## 🆘 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los logs: `sudo docker-compose logs -f`
2. Verifica la configuración del `.env`
3. Asegúrate que todos los puertos estén disponibles
4. Verifica que los certificados SSL estén correctamente configurados
5. Consulta la [documentación completa](./DEPLOYMENT.md)

## 📝 Licencia

Este proyecto está bajo la licencia especificada en [LICENSE.txt](./LICENSE.txt)
