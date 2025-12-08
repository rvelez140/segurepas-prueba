# 🚀 Guía de Deployment - SecurePass

Esta guía explica cómo configurar el deployment automático de SecurePass desde Git al servidor de producción.

## 📋 Tabla de Contenidos

1. [Opciones de Deployment](#opciones-de-deployment)
2. [Setup Inicial del Servidor](#setup-inicial-del-servidor)
3. [Configuración de GitHub Actions](#configuración-de-github-actions)
4. [Deployment Manual](#deployment-manual)
5. [Troubleshooting](#troubleshooting)

## 🎯 Opciones de Deployment

### Opción 1: Deployment Automático con GitHub Actions (Recomendado)

Cada vez que hagas `git push` a las ramas `main` o `production`, se ejecutará automáticamente:

- ✅ Build de las imágenes Docker
- ✅ Push al GitHub Container Registry
- ✅ Deployment al servidor vía SSH
- ✅ Verificación de salud de servicios

### Opción 2: Deployment Manual

Ejecutar scripts de deployment directamente en el servidor cuando lo necesites.

---

## 🖥️ Setup Inicial del Servidor

### Paso 1: Preparar el Servidor

Ejecuta el script de setup en tu servidor (solo una vez):

```bash
# Conectar al servidor
ssh user@tu-servidor.com

# Descargar y ejecutar el script de setup
wget https://raw.githubusercontent.com/tu-usuario/tu-repo/main/scripts/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

Este script instalará automáticamente:

- ✅ Docker y Docker Compose
- ✅ Usuario de deployment
- ✅ Configuración de firewall
- ✅ Nginx (opcional)
- ✅ Certbot para SSL (opcional)
- ✅ Optimizaciones del sistema

### Paso 2: Clonar el Repositorio

```bash
# Cambiar al usuario de deployment
sudo su - securepass

# Ir al directorio de deployment
cd /opt/securepass

# Clonar el repositorio
git clone git@github.com:tu-usuario/tu-repo.git .
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.production.example .env

# Editar con tus valores reales
nano .env
```

Variables importantes a configurar:

```env
# MongoDB
MONGO_ROOT_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# URLs
FRONTEND_URL=https://tudominio.com
REACT_APP_API_URL=https://api.tudominio.com/api
```

### Paso 4: Configurar SSL con Let's Encrypt (Opcional)

```bash
# Instalar certificado SSL
sudo certbot certonly --standalone -d tudominio.com -d api.tudominio.com

# Los certificados se guardarán en:
# /etc/letsencrypt/live/tudominio.com/fullchain.pem
# /etc/letsencrypt/live/tudominio.com/privkey.pem

# Copiar certificados al directorio de nginx
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem nginx/ssl/
sudo chown -R securepass:securepass nginx/ssl/
```

### Paso 5: Primer Deployment Manual

```bash
# Ejecutar el script de deployment
cd /opt/securepass
./scripts/deploy.sh production
```

---

## ⚙️ Configuración de GitHub Actions

### Paso 1: Generar Clave SSH para Deployment

En tu servidor:

```bash
# Cambiar al usuario de deployment
sudo su - securepass

# Generar clave SSH (si no la creaste en el setup)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Agregar la clave pública a authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Mostrar la clave privada (copiar TODO el contenido)
cat ~/.ssh/github_actions
```

### Paso 2: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions → New repository secret

Agrega los siguientes secrets:

| Secret Name      | Descripción                    | Ejemplo                         |
| ---------------- | ------------------------------ | ------------------------------- |
| `SERVER_HOST`    | IP o dominio del servidor      | `123.45.67.89` o `servidor.com` |
| `SERVER_USER`    | Usuario de deployment          | `securepass`                    |
| `SERVER_SSH_KEY` | Clave privada SSH (completa)   | `-----BEGIN OPENSSH...`         |
| `SERVER_PORT`    | Puerto SSH (opcional)          | `22`                            |
| `DEPLOY_PATH`    | Ruta de deployment en servidor | `/opt/securepass`               |

### Paso 3: Habilitar GitHub Container Registry

1. Ve a Settings → Developer settings → Personal access tokens
2. Crea un token con permisos:
   - ✅ `write:packages`
   - ✅ `read:packages`
   - ✅ `delete:packages`

3. GitHub Actions usará `GITHUB_TOKEN` automáticamente para push de imágenes

### Paso 4: Probar el Workflow

```bash
# Hacer cualquier cambio y push
git add .
git commit -m "Test auto deployment"
git push origin main

# Ver el progreso en:
# GitHub → Actions → Deploy to Server
```

---

## 🔧 Deployment Manual

### Deployment desde el Servidor

```bash
# Conectar al servidor
ssh securepass@tu-servidor.com

# Ir al directorio
cd /opt/securepass

# Pull de los últimos cambios
git pull origin main

# Ejecutar deployment
./scripts/deploy.sh production
```

### Comandos Útiles de Docker Compose

```bash
# Ver estado de servicios
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.production.yml logs -f api

# Reiniciar un servicio
docker-compose -f docker-compose.production.yml restart api

# Detener todos los servicios
docker-compose -f docker-compose.production.yml down

# Iniciar servicios
docker-compose -f docker-compose.production.yml up -d

# Reconstruir imágenes
docker-compose -f docker-compose.production.yml up -d --build
```

### Comandos de Mantenimiento

```bash
# Backup manual de base de datos
docker-compose -f docker-compose.production.yml exec mongodb mongodump \
  --out=/tmp/backup_$(date +%Y%m%d) \
  --authenticationDatabase=admin

# Limpiar recursos Docker antiguos
docker system prune -a --volumes

# Ver uso de espacio
docker system df

# Ver logs de Nginx
docker-compose -f docker-compose.production.yml logs nginx
```

---

## 🔍 Troubleshooting

### El deployment falla en GitHub Actions

**Verificar conexión SSH:**

```bash
# En tu máquina local, probar la conexión
ssh -i /path/to/private/key securepass@tu-servidor.com
```

**Verificar que el usuario tiene permisos de Docker:**

```bash
# En el servidor
groups securepass
# Debería incluir "docker"

# Si no está, agregarlo
sudo usermod -aG docker securepass
```

### Los contenedores no inician

**Ver logs detallados:**

```bash
docker-compose -f docker-compose.production.yml logs
```

**Verificar archivo .env:**

```bash
# Verificar que existe
ls -la .env

# Verificar formato (sin espacios en blanco extra)
cat .env
```

### Error de conexión a MongoDB

**Verificar que MongoDB está corriendo:**

```bash
docker-compose -f docker-compose.production.yml ps mongodb
```

**Verificar credenciales:**

```bash
# Conectar a MongoDB manualmente
docker-compose -f docker-compose.production.yml exec mongodb mongosh \
  -u admin -p tu_password --authenticationDatabase admin
```

### La API no responde

**Verificar health endpoint:**

```bash
# Desde el servidor
curl http://localhost:8000/health

# Desde fuera (si está expuesto)
curl https://api.tudominio.com/health
```

**Ver logs de API:**

```bash
docker-compose -f docker-compose.production.yml logs -f api
```

### Nginx retorna 502 Bad Gateway

**Verificar que los servicios están corriendo:**

```bash
docker-compose -f docker-compose.production.yml ps
```

**Verificar configuración de Nginx:**

```bash
# Probar configuración
docker-compose -f docker-compose.production.yml exec nginx nginx -t

# Ver logs de Nginx
docker-compose -f docker-compose.production.yml logs nginx
```

### Problemas con SSL/HTTPS

**Renovar certificado:**

```bash
sudo certbot renew

# Copiar nuevos certificados
sudo cp /etc/letsencrypt/live/tudominio.com/*.pem nginx/ssl/

# Reiniciar Nginx
docker-compose -f docker-compose.production.yml restart nginx
```

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose -f docker-compose.production.yml logs -f

# Solo API
docker-compose -f docker-compose.production.yml logs -f api

# Solo Web
docker-compose -f docker-compose.production.yml logs -f web

# Últimas 100 líneas
docker-compose -f docker-compose.production.yml logs --tail=100
```

### Verificar uso de recursos

```bash
# CPU y memoria de cada contenedor
docker stats

# Espacio en disco
df -h
docker system df
```

---

## 🔄 Rollback (Volver a Versión Anterior)

Si algo sale mal después de un deployment:

```bash
# Ver commits recientes
git log --oneline -5

# Volver a un commit específico
git checkout <commit-hash>

# Redeployar
./scripts/deploy.sh production

# O volver a la rama main
git checkout main
git pull
./scripts/deploy.sh production
```

---

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta documentación
2. Verifica los logs: `docker-compose logs`
3. Revisa el estado: `docker-compose ps`
4. Crea un issue en GitHub con:
   - Descripción del problema
   - Logs relevantes
   - Pasos para reproducir

---

**✅ ¡Deployment configurado exitosamente!**

Ahora cada vez que hagas `git push` a `main` o `production`, tu aplicación se desplegará automáticamente al servidor.
