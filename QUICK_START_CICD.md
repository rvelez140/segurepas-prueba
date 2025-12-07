# 🚀 Inicio Rápido - CI/CD Auto-Despliegue

## ⚡ Resumen en 30 segundos

Este proyecto tiene **auto-despliegue configurado**:
- ✅ Push a `main` o `production` → Deploy automático
- ✅ Tests y validaciones antes de deployar
- ✅ Health checks obligatorios
- ✅ Rollback automático si algo falla

---

## 📋 Credenciales Mínimas Requeridas

### GitHub Secrets (Settings → Secrets → Actions)

```
SERVER_HOST=123.45.67.89           # IP de tu servidor
SERVER_USER=ubuntu                 # Usuario SSH
SERVER_SSH_KEY=-----BEGIN...       # Clave SSH privada completa
```

### Archivo .env en el servidor (/opt/securepass/.env)

```bash
# Repositorio
GITHUB_REPOSITORY=rvelez140/segurepas-prueba

# MongoDB
MONGO_ROOT_PASSWORD=password-seguro-aqui

# JWT
JWT_SECRET=secret-muy-largo-y-aleatorio-aqui

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=app-password-de-gmail

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# URLs
FRONTEND_URL=https://tudominio.com
REACT_APP_API_URL=https://api.tudominio.com/api
```

---

## 🎯 Setup en 5 Pasos

### 1️⃣ Preparar Servidor

```bash
ssh root@tu-servidor

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Crear directorio
sudo mkdir -p /opt/securepass
sudo chown -R $USER /opt/securepass
```

### 2️⃣ Generar Clave SSH

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Copiar esta clave PRIVADA para GitHub Secret
cat ~/.ssh/github_actions
```

### 3️⃣ Configurar GitHub Secrets

Ve a: `https://github.com/rvelez140/segurepas-prueba/settings/secrets/actions`

Agrega:
- `SERVER_HOST` → IP del servidor
- `SERVER_USER` → Usuario SSH
- `SERVER_SSH_KEY` → Contenido de `~/.ssh/github_actions`

### 4️⃣ Clonar y Configurar

```bash
cd /opt/securepass
git clone https://github.com/rvelez140/segurepas-prueba.git .

# Configurar variables
cp .env.production.example .env
nano .env  # Completar con tus credenciales
```

### 5️⃣ Primer Deploy

```bash
# Desde tu máquina local
git add .
git commit -m "Configure CI/CD"
git push origin main

# Monitorear en: https://github.com/rvelez140/segurepas-prueba/actions
```

---

## 🎮 Cómo Usar

### Deploy Automático

```bash
# Cualquier push a estas ramas activa el deploy
git push origin main
git push origin production
git push origin claude/mi-feature
```

### Verificar Deployment

```bash
# En el servidor
docker-compose -f docker-compose.production.yml ps

# Health checks
curl http://localhost:8000/health  # API
curl http://localhost:3000/health  # Web
```

### Ver Logs

```bash
# Logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Logs de API
docker-compose -f docker-compose.production.yml logs -f api

# Logs de Web
docker-compose -f docker-compose.production.yml logs -f web
```

---

## 🔄 Pipeline CI/CD

```
Push to Git
    ↓
┌─────────────────┐
│  Run Tests      │  ← Ejecuta tests (si existen)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Build Images   │  ← Construye Docker images
│  - API          │
│  - Web          │
└────────┬────────┘
         ↓
    ¿Exitoso?
    ├─ NO → ❌ STOP (no deploy)
    └─ SÍ ↓
┌─────────────────┐
│  Push to GHCR   │  ← Sube imágenes a registry
└────────┬────────┘
         ↓
┌─────────────────┐
│  Deploy         │  ← Despliega al servidor
│  1. Pull images │
│  2. Stop old    │
│  3. Start new   │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Health Checks  │  ← Verifica servicios
│  - API: /health │
│  - Web: /health │
└────────┬────────┘
         ↓
    ¿Healthy?
    ├─ NO → 🔄 ROLLBACK
    └─ SÍ → ✅ SUCCESS
```

---

## ⚠️ ¿Qué evita el Auto-Despliegue?

El sistema **NO desplegará** si:
- ❌ Falla la construcción de imágenes Docker
- ❌ Tests fallan (cuando estén configurados)
- ❌ Health check de API falla
- ❌ Health check de Web falla
- ❌ Error en la conexión SSH

Si algo falla **DESPUÉS** del deploy:
- 🔄 **Rollback automático** a versión anterior
- 📋 Logs disponibles en GitHub Actions

---

## 🔐 Credenciales - Resumen

| Credencial | Dónde Obtenerla | Dónde Configurarla |
|-----------|-----------------|-------------------|
| **SERVER_HOST** | IP de tu servidor VPS | GitHub Secrets |
| **SERVER_USER** | Usuario del servidor | GitHub Secrets |
| **SERVER_SSH_KEY** | `ssh-keygen` | GitHub Secrets |
| **EMAIL_PASSWORD** | [Gmail App Passwords](https://myaccount.google.com/apppasswords) | .env en servidor |
| **GOOGLE_CLIENT_ID/SECRET** | [Google Cloud Console](https://console.cloud.google.com) | .env en servidor |
| **CLOUDINARY_***  | [Cloudinary Dashboard](https://cloudinary.com/console) | .env en servidor |
| **MONGO_ROOT_PASSWORD** | Generar: `openssl rand -base64 32` | .env en servidor |
| **JWT_SECRET** | Generar: `openssl rand -base64 64` | .env en servidor |

---

## 🆘 Problemas Comunes

### "Permission denied (publickey)"
→ Verificar que `SERVER_SSH_KEY` en GitHub Secrets es correcto

### "Health check failed"
→ Ver logs: `docker-compose logs api` / `docker-compose logs web`

### "Connection refused"
→ Verificar firewall: `sudo ufw allow 22,80,443/tcp`

### El sitio no carga después del deploy
```bash
# Verificar estado
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs
```

---

## 📚 Documentación Completa

- **Guía Detallada:** [CICD_SETUP.md](./CICD_SETUP.md)
- **Deployment Manual:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## ✅ Checklist Final

- [ ] Docker instalado en servidor
- [ ] Proyecto clonado en `/opt/securepass`
- [ ] `.env` configurado con todas las credenciales
- [ ] Clave SSH generada
- [ ] GitHub Secrets configurados (3 mínimo)
- [ ] Primer push a main realizado
- [ ] Workflow ejecutado exitosamente
- [ ] Servicios corriendo: `docker-compose ps`

---

## 🎉 ¡Todo Listo!

Ahora cada vez que hagas:

```bash
git push origin main
```

Se ejecutará automáticamente:
1. ✅ Tests
2. ✅ Build de imágenes
3. ✅ Deploy al servidor
4. ✅ Health checks
5. ✅ Rollback si falla

**¡Deployment 100% automático y seguro!** 🚀
