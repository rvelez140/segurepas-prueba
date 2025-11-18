# SecurePass | Sistema de Control de Acceso 🏠🔐

## 📌 Sistema Multi-Tenant de Gestión de Visitantes

**Repositorio monorepo** con arquitectura multi-empresa que permite gestionar múltiples organizaciones desde una única instalación.

### ✨ Nuevo: Arquitectura Multi-Tenant + Docker

SecurePass ahora soporta **múltiples empresas** con:
- ✅ Aislamiento completo de datos por empresa
- ✅ Logos y branding personalizados
- ✅ Planes de suscripción configurables
- ✅ Despliegue completo con Docker Compose
- ✅ Scripts de inicio simplificados

---

## 🚀 Inicio Rápido (Docker - Recomendado)

**¿Primera vez usando SecurePass?** ¡Inicia en 3 comandos!

```bash
# 1. Dar permisos a scripts
chmod +x start.sh stop.sh help.sh

# 2. ¡INICIAR!
./start.sh
```

**Accesos:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:8000
- 🗄️ MongoDB: localhost:27017

### 📚 Guías Disponibles

| Guía | Descripción | Recomendado Para |
|------|-------------|------------------|
| **[README-QUICKSTART.md](README-QUICKSTART.md)** | Inicio rápido en 5 minutos | ⭐ Nuevos usuarios |
| **[README-MULTITENANT.md](README-MULTITENANT.md)** | Documentación completa multi-tenant | Administradores |
| **README.md** (este archivo) | Documentación técnica original | Desarrolladores |

### 🎮 Comandos Principales

```bash
# Con scripts
./start.sh          # Iniciar
./stop.sh           # Detener
./help.sh           # Ver ayuda

# Con Make
make start          # Iniciar
make stop           # Detener
make logs           # Ver logs
make help           # Ver todos los comandos
```

---

## 📦 Contenido del Proyecto

Repositorio monorepo que contiene las tres aplicaciones del proyecto SecurePass:
- **Frontend Web** (React + TypeScript)
- **Aplicación Móvil** (React Native + Expo)
- **Backend API** (Node.js + Express + MongoDB)
- **Docker** (Compose multi-contenedor)

## 🚀 Tecnologías

### Frontend Web
- Typescript, HTML, CSS
- React
- Axios para conexión API

### Aplicación Móvil
- Typescript
- React Native + Expo
- Axios para conexión API

### Backend API
- Node.js + Express
- MongoDB Atlas
- Autenticación JWT
- Cloudinary (almacenamiento)
- Nodemailer (notificaciones por email)

## 👥 Roles de Usuarios

| Usuario              | Funcionalidades |
|----------------------|----------------|
| **Residente**        | Crear/autorizar visitas, Generar QR's, Editar autorizaciones, Ver historial de visitas |
| **Guardia**          | Escanear QR's, Registrar entradas/salidas, Ver residentes y sus historiales |
| **Administrador**    | Gestionar usuarios, Generar reportes, Configurar sistema, Cambiar roles |
| **Super Admin** 🆕   | Gestionar múltiples empresas, Configurar suscripciones, Subir logos |

## 🛠️ Funcionalidades Principales

| Módulo               | Descripción |
|----------------------|------------|
| **Autenticación**    | Registro, login, gestión de roles (residente/guardia/admin) |
| **Visitas**          | Autorizaciones, registro de entradas/salidas, validación QR |
| **Imágenes**         | Subida de fotos de vehículos/visitantes |
| **Reportes**         | Historial de visitas y generación de PDFs |
| **Multi-Tenant** 🆕  | Gestión de múltiples empresas, aislamiento de datos |
| **Branding** 🆕      | Logos personalizados, colores por empresa |
| **Suscripciones** 🆕 | Planes (free, basic, premium, enterprise) |

## 🏗️ Estructura del Monorepo

```
securepass/
├── apps/
│   ├── api/         # Backend (Node.js + Express)
│   ├── mobile/      # Aplicación móvil (React Native)
│   └── web/         # Frontend web (React)
├── packages/        # Código compartido
├── README.md        # Este archivo
└── package.json     # Configuración root
```

## 🚀 Cómo Ejecutar el Proyecto

### ⭐ Opción 1: Docker (Recomendado)

**La forma más fácil de ejecutar SecurePass:**

```bash
# Iniciar todo con un comando
./start.sh

# O con Make
make start
```

Ver [README-QUICKSTART.md](README-QUICKSTART.md) para guía completa.

### Opción 2: Desarrollo Manual (Sin Docker)

**Todas las aplicaciones simultáneamente:**

```bash
# Instalar herramientas necesarias (en la raiz del proyecto)
npm install

# Desde la raíz del monorepo:
npm run start:all
```

**Cada aplicación por separado:**

**Backend API**:
```bash
cd apps/api
npm install
npm run dev          # Desarrollo con hot-reload
# o
npm run build && npm start  # Producción
```

**Frontend Web**:
```bash
cd apps/web
npm install
npm start
```

**Aplicación Móvil**:
```bash
cd apps/mobile
npm install
npx expo start --tunnel
```

> **Nota:** Para desarrollo manual necesitas tener MongoDB corriendo localmente o configurar MongoDB Atlas.

## 🤝 Cómo Contribuir

1. **Haz un fork** del proyecto en GitHub
2. **Clona tu fork** localmente:
   ```bash
   git clone https://github.com/tzeik/secure-pass.git
   cd secure-pass
   ```
3. **Configura el upstream**:
   ```bash
   git remote add upstream https://github.com/tzeik/secure-pass.git
   ```
4. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```
5. **Instala dependencias** en cada aplicación que modifiques
6. **Realiza tus cambios** y haz commit:
   ```bash
   git add .
   git commit -m "Descripción de tus cambios"
   ```
7. **Sincroniza** con el repositorio original:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
8. **Envía tus cambios**:
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```
9. **Crea un Pull Request** en GitHub

## 🔄 Mantener tu Fork Actualizado

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

## 🌐 Configuración de Entornos

### Docker (Recomendado)

El script `start.sh` crea automáticamente el archivo `.env` desde `.env.example`.

**Variables principales a configurar:**

```env
# Cloudinary (para logos de empresas)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Email (para notificaciones)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Seguridad (cambiar en producción)
JWT_SECRET=tu-jwt-secret-super-seguro
MONGO_ROOT_PASSWORD=tu-password-seguro
```

Ver [.env.example](.env.example) para todas las variables disponibles.

### Desarrollo Manual

Crear archivos `.env` en cada aplicación según necesites:


## 📄 Licencia
[MIT License] - Ver archivo LICENSE para más detalles.