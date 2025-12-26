# 🚀 Guía de Configuración aaPanel + Git Engine

Esta guía te ayudará a configurar SecurePass para despliegue automático usando **aaPanel** y su **Engine Git**.

## 📋 Requisitos Previos

- ✅ VPS con Ubuntu 22.04 LTS o superior
- ✅ aaPanel instalado y configurado
- ✅ Docker y Docker Compose instalados en el VPS
- ✅ Clave SSH configurada en GitHub
- ✅ Acceso al panel de aaPanel

## 🔧 Paso 1: Configurar Git Engine en aaPanel

### 1.1 Acceder a Git Engine

1. Abre el panel de **aaPanel** en tu navegador
2. Ve a **App Store** (Tienda de Aplicaciones)
3. Busca e instala **"Git"** si no lo tienes
4. Ve a **Git** en el menú lateral

### 1.2 Agregar Repositorio

1. Click en **"Add Repository"** (Agregar Repositorio)
2. Completa los datos:
   ```
   Repository URL: git@github.com:rvelez140/segurepas-prueba.git
   Branch: claude/update-ubuntu-lts-ahbqj
   Deploy Path: /opt/securepass
   ```
3. **Importante:** Usa la URL SSH (no HTTPS) ya que tienes la clave configurada

### 1.3 Configurar Deployment

En la configuración del repositorio:

**Deploy Method:** (Método de Despliegue)
```bash
Shell Script
```

**Deploy Script:** (Script de Despliegue)
```bash
#!/bin/bash
cd /opt/securepass
./scripts/aapanel-deploy.sh
```

**Auto Deploy:** ✅ Activar (si quieres despliegue automático)

**Webhook URL:** Copia esta URL y guárdala para el siguiente paso

## 🔗 Paso 2: Configurar Webhook en GitHub

### 2.1 Acceder a GitHub

1. Ve a tu repositorio: https://github.com/rvelez140/segurepas-prueba
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Webhooks**
4. Click en **Add webhook** (Agregar webhook)

### 2.2 Configurar Webhook

```
Payload URL: [LA URL QUE COPIASTE DE AAPANEL]
Content type: application/json
Secret: [OPCIONAL - si aaPanel lo requiere]
```

**Which events would you like to trigger this webhook?**
- ✅ Just the push event (Solo eventos push)

**Active:** ✅ Marcar como activo

Click en **Add webhook**

## 📁 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env en el servidor

Conéctate por SSH a tu VPS y ejecuta:

```bash
cd /opt/securepass

# Crear archivo .env basado en el ejemplo
cp .env.production.example .env

# Editar el archivo .env
nano .env
```

### 3.2 Configurar Variables Requeridas

Edita el archivo `.env` con tus datos reales:

```bash
# GitHub (para pull de imágenes)
GITHUB_REPOSITORY=rvelez140/segurepas-prueba

# MongoDB
MONGO_ROOT_USER=securepass_admin
MONGO_ROOT_PASSWORD=[GENERA_UNA_CONTRASEÑA_SEGURA]
MONGO_DB_NAME=securepass
MONGODB_PORT=37849

# API
API_PORT=48721
JWT_SECRET=[GENERA_UN_SECRET_ALEATORIO_64_CHARS]
JWT_EXPIRES_IN=7d

# Frontend
WEB_PORT=52341
REACT_APP_API_URL=http://TU_IP_VPS:8472/api
FRONTEND_URL=http://TU_IP_VPS:8472

# Nginx
NGINX_HTTP_PORT=8472
NGINX_HTTPS_PORT=8473

# Email (Opcional - para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Cloudinary (Opcional - para imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Generar valores seguros:**

```bash
# Generar MONGO_ROOT_PASSWORD
openssl rand -base64 32

# Generar JWT_SECRET
openssl rand -hex 64
```

Guarda el archivo: `Ctrl + O`, `Enter`, `Ctrl + X`

### 3.3 Proteger el archivo .env

```bash
chmod 600 /opt/securepass/.env
```

## 🐳 Paso 4: Primera Ejecución Manual

Antes de activar el despliegue automático, haz una primera ejecución manual:

```bash
cd /opt/securepass

# Ejecutar el script de despliegue
./scripts/aapanel-deploy.sh
```

Este script hará:
1. ✅ Descargar las imágenes Docker
2. ✅ Iniciar todos los contenedores
3. ✅ Crear el usuario administrador automáticamente
4. ✅ Verificar que todo esté funcionando

## 🎯 Paso 5: Verificar Instalación

### 5.1 Verificar Contenedores

```bash
docker-compose -f docker-compose.production.yml ps
```

Deberías ver 4 contenedores corriendo:
- ✅ securepass-mongodb
- ✅ securepass-api
- ✅ securepass-web
- ✅ securepass-nginx

### 5.2 Verificar Logs

```bash
# Ver logs del deployment
cat /opt/securepass/deployment.log

# Ver logs de contenedores
docker logs securepass-api
docker logs securepass-web
docker logs securepass-nginx
```

### 5.3 Acceder a la Aplicación

1. Abre tu navegador
2. Ve a: `http://TU_IP_VPS:8472`
3. Inicia sesión con:
   - **Email:** `admin@securepass.com`
   - **Password:** `Admin123!`

## ⚙️ Paso 6: Configurar Despliegue Automático en aaPanel

### 6.1 Activar Auto-Deploy

En aaPanel Git Manager:

1. Selecciona tu repositorio
2. Click en **Settings** (Configuración)
3. Activa **Auto Deploy on Push**
4. Guarda los cambios

### 6.2 Probar Webhook

En GitHub:
1. Ve a **Settings** → **Webhooks**
2. Click en tu webhook
3. Baja a **Recent Deliveries**
4. Click en una entrega para ver detalles
5. Verifica que la respuesta sea **200 OK**

## 🔄 Cómo Funciona el Despliegue Automático

Una vez configurado, el flujo es:

```
1. Haces push a la rama → GitHub
                ↓
2. GitHub envía webhook → aaPanel
                ↓
3. aaPanel hace git pull → Repositorio actualizado
                ↓
4. aaPanel ejecuta → scripts/aapanel-deploy.sh
                ↓
5. Script detiene contenedores → Descarga nuevas imágenes → Inicia contenedores
                ↓
6. ✅ Aplicación actualizada automáticamente
```

## 🔒 Seguridad y Mejores Prácticas

### Firewall

Configura el firewall para abrir solo los puertos necesarios:

```bash
# Permitir SSH
ufw allow 22/tcp

# Permitir aaPanel
ufw allow 8888/tcp

# Permitir SecurePass
ufw allow 8472/tcp
ufw allow 8473/tcp

# Activar firewall
ufw enable
```

### Nginx SSL (Opcional pero Recomendado)

Para usar HTTPS:

```bash
# Instalar certbot
apt install certbot

# Obtener certificado
certbot certonly --standalone -d tu-dominio.com

# Copiar certificados a nginx
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /opt/securepass/nginx/ssl/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /opt/securepass/nginx/ssl/
```

### Backups Automáticos

Configura backups en aaPanel:

1. Ve a **Database** → **MongoDB**
2. Configura backup automático diario
3. Guarda los backups en un servidor remoto

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Logs de deployment
tail -f /opt/securepass/deployment.log

# Logs de API
docker logs -f securepass-api

# Logs de Nginx
tail -f /opt/securepass/nginx/logs/access.log
tail -f /opt/securepass/nginx/logs/error.log
```

### Verificar Estado de Servicios

```bash
# Estado de contenedores
docker-compose -f /opt/securepass/docker-compose.production.yml ps

# Uso de recursos
docker stats
```

## 🆘 Solución de Problemas

### Problema: El webhook no se ejecuta

**Solución:**
1. Verifica que el webhook esté activo en GitHub
2. Revisa la URL del webhook en aaPanel
3. Verifica que aaPanel tenga acceso a internet
4. Revisa los logs de aaPanel: `/www/server/panel/logs/`

### Problema: Error al hacer git pull

**Solución:**
```bash
# Verificar que la clave SSH funciona
ssh -T git@github.com

# Regenerar clave si es necesario
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
cat ~/.ssh/id_ed25519.pub
# Agregar esta clave a GitHub → Settings → SSH Keys
```

### Problema: Contenedores no inician

**Solución:**
```bash
# Ver logs detallados
docker-compose -f /opt/securepass/docker-compose.production.yml logs

# Reiniciar servicios
docker-compose -f /opt/securepass/docker-compose.production.yml restart

# Verificar .env
cat /opt/securepass/.env
```

### Problema: No puedo acceder a la aplicación

**Solución:**
```bash
# Verificar que nginx está corriendo
docker ps | grep nginx

# Verificar puertos
netstat -tulpn | grep 8472

# Verificar firewall
ufw status
```

## 📞 Comandos Útiles

### Reiniciar Todo

```bash
cd /opt/securepass
docker-compose -f docker-compose.production.yml restart
```

### Ver Estado

```bash
cd /opt/securepass
docker-compose -f docker-compose.production.yml ps
```

### Acceder a MongoDB

```bash
docker exec -it securepass-mongodb mongosh -u $MONGO_ROOT_USER -p $MONGO_ROOT_PASSWORD
```

### Crear Nuevo Admin

```bash
cd /opt/securepass
./scripts/setup-admin.sh
```

### Limpiar Sistema

```bash
# Detener y eliminar todo
docker-compose -f /opt/securepass/docker-compose.production.yml down -v

# Limpiar imágenes huérfanas
docker image prune -f

# Limpiar volúmenes huérfanos
docker volume prune -f
```

## 📚 Recursos Adicionales

- **aaPanel Documentation:** https://www.aapanel.com/reference.html
- **Docker Documentation:** https://docs.docker.com/
- **Guía Completa de Admin:** Ver `ADMIN_SETUP_GUIDE.md`
- **Deployment Script:** Ver `scripts/aapanel-deploy.sh`

## ✅ Checklist de Configuración

Usa este checklist para asegurarte de que todo está configurado:

- [ ] aaPanel instalado y funcionando
- [ ] Git Engine instalado en aaPanel
- [ ] Repositorio agregado en aaPanel
- [ ] Script de deployment configurado
- [ ] Webhook configurado en GitHub
- [ ] Archivo .env creado y configurado
- [ ] Variables de entorno con valores seguros
- [ ] Primera ejecución manual exitosa
- [ ] Todos los contenedores corriendo
- [ ] Usuario admin creado
- [ ] Acceso web funcionando
- [ ] Auto-deploy activado
- [ ] Webhook probado y funcionando
- [ ] Firewall configurado
- [ ] Backups configurados

---

¿Necesitas ayuda? Revisa los logs o contacta al administrador del sistema.
