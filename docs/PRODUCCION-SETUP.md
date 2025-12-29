# Guía de Configuración de Producción - SecurePass

Esta guía explica cómo configurar las credenciales de base de datos y otras variables sensibles de forma **SEGURA** en producción.

## ⚠️ REGLAS DE SEGURIDAD CRÍTICAS

1. **NUNCA** subir archivos `.env` a Git
2. **NUNCA** hacer commit de credenciales en el código
3. **SIEMPRE** usar variables de entorno para credenciales
4. **SIEMPRE** generar contraseñas fuertes para producción

---

## 🔐 Opciones para Gestión Segura de Credenciales

### Opción 1: GitHub Secrets (Recomendado para CI/CD)

Esta opción es ideal si usas GitHub Actions para deployment automático.

#### Paso 1: Configurar GitHub Secrets

Ve a tu repositorio en GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

#### Paso 2: Agregar los siguientes secrets:

**Secrets de Servidor:**
- `SERVER_HOST` - IP o dominio de tu servidor (ej: `123.45.67.89`)
- `SERVER_USER` - Usuario SSH (ej: `ubuntu`, `root`)
- `SERVER_SSH_KEY` - Llave privada SSH (completa, incluyendo `-----BEGIN...-----`)
- `SERVER_PORT` - Puerto SSH (por defecto: `22`)
- `DEPLOY_PATH` - Ruta donde se despliega (ej: `/opt/securepass`)
- `DOMAIN_NAME` - Tu dominio (ej: `tudominio.com`)

**Secrets de Base de Datos:**
- `MONGO_ROOT_USER` - Usuario admin de MongoDB
- `MONGO_ROOT_PASSWORD` - Contraseña segura de MongoDB
- `MONGO_DB_NAME` - Nombre de la base de datos (ej: `securepass`)
- `JWT_SECRET` - Secret para JWT (genera uno fuerte con `openssl rand -base64 32`)

**Otros Secrets (opcionales):**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `STRIPE_SECRET_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

#### Paso 3: Crear archivo .env en el servidor

Tu workflow de GitHub Actions ya está configurado para usar SSH. Necesitas crear el archivo `.env` en tu servidor manualmente una vez:

```bash
# Conéctate a tu servidor
ssh usuario@tu-servidor

# Crea el directorio del proyecto
mkdir -p /opt/securepass
cd /opt/securepass

# Crea el archivo .env con las credenciales
nano .env.production
```

Pega el contenido (ajusta los valores):

```env
# ============================================
# MongoDB Configuration
# ============================================
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=TU_PASSWORD_SUPER_SEGURO_AQUI
MONGO_DB_NAME=securepass
MONGODB_PORT=27017

# ============================================
# API Configuration
# ============================================
API_PORT=8000
NODE_ENV=production
JWT_SECRET=TU_JWT_SECRET_AQUI
JWT_EXPIRES_IN=7d

# ============================================
# Frontend Configuration
# ============================================
WEB_PORT=3000
REACT_APP_API=https://api.tudominio.com
FRONTEND_URL=https://tudominio.com

# ============================================
# Cloudinary Configuration (opcional)
# ============================================
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# ============================================
# Email Configuration (opcional)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=SecurePass <noreply@securepass.com>
EMAIL_SENDER=SecurePass
EMAIL_REPLY=support@securepass.com

# ============================================
# Payment Providers (opcional)
# ============================================
STRIPE_SECRET_KEY=sk_live_tu_clave_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=live

# ============================================
# Nginx Configuration
# ============================================
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# ============================================
# GitHub Container Registry
# ============================================
GITHUB_REPOSITORY=tu-usuario/tu-repo
```

#### Paso 4: Proteger el archivo .env

```bash
# Solo el propietario puede leer/escribir
chmod 600 .env.production

# Verificar permisos
ls -la .env.production
# Debería mostrar: -rw------- (600)
```

---

### Opción 2: Variables de Entorno del Sistema

En lugar de usar un archivo `.env`, puedes configurar las variables directamente en el sistema operativo del servidor.

#### Para Ubuntu/Debian (systemd):

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/securepass.service
```

Contenido:
```ini
[Unit]
Description=SecurePass Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/securepass
Environment="MONGO_ROOT_USER=admin"
Environment="MONGO_ROOT_PASSWORD=tu_password_seguro"
Environment="MONGO_DB_NAME=securepass"
Environment="JWT_SECRET=tu_jwt_secret"
# ... más variables ...

ExecStart=/usr/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.production.yml down

[Install]
WantedBy=multi-user.target
```

#### Para usar con Docker Compose:

```bash
# Exportar variables en el shell
export MONGO_ROOT_USER="admin"
export MONGO_ROOT_PASSWORD="tu_password_seguro"
# ... más variables ...

# Luego ejecutar docker-compose
docker-compose -f docker-compose.production.yml up -d
```

---

### Opción 3: Usar un Gestor de Secretos

Para mayor seguridad en producción a gran escala, considera usar:

#### AWS Secrets Manager
```bash
# Instalar AWS CLI
aws secretsmanager get-secret-value --secret-id securepass/mongodb --query SecretString --output text
```

#### HashiCorp Vault
```bash
# Leer secretos de Vault
vault kv get secret/securepass/mongodb
```

#### Docker Secrets (Docker Swarm)
```bash
echo "mi_password_seguro" | docker secret create mongo_password -
```

---

## 🔨 Scripts de Ayuda

### Script para generar contraseñas seguras

Guarda esto como `generate-credentials.sh`:

```bash
#!/bin/bash

echo "==================================="
echo "Generador de Credenciales Seguras"
echo "==================================="
echo ""

# Generar contraseña de MongoDB
MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "MONGO_ROOT_PASSWORD=$MONGO_PASSWORD"

# Generar JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
echo "JWT_SECRET=$JWT_SECRET"

# Generar token aleatorio
RANDOM_TOKEN=$(openssl rand -hex 32)
echo "RANDOM_TOKEN=$RANDOM_TOKEN"

echo ""
echo "⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro"
echo "⚠️  NO las compartas ni las subas a Git"
```

Ejecuta:
```bash
chmod +x generate-credentials.sh
./generate-credentials.sh
```

### Script para configurar el servidor

Guarda esto como `setup-production.sh`:

```bash
#!/bin/bash

echo "=========================================="
echo "Configuración de Servidor de Producción"
echo "=========================================="
echo ""

# Verificar que estamos en el servidor correcto
read -p "¿Estás en el servidor de producción? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cancelado"
    exit 1
fi

# Crear directorio del proyecto
echo "📁 Creando directorios..."
mkdir -p /opt/securepass
cd /opt/securepass

# Descargar docker-compose.production.yml desde el repo
echo "📥 Descargando configuración de Docker..."
# Aquí deberías clonar tu repo o copiar los archivos necesarios

# Crear archivo .env
echo "📝 Creando archivo .env.production..."
read -p "Usuario MongoDB (default: admin): " MONGO_USER
MONGO_USER=${MONGO_USER:-admin}

read -sp "Contraseña MongoDB: " MONGO_PASS
echo ""

read -p "Nombre de la base de datos (default: securepass): " MONGO_DB
MONGO_DB=${MONGO_DB:-securepass}

read -sp "JWT Secret (o presiona Enter para generar uno): " JWT_SECRET
echo ""
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    echo "✅ JWT Secret generado automáticamente"
fi

# Crear archivo .env.production
cat > .env.production << EOF
MONGO_ROOT_USER=$MONGO_USER
MONGO_ROOT_PASSWORD=$MONGO_PASS
MONGO_DB_NAME=$MONGO_DB
MONGODB_PORT=27017
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
API_PORT=8000
WEB_PORT=3000
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
GITHUB_REPOSITORY=$GITHUB_REPOSITORY
EOF

# Proteger el archivo
chmod 600 .env.production

echo "✅ Configuración completada"
echo ""
echo "Siguiente paso: Ejecuta 'docker-compose -f docker-compose.production.yml up -d'"
```

---

## 📋 Checklist de Seguridad

Antes de desplegar a producción, verifica:

- [ ] ✅ `.env` está en `.gitignore` (ya está configurado)
- [ ] ✅ Contraseñas fuertes generadas (mínimo 32 caracteres)
- [ ] ✅ Archivo `.env.production` con permisos 600 en el servidor
- [ ] ✅ GitHub Secrets configurados (para CI/CD)
- [ ] ✅ JWT_SECRET único y seguro
- [ ] ✅ Firewall configurado (solo puertos 80, 443, 22 abiertos)
- [ ] ✅ MongoDB solo accesible desde localhost (configurado en docker-compose)
- [ ] ✅ SSL/TLS configurado para HTTPS
- [ ] ✅ Backups automáticos de la base de datos configurados

---

## 🚀 Deployment Automático con GitHub Actions

Tu proyecto ya tiene configurado el workflow en `.github/workflows/deploy.yml`.

### Cómo funciona:

1. **Push a main/production** → Activa el workflow
2. **Build** → Construye imágenes Docker y las sube a GitHub Container Registry
3. **Deploy** → Se conecta por SSH al servidor y ejecuta:
   - `docker-compose pull` (descarga nuevas imágenes)
   - `docker-compose down` (detiene contenedores viejos)
   - `docker-compose up -d` (inicia nuevos contenedores)
4. **Health Check** → Verifica que API y Web estén funcionando
5. **Rollback automático** → Si algo falla, restaura la versión anterior

### Para que funcione necesitas:

1. Configurar GitHub Secrets (ver arriba)
2. Tener el archivo `.env.production` en el servidor
3. Docker y Docker Compose instalados en el servidor

---

## 🔍 Verificación

Después de configurar todo, verifica:

```bash
# En el servidor
cd /opt/securepass

# Verificar que el archivo .env existe y tiene permisos correctos
ls -la .env.production

# Verificar que las variables se cargan correctamente
docker-compose -f docker-compose.production.yml config

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🆘 Troubleshooting

### Error: "La variable X no está definida"
- Verifica que el archivo `.env.production` existe
- Verifica que todas las variables requeridas están definidas
- Verifica los permisos del archivo (debe ser 600)

### Error: "Cannot connect to MongoDB"
- Verifica que MONGO_ROOT_USER y MONGO_ROOT_PASSWORD son correctos
- Verifica que el contenedor de MongoDB está corriendo: `docker ps`
- Verifica los logs: `docker-compose logs mongodb`

### Deployment falla en GitHub Actions
- Verifica que todos los GitHub Secrets están configurados
- Verifica que la llave SSH tiene los permisos correctos
- Verifica que el servidor es accesible desde GitHub

---

## 📞 Contacto

Si necesitas ayuda, revisa:
- Logs del servidor: `docker-compose logs`
- Estado de contenedores: `docker ps -a`
- Espacio en disco: `df -h`
