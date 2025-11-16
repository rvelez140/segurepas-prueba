# 🏢 SecurePass Multi-Tenant - Guía Completa

## 📋 Tabla de Contenidos

1. [Descripción](#descripción)
2. [Características Multi-Tenant](#características-multi-tenant)
3. [Requisitos](#requisitos)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Uso con Docker](#uso-con-docker)
7. [Migración de Datos](#migración-de-datos)
8. [API Endpoints](#api-endpoints)
9. [Panel de Administración](#panel-de-administración)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Descripción

SecurePass es ahora una aplicación **multi-tenant** que permite gestionar múltiples empresas/organizaciones desde una única instalación. Cada empresa tiene:

- ✅ Sus propios usuarios, residentes y guardias
- ✅ Base de datos aislada por empresa
- ✅ Logo personalizado
- ✅ Configuración de colores (branding)
- ✅ Plan de suscripción (free, basic, premium, enterprise)
- ✅ Límites configurables de usuarios y residentes

---

## 🎯 Características Multi-Tenant

### Aislamiento de Datos
- Cada empresa tiene acceso únicamente a sus propios datos
- Middleware automático de filtrado por empresa
- Validación estricta de permisos

### Personalización por Empresa
- **Logo personalizado**: Subido y almacenado en Cloudinary
- **Colores**: Tema personalizable (primario y secundario)
- **Subdominio único**: `empresa1.securepass.com`
- **Configuración de email**: Dominios permitidos

### Planes de Suscripción
| Plan | Usuarios | Residentes | Precio |
|------|----------|------------|--------|
| Free | 10 | 50 | Gratis |
| Basic | 50 | 200 | $29/mes |
| Premium | 200 | 1000 | $99/mes |
| Enterprise | Ilimitado | Ilimitado | Custom |

---

## 💻 Requisitos

### Software Requerido
- **Docker**: 20.10 o superior
- **Docker Compose**: 2.0 o superior
- **Node.js**: 18+ (solo para desarrollo sin Docker)
- **MongoDB**: 7.0 (incluido en Docker)

### Servicios Externos
- **Cloudinary**: Para almacenamiento de imágenes (logos)
  - [Crear cuenta gratuita](https://cloudinary.com/users/register/free)
- **SMTP**: Para envío de emails (Gmail, SendGrid, etc.)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/securepass.git
cd securepass/secure-pass-docker-main
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

**Variables Críticas a Configurar:**

```env
# MongoDB
MONGO_ROOT_PASSWORD=tu-password-seguro

# JWT
JWT_SECRET=tu-jwt-secret-muy-largo-y-aleatorio

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

### 3. Crear Directorios Necesarios

```bash
# Crear directorio para SSL (si usarás HTTPS)
mkdir -p nginx/ssl

# Dar permisos
chmod 755 nginx
```

---

## ⚙️ Configuración

### Cloudinary Setup

1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Ir a Dashboard > Settings > Security
3. Copiar: Cloud Name, API Key, API Secret
4. Agregar a `.env`

### Email Setup (Gmail)

1. Activar verificación en 2 pasos en tu cuenta Google
2. Generar App Password: [support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833)
3. Usar el password generado en `EMAIL_PASSWORD`

---

## 🐳 Uso con Docker

### Modo Desarrollo

```bash
# Iniciar todos los servicios
docker-compose up

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

**Acceder a:**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- MongoDB: localhost:27017

### Modo Producción

```bash
# Configurar variables de producción
export NODE_ENV=production
export BUILD_TARGET=production

# Construir y ejecutar
docker-compose up -d --build

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f api web
```

### Comandos Útiles

```bash
# Reconstruir solo un servicio
docker-compose up -d --build api

# Ejecutar comando en contenedor
docker-compose exec api npm run migrate

# Ver uso de recursos
docker stats

# Limpiar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v

# Backup de MongoDB
docker-compose exec mongodb mongodump --out=/data/backup

# Restaurar MongoDB
docker-compose exec mongodb mongorestore /data/backup
```

---

## 🔄 Migración de Datos

Si tienes datos existentes de la versión anterior (sin multi-tenant), ejecuta:

```bash
# Opción 1: Usando Docker
docker-compose exec api npm run migrate

# Opción 2: Localmente
cd apps/api
npm run migrate
```

**¿Qué hace el script?**
1. Crea una empresa por defecto
2. Asigna todos los usuarios existentes a esa empresa
3. Asigna todas las visitas existentes a esa empresa
4. Reporta estadísticas de migración

**Salida esperada:**
```
🚀 Iniciando migración a multi-tenant...
✅ Empresa creada: Mi Empresa (default)
✅ 25 usuarios actualizados
✅ 150 visitas actualizadas

📊 RESUMEN DE MIGRACIÓN:
   Empresa: Mi Empresa
   Subdominio: default
   Total usuarios: 25
   Total visitas: 150
```

---

## 🌐 API Endpoints

### Empresas (Companies)

#### Públicas

```http
GET /api/companies/subdomain/:subdomain
```
Obtener información de empresa por subdominio

#### Protegidas (requieren autenticación)

```http
# Obtener empresa del usuario actual
GET /api/companies/current
Authorization: Bearer {token}

# Crear empresa (solo admin)
POST /api/companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mi Empresa",
  "subdomain": "mi-empresa",
  "contact": {
    "email": "contacto@empresa.com",
    "phone": "+1809-000-0000"
  },
  "subscription": {
    "plan": "basic",
    "maxUsers": 50,
    "maxResidents": 200
  }
}

# Listar todas las empresas (solo admin)
GET /api/companies
Authorization: Bearer {token}

# Obtener empresa por ID (solo admin)
GET /api/companies/:id
Authorization: Bearer {token}

# Actualizar empresa (solo admin)
PUT /api/companies/:id
Authorization: Bearer {token}

# Subir logo (solo admin)
POST /api/companies/:id/logo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
  logo: [archivo imagen]

# Eliminar logo (solo admin)
DELETE /api/companies/:id/logo
Authorization: Bearer {token}

# Actualizar suscripción (solo admin)
PUT /api/companies/:id/subscription
Authorization: Bearer {token}

{
  "plan": "premium",
  "maxUsers": 200,
  "isActive": true
}

# Desactivar empresa (solo admin)
DELETE /api/companies/:id
Authorization: Bearer {token}
```

### Ejemplo de Uso

```javascript
// Crear empresa
const response = await fetch('http://localhost:8000/api/companies', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Residencial Las Palmas',
    subdomain: 'las-palmas',
    contact: {
      email: 'admin@laspalmas.com',
      phone: '+1809-123-4567'
    },
    settings: {
      primaryColor: '#2ecc71',
      secondaryColor: '#27ae60'
    }
  })
});

// Subir logo
const formData = new FormData();
formData.append('logo', logoFile);

const logoResponse = await fetch(`http://localhost:8000/api/companies/${companyId}/logo`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

---

## 🎨 Panel de Administración

### Acceso al Panel

1. Iniciar sesión como administrador
2. Navegar a `/admin/companies` (pendiente de implementar en frontend)

### Funcionalidades

- ✅ Crear nuevas empresas
- ✅ Editar información de empresas
- ✅ Subir/cambiar logos
- ✅ Configurar colores de branding
- ✅ Gestionar planes de suscripción
- ✅ Ver estadísticas por empresa
- ✅ Activar/desactivar empresas

---

## 🔧 Troubleshooting

### Problema: No se conecta a MongoDB

**Solución:**
```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb
```

### Problema: Error al subir logo

**Posibles causas:**
1. Credenciales de Cloudinary incorrectas
2. Límite de tamaño excedido (max: 10MB)
3. Formato de imagen no soportado

**Solución:**
```bash
# Verificar variables de Cloudinary
docker-compose exec api printenv | grep CLOUDINARY

# Ver logs detallados
docker-compose logs -f api
```

### Problema: "Empresa no encontrada"

**Solución:**
```bash
# Ejecutar migración
docker-compose exec api npm run migrate

# Verificar empresas en BD
docker-compose exec mongodb mongosh
> use securepass
> db.companies.find()
```

### Problema: Usuarios no pueden ver datos

**Causa:** Usuario sin empresa asignada

**Solución:**
```bash
# Verificar usuario
docker-compose exec mongodb mongosh
> use securepass
> db.users.find({ email: "usuario@example.com" })

# Asignar empresa manualmente
> db.users.updateOne(
    { email: "usuario@example.com" },
    { $set: { company: ObjectId("company_id_aqui") } }
  )
```

---

## 📊 Monitoreo

### Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo API
docker-compose logs -f api

# Solo Web
docker-compose logs -f web

# Solo MongoDB
docker-compose logs -f mongodb
```

### Métricas de Contenedores

```bash
# Ver uso de recursos
docker stats

# Espacio en disco
docker system df

# Ver volúmenes
docker volume ls
```

---

## 🔐 Seguridad

### Mejores Prácticas

1. **Cambiar secrets en producción:**
   - `MONGO_ROOT_PASSWORD`
   - `JWT_SECRET`
   - Todas las credenciales

2. **Usar HTTPS:**
   - Configurar certificados SSL
   - Descomentar sección HTTPS en `nginx/nginx.conf`

3. **Firewall:**
   ```bash
   # Permitir solo puertos necesarios
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw deny 27017/tcp  # MongoDB solo interno
   ```

4. **Backups automáticos:**
   ```bash
   # Crear script de backup
   #!/bin/bash
   docker-compose exec mongodb mongodump --out=/data/backup-$(date +%Y%m%d)
   ```

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/securepass/issues)
- **Documentación**: [Wiki](https://github.com/tu-usuario/securepass/wiki)
- **Email**: support@securepass.com

---

## 📝 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

## 🎉 ¡Listo!

Tu instalación multi-tenant de SecurePass está completa. Disfruta gestionando múltiples empresas desde una única plataforma.

**¿Necesitas ayuda?** Abre un issue en GitHub o consulta la documentación completa.
