# 🔐 Configuración CI/CD - Credenciales y Accesos

## 📋 Resumen

Este documento describe las credenciales y configuración necesaria para el pipeline CI/CD automático con Docker y GitHub Actions.

---

## 🚀 Flujo de Auto-Despliegue

### ¿Cómo funciona?

1. **Push a Git** → Al hacer `git push` a las ramas `main`, `production` o `claude/**`
2. **Tests automáticos** → Se ejecutan tests y validaciones
3. **Build de imágenes Docker** → Se construyen las imágenes de API y Web
4. **Push a Registry** → Las imágenes se suben a GitHub Container Registry
5. **Validación** → Se verifica que las imágenes se construyeron correctamente
6. **Deploy** → Si todo es exitoso, se despliega automáticamente al servidor
7. **Health Checks** → Se verifica que los servicios estén funcionando
8. **Rollback automático** → Si algo falla, se revierte a la versión anterior

### Características de seguridad

✅ **No se despliega si hay errores** en la construcción de imágenes
✅ **Health checks obligatorios** antes de confirmar el despliegue
✅ **Rollback automático** si fallan los health checks
✅ **Validación de tests** (cuando estén configurados)
✅ **Imágenes multi-stage** para optimización y seguridad
✅ **Usuario no-root** en contenedores de producción

---

## 🔑 Credenciales Requeridas

### 1. GitHub Secrets

Estas credenciales deben configurarse en tu repositorio de GitHub:

**Ir a:** `Settings → Secrets and variables → Actions → New repository secret`

| Secret Name      | Descripción                                | Ejemplo                                  | Obligatorio                      |
| ---------------- | ------------------------------------------ | ---------------------------------------- | -------------------------------- |
| `SERVER_HOST`    | IP o dominio del servidor de producción    | `123.45.67.89` o `miservidor.com`        | ✅ Sí                            |
| `SERVER_USER`    | Usuario SSH para deployment                | `securepass` o `ubuntu`                  | ✅ Sí                            |
| `SERVER_SSH_KEY` | Clave SSH privada completa                 | `-----BEGIN OPENSSH PRIVATE KEY-----...` | ✅ Sí                            |
| `SERVER_PORT`    | Puerto SSH del servidor                    | `22`                                     | ❌ No (default: 22)              |
| `DEPLOY_PATH`    | Ruta donde está el proyecto en el servidor | `/opt/securepass`                        | ❌ No (default: /opt/securepass) |
| `DOMAIN_NAME`    | Dominio principal                          | `miapp.com`                              | ❌ No (solo para URLs)           |

### 2. Variables de Entorno del Servidor

Archivo: `/opt/securepass/.env` en el servidor de producción

```bash
# ============================================
# GitHub Container Registry
# ============================================
GITHUB_REPOSITORY=rvelez140/segurepas-prueba

# ============================================
# MongoDB Credentials
# ============================================
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=TuPasswordSeguroAqui123!
MONGO_DB_NAME=securepass
MONGODB_PORT=27017

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET=tu-super-secreto-jwt-muy-largo-y-aleatorio-12345
JWT_EXPIRES_IN=7d

# ============================================
# API Configuration
# ============================================
API_PORT=8000

# ============================================
# Frontend Configuration
# ============================================
WEB_PORT=3000
REACT_APP_API=https://api.tudominio.com/api
FRONTEND_URL=https://tudominio.com

# ============================================
# Email Configuration (Gmail)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-generado-en-gmail

# ============================================
# Google OAuth
# ============================================
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop

# ============================================
# Cloudinary (para subir archivos)
# ============================================
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# ============================================
# Nginx
# ============================================
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### 3. Acceso SSH al Servidor

#### Generar clave SSH para GitHub Actions

```bash
# En el servidor de producción
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Agregar clave pública a authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Mostrar clave PRIVADA (copiar TODO para GitHub Secret)
cat ~/.ssh/github_actions
```

⚠️ **IMPORTANTE:** Copia la clave PRIVADA completa (incluyendo `-----BEGIN` y `-----END`) y guárdala como Secret `SERVER_SSH_KEY` en GitHub.

---

## 🎯 Configuración Paso a Paso

### Paso 1: Preparar el Servidor

```bash
# Conectar al servidor
ssh user@tu-servidor.com

# Crear directorio de deployment
sudo mkdir -p /opt/securepass
sudo chown -R $USER:$USER /opt/securepass

# Instalar Docker y Docker Compose (si no están instalados)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### Paso 2: Clonar el Repositorio

```bash
cd /opt/securepass
git clone https://github.com/rvelez140/segurepas-prueba.git .

# O si ya existe, hacer pull
git pull origin main
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar ejemplo y editar
cp .env.production.example .env
nano .env

# Completar TODAS las variables con valores reales
```

### Paso 4: Configurar GitHub Secrets

1. Ve a tu repositorio: https://github.com/rvelez140/segurepas-prueba
2. Click en `Settings` → `Secrets and variables` → `Actions`
3. Click en `New repository secret`
4. Agrega cada uno de los secrets mencionados arriba

**Ejemplo para SERVER_SSH_KEY:**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBK9...
... (todo el contenido de la clave)
-----END OPENSSH PRIVATE KEY-----
```

### Paso 5: Probar el Workflow

```bash
# En tu máquina local
git add .
git commit -m "Configure CI/CD pipeline"
git push origin main

# Monitorear el deployment
# Ir a: https://github.com/rvelez140/segurepas-prueba/actions
```

---

## 📊 Monitoreo del Deployment

### Ver logs en GitHub Actions

1. Ve a: https://github.com/rvelez140/segurepas-prueba/actions
2. Click en el workflow en ejecución
3. Verás 3 jobs:
   - **Run Tests** - Validaciones y tests
   - **Build Docker Images** - Construcción de imágenes
   - **Deploy to Production** - Despliegue al servidor

### Ver logs en el servidor

```bash
# Conectar al servidor
ssh user@tu-servidor.com

# Ver logs de todos los servicios
cd /opt/securepass
docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml logs -f web

# Ver estado de contenedores
docker-compose -f docker-compose.production.yml ps
```

---

## 🔄 ¿Qué pasa si falla el Deployment?

### Rollback Automático

Si el deployment falla (por ejemplo, si un healthcheck no pasa), el sistema:

1. **Detecta el fallo** mediante health checks
2. **Detiene los contenedores nuevos** que están fallando
3. **Restaura la versión anterior** automáticamente
4. **Muestra logs** de los errores para debugging

### Ver qué salió mal

```bash
# En el servidor
cd /opt/securepass

# Ver logs de los contenedores
docker-compose -f docker-compose.production.yml logs --tail=100

# Ver estado de los contenedores
docker-compose -f docker-compose.production.yml ps
```

---

## 🧪 Verificación Manual

### Verificar que los servicios están corriendo

```bash
# Health check de API
curl http://localhost:48721/health

# Health check de Web
curl http://localhost:52341/health

# Verificar desde fuera del servidor
curl https://api.tudominio.com/health
curl https://tudominio.com/health
```

### Verificar imágenes Docker

```bash
# Ver imágenes descargadas
docker images | grep ghcr.io/rvelez140/segurepas-prueba

# Debería mostrar algo como:
# ghcr.io/rvelez140/segurepas-prueba/api   latest   abc123   2 hours ago   150MB
# ghcr.io/rvelez140/segurepas-prueba/web   latest   def456   2 hours ago   25MB
```

---

## 🎛️ Comandos Útiles

### Deployment Manual (sin GitHub Actions)

```bash
# Conectar al servidor
ssh user@tu-servidor.com
cd /opt/securepass

# Pull de cambios
git pull origin main

# Rebuild y restart de servicios
docker-compose -f docker-compose.production.yml up -d --build
```

### Rollback Manual

```bash
# Volver a un commit anterior
git log --oneline -10
git checkout <commit-hash>

# Redeployar
docker-compose -f docker-compose.production.yml up -d --build

# Volver a main
git checkout main
```

### Limpiar sistema

```bash
# Limpiar contenedores parados
docker container prune -f

# Limpiar imágenes antiguas
docker image prune -af

# Limpiar todo (cuidado!)
docker system prune -af --volumes
```

---

## 📧 Cómo obtener las credenciales

### Email (Gmail App Password)

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (habilítala si no está)
3. Contraseñas de aplicaciones → Generar nueva
4. Selecciona "Correo" y "Otro"
5. Copia el password generado (16 caracteres)
6. Úsalo en `EMAIL_PASSWORD`

### Google OAuth

1. Ve a: https://console.cloud.google.com/
2. Crea un proyecto nuevo o selecciona uno existente
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `http://localhost:52341/auth/google/callback`
   - `https://tudominio.com/auth/google/callback`
6. Copia `Client ID` y `Client Secret`

### Cloudinary

1. Ve a: https://cloudinary.com/
2. Crea una cuenta gratuita
3. Dashboard → Muestra tu:
   - `Cloud name`
   - `API Key`
   - `API Secret`

### MongoDB Password

```bash
# Generar password seguro
openssl rand -base64 32
```

### JWT Secret

```bash
# Generar JWT secret seguro
openssl rand -base64 64
```

---

## 🔒 Seguridad

### Buenas prácticas implementadas

- ✅ Contenedores corren con usuario no-root
- ✅ Multi-stage builds para reducir tamaño
- ✅ Health checks en todos los servicios
- ✅ Secrets no están en el código
- ✅ Comunicación entre servicios por red interna
- ✅ Logs con rotación automática
- ✅ HTTPS recomendado con Let's Encrypt
- ✅ Rollback automático ante fallos

### Checklist de seguridad

- [ ] Cambiar TODAS las passwords por defecto
- [ ] Usar passwords fuertes (min 16 caracteres)
- [ ] Configurar firewall en el servidor
- [ ] Configurar SSL/TLS con Let's Encrypt
- [ ] No exponer puertos de MongoDB públicamente
- [ ] Mantener Docker y Docker Compose actualizados
- [ ] Revisar logs regularmente
- [ ] Hacer backups de la base de datos

---

## 🆘 Troubleshooting

### Error: "Permission denied (publickey)"

**Solución:** Verifica que la clave SSH está correcta en GitHub Secrets

```bash
# En el servidor, verificar que la clave pública está en authorized_keys
cat ~/.ssh/authorized_keys | grep github-actions
```

### Error: "docker: command not found"

**Solución:** Instalar Docker en el servidor

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Error: Health check failed

**Solución:** Ver logs del servicio

```bash
docker-compose -f docker-compose.production.yml logs api
docker-compose -f docker-compose.production.yml logs web
```

### El deployment se ejecuta pero el sitio no carga

1. Verificar que los contenedores están corriendo:

```bash
docker-compose -f docker-compose.production.yml ps
```

2. Verificar logs:

```bash
docker-compose -f docker-compose.production.yml logs
```

3. Verificar health endpoints:

```bash
curl http://localhost:48721/health
curl http://localhost:52341/health
```

---

## 📝 Resumen de Credenciales

### Credenciales que necesitas obtener:

1. **Servidor SSH:**
   - IP/Dominio del servidor
   - Usuario SSH
   - Clave SSH privada

2. **Email (Gmail):**
   - Correo
   - App Password

3. **Google OAuth:**
   - Client ID
   - Client Secret

4. **Cloudinary:**
   - Cloud Name
   - API Key
   - API Secret

5. **Generar localmente:**
   - MongoDB password (random)
   - JWT secret (random)

### Dónde configurar cada credencial:

| Credencial         | Ubicación                          | Formato                |
| ------------------ | ---------------------------------- | ---------------------- |
| SERVER_HOST        | GitHub Secrets                     | IP o dominio           |
| SERVER_USER        | GitHub Secrets                     | Nombre de usuario      |
| SERVER_SSH_KEY     | GitHub Secrets                     | Clave privada completa |
| Resto de variables | `/opt/securepass/.env` en servidor | Ver ejemplo arriba     |

---

## ✅ Checklist de Configuración

- [ ] Servidor preparado con Docker instalado
- [ ] Repositorio clonado en `/opt/securepass`
- [ ] Archivo `.env` configurado con todas las variables
- [ ] Clave SSH generada y agregada a authorized_keys
- [ ] GitHub Secrets configurados (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)
- [ ] Credenciales de terceros obtenidas (Gmail, Google OAuth, Cloudinary)
- [ ] Primer deployment manual exitoso
- [ ] GitHub Actions workflow probado
- [ ] Health checks funcionando correctamente
- [ ] SSL/HTTPS configurado (opcional pero recomendado)

---

## 🎉 ¡Listo!

Una vez completada toda la configuración, tu pipeline CI/CD estará funcionando:

1. Haces `git push` a `main` o `production`
2. GitHub Actions automáticamente:
   - Ejecuta tests
   - Construye imágenes Docker
   - Despliega al servidor
   - Verifica que todo funcione
   - Si algo falla, hace rollback automático

**No necesitas hacer nada más.** El deployment es 100% automático y seguro.
