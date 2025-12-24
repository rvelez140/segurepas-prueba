# 🐳 Guía de Instalación Docker en VPS

Esta guía te ayudará a instalar y configurar SecurePass en tu VPS usando Docker.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Un VPS con Ubuntu 20.04+ o Debian 10+
- ✅ Acceso root o sudo
- ✅ Mínimo 2GB de RAM
- ✅ Clave SSH configurada en GitHub (ya la tienes ✓)
- ✅ Docker instalado
- ✅ Docker Compose instalado

---

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Conecta a tu VPS
ssh usuario@tu-servidor.com

# 2. Descarga y ejecuta el script de instalación
curl -fsSL https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-docker-install.sh -o install.sh
bash install.sh

# O en un solo comando:
bash <(curl -fsSL https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-docker-install.sh)
```

El script automáticamente:
- ✅ Verifica requisitos
- ✅ Clona el repositorio usando tu clave SSH
- ✅ Configura variables de entorno
- ✅ Construye las imágenes Docker
- ✅ Inicia los contenedores

---

### Opción 2: Instalación Manual

Si prefieres más control sobre el proceso:

#### 1. Instalar Docker (si no lo tienes)

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (o cierra sesión y vuelve a entrar)
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

#### 2. Clonar el Repositorio

```bash
# Crear directorio
sudo mkdir -p /opt/securepass
sudo chown $USER:$USER /opt/securepass

# Clonar con SSH (ya tienes la clave configurada)
git clone git@github.com:rvelez140/segurepas-prueba.git /opt/securepass

# O con HTTPS si prefieres
# git clone https://github.com/rvelez140/segurepas-prueba.git /opt/securepass

# Ir al directorio
cd /opt/securepass
```

#### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.production.example .env

# Editar el archivo .env
nano .env
```

**Configura estos valores críticos:**

```bash
# Contraseña segura para MongoDB (genera una con: openssl rand -base64 32)
MONGO_ROOT_PASSWORD=TuPasswordSeguraAqui123!

# Clave secreta JWT (genera una con: openssl rand -base64 32)
JWT_SECRET=TuClaveSecretaJWTAqui123!

# URLs de tu aplicación (reemplaza con tu IP o dominio)
FRONTEND_URL=http://TU_IP:8472
REACT_APP_API_URL=http://TU_IP:8472/api

# Cloudinary (opcional pero recomendado)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Generar contraseñas seguras:**

```bash
# Para MongoDB
openssl rand -base64 32

# Para JWT Secret
openssl rand -base64 32
```

#### 4. Construir las Imágenes Docker

```bash
cd /opt/securepass

# Construir todas las imágenes
docker-compose -f docker-compose.local.yml build

# Esto tomará varios minutos la primera vez
```

#### 5. Iniciar los Contenedores

```bash
# Iniciar en segundo plano
docker-compose -f docker-compose.local.yml up -d

# Ver el estado
docker-compose -f docker-compose.local.yml ps

# Ver los logs
docker-compose -f docker-compose.local.yml logs -f
```

---

## 🔍 Verificar la Instalación

### 1. Comprobar que los contenedores estén corriendo

```bash
cd /opt/securepass
docker-compose -f docker-compose.local.yml ps
```

Deberías ver algo como:

```
NAME                    STATUS          PORTS
securepass-api          Up 2 minutes    127.0.0.1:48721->48721/tcp
securepass-mongodb      Up 2 minutes    127.0.0.1:37849->27017/tcp
securepass-nginx        Up 2 minutes    0.0.0.0:8472->80/tcp, 0.0.0.0:8473->443/tcp
securepass-web          Up 2 minutes    127.0.0.1:52341->80/tcp
```

### 2. Verificar el acceso desde tu navegador

Obtén la IP de tu VPS:

```bash
curl ifconfig.me
# O
hostname -I
```

Luego abre en tu navegador:

- **Aplicación Web**: `http://TU_IP:8472`
- **API**: `http://TU_IP:8472/api`
- **Documentación API**: `http://TU_IP:8472/api/api-docs`

### 3. Crear Usuario Administrador

Después de que los contenedores estén corriendo, necesitas crear un usuario administrador para acceder al sistema:

```bash
cd /opt/securepass

# Ejecutar el script de corrección (esto crea el usuario admin)
bash scripts/fix-admin-user.sh
```

**Credenciales de acceso:**
- Email: `admin@securepass.com`
- Password: `admin123`

### 4. Verificar los logs

```bash
# Ver todos los logs
docker-compose -f docker-compose.local.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.local.yml logs -f api
docker-compose -f docker-compose.local.yml logs -f web
docker-compose -f docker-compose.local.yml logs -f mongodb
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
cd /opt/securepass

# Iniciar servicios
docker-compose -f docker-compose.local.yml up -d

# Detener servicios
docker-compose -f docker-compose.local.yml down

# Reiniciar servicios
docker-compose -f docker-compose.local.yml restart

# Ver estado
docker-compose -f docker-compose.local.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.local.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.local.yml logs -f api
```

### Actualizar la Aplicación

```bash
cd /opt/securepass

# Obtener últimos cambios
git pull origin main

# Reconstruir imágenes
docker-compose -f docker-compose.local.yml build --no-cache

# Reiniciar servicios
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d
```

### Limpiar y Reiniciar

```bash
# Detener y eliminar todo (¡CUIDADO! Esto borra la base de datos)
docker-compose -f docker-compose.local.yml down -v

# Reconstruir desde cero
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

### Acceder al contenedor

```bash
# Acceder a la API
docker exec -it securepass-api sh

# Acceder a MongoDB
docker exec -it securepass-mongodb mongosh -u admin -p

# Ver uso de recursos
docker stats
```

---

## 🔧 Configuración Avanzada

### Configurar Firewall

```bash
# Instalar UFW si no está instalado
sudo apt-get install -y ufw

# Permitir SSH (¡IMPORTANTE! Hazlo primero)
sudo ufw allow ssh

# Permitir puertos HTTP/HTTPS de SecurePass
sudo ufw allow 8472/tcp
sudo ufw allow 8473/tcp

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

### Configurar SSL/HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install -y certbot

# Detener Nginx temporalmente
docker-compose -f docker-compose.local.yml stop nginx

# Obtener certificado (reemplaza con tu dominio)
sudo certbot certonly --standalone \
  -d tudominio.com \
  -d api.tudominio.com \
  --email tu-email@gmail.com \
  --agree-tos

# Copiar certificados al proyecto
sudo mkdir -p /opt/securepass/nginx/ssl
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem /opt/securepass/nginx/ssl/
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem /opt/securepass/nginx/ssl/
sudo chown -R $USER:$USER /opt/securepass/nginx/ssl

# Reiniciar Nginx
docker-compose -f docker-compose.local.yml start nginx
```

### Configurar Renovación Automática de SSL

```bash
# Crear script de renovación
sudo tee /opt/securepass/renew-ssl.sh > /dev/null <<'EOF'
#!/bin/bash
cd /opt/securepass
docker-compose -f docker-compose.local.yml stop nginx
certbot renew
cp /etc/letsencrypt/live/tudominio.com/*.pem /opt/securepass/nginx/ssl/
docker-compose -f docker-compose.local.yml start nginx
EOF

# Dar permisos
sudo chmod +x /opt/securepass/renew-ssl.sh

# Agregar a crontab (ejecutar cada 12 horas)
(crontab -l 2>/dev/null; echo "0 */12 * * * /opt/securepass/renew-ssl.sh") | crontab -
```

### Backup de la Base de Datos

```bash
# Crear directorio de backups
mkdir -p /opt/securepass/backups

# Crear backup manual
docker exec securepass-mongodb mongodump \
  --username admin \
  --password TU_PASSWORD \
  --authenticationDatabase admin \
  --out /data/backups/$(date +%Y%m%d_%H%M%S)

# Copiar backup al host
docker cp securepass-mongodb:/data/backups /opt/securepass/backups
```

### Configurar Backup Automático

```bash
# Crear script de backup
tee /opt/securepass/backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/securepass/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear backup
docker exec securepass-mongodb mongodump \
  --username admin \
  --password $(grep MONGO_ROOT_PASSWORD /opt/securepass/.env | cut -d= -f2) \
  --authenticationDatabase admin \
  --out /data/backups/$DATE

# Copiar al host
docker cp securepass-mongodb:/data/backups/$DATE $BACKUP_DIR/

# Limpiar backups antiguos (más de 7 días)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completado: $BACKUP_DIR/$DATE"
EOF

# Dar permisos
chmod +x /opt/securepass/backup.sh

# Ejecutar diariamente a las 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/securepass/backup.sh") | crontab -
```

---

## 🐛 Solución de Problemas

### Los contenedores no inician

```bash
# Ver logs detallados
docker-compose -f docker-compose.local.yml logs

# Verificar que los puertos no estén en uso
sudo netstat -tulpn | grep -E '8472|8473|48721|52341|37849'

# Reiniciar Docker
sudo systemctl restart docker
```

### Error de conexión a MongoDB

```bash
# Verificar que MongoDB esté corriendo
docker ps | grep mongodb

# Ver logs de MongoDB
docker-compose -f docker-compose.local.yml logs mongodb

# Verificar variables de entorno
cat /opt/securepass/.env | grep MONGO
```

### La aplicación web no carga

```bash
# Verificar que el contenedor web esté corriendo
docker ps | grep securepass-web

# Ver logs del contenedor web
docker-compose -f docker-compose.local.yml logs web

# Verificar configuración de Nginx
docker-compose -f docker-compose.local.yml logs nginx
```

### Error al iniciar sesión "Credenciales inválidas"

Si no puedes iniciar sesión con las credenciales admin, ejecuta el script de corrección:

```bash
cd /opt/securepass
bash scripts/fix-admin-user.sh
```

Este script:
- Elimina cualquier usuario admin mal formateado
- Crea un nuevo usuario admin con la estructura correcta
- Establece las credenciales: `admin@securepass.com` / `admin123`

### Problemas de memoria

```bash
# Ver uso de recursos
docker stats

# Aumentar swap si es necesario
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Reconstruir desde cero

```bash
cd /opt/securepass

# Detener y eliminar todo
docker-compose -f docker-compose.local.yml down -v

# Limpiar imágenes
docker system prune -af

# Reconstruir
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

---

## 📊 Monitoreo

### Ver métricas en tiempo real

```bash
# Uso de CPU, memoria y red
docker stats

# Logs en tiempo real
docker-compose -f docker-compose.local.yml logs -f --tail=100
```

### Configurar alertas de salud

```bash
# Verificar health checks
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🔐 Seguridad

### Checklist de Seguridad

- ✅ Cambia las contraseñas por defecto en `.env`
- ✅ Usa contraseñas seguras (mínimo 32 caracteres)
- ✅ Configura SSL/HTTPS en producción
- ✅ Mantén Docker actualizado: `sudo apt-get update && sudo apt-get upgrade`
- ✅ Configura backups automáticos
- ✅ Limita el acceso SSH con firewall
- ✅ Usa autenticación de dos factores si es posible
- ✅ Revisa los logs regularmente

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose -f docker-compose.local.yml logs -f`
2. Verifica la configuración en `.env`
3. Consulta la sección de "Solución de Problemas" arriba
4. Abre un issue en GitHub: https://github.com/rvelez140/segurepas-prueba/issues

---

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Guía de MongoDB](https://docs.mongodb.com/)
- [Configuración de Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**¡Listo! 🎉 Ahora tienes SecurePass corriendo en tu VPS con Docker.**
