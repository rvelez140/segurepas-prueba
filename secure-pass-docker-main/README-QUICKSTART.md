# 🚀 SecurePass - Inicio Rápido

¡Pon en marcha SecurePass Multi-Tenant en **menos de 5 minutos**!

---

## ⚡ Inicio Ultra-Rápido (3 comandos)

```bash
# 1. Clonar o navegar al directorio
cd secure-pass-docker-main

# 2. Dar permisos a scripts
chmod +x start.sh stop.sh help.sh

# 3. ¡INICIAR!
./start.sh
```

**¡Listo!** 🎉

- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:8000
- 🗄️ MongoDB: localhost:27017

---

## 📝 Configuración Opcional (Recomendado)

Si quieres usar **logos personalizados** y **envío de emails**, configura estas variables en `.env`:

```bash
# Editar archivo .env
nano .env

# Agregar credenciales de Cloudinary (para logos)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Agregar credenciales de Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

### Obtener Credenciales de Cloudinary (Gratis)

1. Crear cuenta: https://cloudinary.com/users/register/free
2. Dashboard → Settings → Access Keys
3. Copiar: Cloud Name, API Key, API Secret

### Obtener App Password de Gmail

1. Activar 2FA en tu cuenta Google
2. Generar App Password: https://myaccount.google.com/apppasswords
3. Copiar el password de 16 caracteres

---

## 🎮 Comandos Principales

### Usando Scripts (Más Fácil)

```bash
./start.sh          # Iniciar SecurePass
./stop.sh           # Detener SecurePass
./help.sh           # Ver ayuda completa
```

### Usando Make (Más Poderoso)

```bash
make start          # Iniciar
make stop           # Detener
make restart        # Reiniciar
make logs           # Ver logs
make status         # Ver estado

# Ver todos los comandos
make help
```

---

## 🏢 Crear tu Primera Empresa

### Opción 1: Migrar Datos Existentes

Si tienes datos de la versión anterior (sin multi-tenant):

```bash
make migrate
```

### Opción 2: Crear Empresa Manualmente via API

```bash
# Login como admin (obtener token)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "tu-password"
  }'

# Crear empresa
curl -X POST http://localhost:8000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Mi Residencial",
    "subdomain": "mi-residencial",
    "contact": {
      "email": "admin@miresidencial.com",
      "phone": "+1809-123-4567"
    },
    "subscription": {
      "plan": "premium",
      "maxUsers": 100,
      "maxResidents": 500
    }
  }'
```

---

## 📊 Verificar que Todo Funciona

### 1. Ver Estado de Servicios

```bash
make status
```

Deberías ver algo como:
```
Name                    State    Ports
securepass-api          Up       0.0.0.0:8000->8000/tcp
securepass-web          Up       0.0.0.0:3000->3000/tcp
securepass-mongodb      Up       0.0.0.0:27017->27017/tcp
```

### 2. Probar el API

```bash
curl http://localhost:8000/
```

Deberías ver la página de bienvenida del API.

### 3. Abrir el Frontend

Navega a: http://localhost:3000

---

## 🛑 Detener SecurePass

```bash
# Opción 1: Script
./stop.sh

# Opción 2: Make
make stop

# Opción 3: Docker Compose directo
docker-compose down
```

---

## 🔍 Ver Logs

### Todos los servicios

```bash
make logs
```

### Solo un servicio

```bash
make logs-api        # API backend
make logs-web        # Frontend
make logs-db         # MongoDB
```

### Logs de un momento específico

```bash
docker-compose logs --tail=100 api    # Últimas 100 líneas
docker-compose logs --since=10m api   # Últimos 10 minutos
```

---

## 💾 Backup y Restauración

### Crear Backup

```bash
make backup
```

El backup se guarda en el contenedor de MongoDB con timestamp.

### Restaurar Backup

```bash
# Listar backups disponibles
docker-compose exec mongodb ls /data/

# Restaurar un backup específico
make restore BACKUP_DATE=20240101-120000
```

---

## 🐛 Troubleshooting Rápido

### Puerto ya en uso

```bash
# Cambiar puertos en .env
WEB_PORT=3001
API_PORT=8001
MONGODB_PORT=27018

# Reiniciar
make restart
```

### MongoDB no inicia

```bash
# Ver logs
make logs-db

# Limpiar y reiniciar
docker-compose down -v
make start
```

### Reconstruir desde cero

```bash
# Detener todo
make stop

# Limpiar (¡CUIDADO! Borra datos)
docker-compose down -v

# Reconstruir
make build

# Iniciar
make start
```

---

## 📚 Más Información

- **Documentación completa:** [README-MULTITENANT.md](README-MULTITENANT.md)
- **Documentación original:** [README.md](README.md)
- **Ver todos los comandos:** `make help` o `./help.sh`

---

## 🎯 Modo Desarrollo vs Producción

### Desarrollo (por defecto)

- ✅ Hot-reload activado
- ✅ Logs detallados
- ✅ Source maps
- ⚠️ No optimizado

```bash
make dev
```

### Producción

- ✅ Optimizado y minificado
- ✅ Imágenes más pequeñas
- ✅ Mejor rendimiento
- ⚠️ Sin hot-reload

```bash
make prod
```

---

## 🔐 Seguridad

### Passwords por Defecto (¡CAMBIAR EN PRODUCCIÓN!)

```env
MONGO_ROOT_PASSWORD=securepass2024
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Cambiar Passwords

1. Editar `.env`
2. Cambiar `MONGO_ROOT_PASSWORD` y `JWT_SECRET`
3. Reiniciar: `make restart`

---

## ⚙️ Configuración Avanzada

### Variables de Entorno Disponibles

Ver todas las variables en: `.env.example`

Principales:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno | `development` |
| `API_PORT` | Puerto API | `8000` |
| `WEB_PORT` | Puerto Web | `3000` |
| `MONGODB_PORT` | Puerto MongoDB | `27017` |
| `JWT_SECRET` | Secret para JWT | (cambiar) |
| `CLOUDINARY_*` | Credenciales Cloudinary | (configurar) |
| `EMAIL_*` | Config Email | (configurar) |

---

## 🚀 Despliegue en Producción

### Preparación

1. Configurar todas las variables en `.env`
2. Cambiar passwords y secrets
3. Configurar SSL/HTTPS en Nginx

### Iniciar en Producción

```bash
# Build de producción
export NODE_ENV=production
export BUILD_TARGET=production

# Construir
docker-compose build

# Iniciar en background
docker-compose up -d

# Verificar
make status
make logs
```

---

## 📞 Ayuda y Soporte

- **Comando rápido:** `./help.sh` o `make help`
- **Issues:** GitHub Issues
- **Documentación:** README-MULTITENANT.md

---

## 🎊 ¡Todo Listo!

Ya tienes SecurePass Multi-Tenant corriendo. Ahora puedes:

1. ✅ Crear empresas vía API
2. ✅ Subir logos personalizados
3. ✅ Gestionar múltiples organizaciones
4. ✅ Escalar según necesites

**¿Siguiente paso?** Lee la [documentación completa](README-MULTITENANT.md) para aprovechar todas las funcionalidades.

---

**Versión:** 1.0.0
**Fecha:** 2024
**Licencia:** MIT
