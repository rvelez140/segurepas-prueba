# SecurePass | Sistema de Control de Acceso 🏠🔐

## 📌 Sistema de Gestión de Visitantes para Residencias

Repositorio monorepo que contiene las tres aplicaciones del proyecto SecurePass:
- **Frontend Web** (React)
- **Aplicación Móvil** (React Native + Expo)
- **Backend API** (Node.js + Express + MongoDB)

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
- Passport.js (Google OAuth, Microsoft OAuth)
- Cloudinary (almacenamiento)
- Nodemailer (notificaciones por email)

## 👥 Roles de Usuarios

| Usuario              | Funcionalidades |
|----------------------|----------------|
| **Residente**        | Crear/autorizar visitas, Generar QR's, Editar autorizaciones, Ver historial de visitas |
| **Guardia**          | Escanear QR's, Registrar entradas/salidas, Ver residentes y sus historiales |
| **Administrador**    | Gestionar usuarios, Generar reportes, Configurar sistema, Cambiar roles |

## 🛠️ Funcionalidades Principales

| Módulo               | Descripción |
|----------------------|------------|
| **Autenticación**    | Registro, login, gestión de roles (residente/guardia/admin), OAuth con Google y Microsoft |
| **Visitas**          | Autorizaciones, registro de entradas/salidas, validación QR |
| **Imágenes**         | Subida de fotos de vehículos/visitantes |
| **Reportes**         | Historial de visitas y generación de PDFs |

## 🔐 Autenticación OAuth

SecurePass soporta múltiples métodos de autenticación:

- **Email y Contraseña**: Login tradicional con JWT
- **Google OAuth 2.0**: Autenticación con cuenta de Google
- **Microsoft OAuth 2.0**: Autenticación con cuenta de Microsoft (personal o corporativa)

### Configuración de OAuth

Para configurar la autenticación con proveedores externos, consulta las siguientes guías:

- **[Configuración de Google OAuth](./GOOGLE_AUTH_SETUP.md)**: Guía completa para configurar Google Cloud Console y las variables de entorno necesarias
- **[Configuración de Microsoft OAuth](./MICROSOFT_AUTH_SETUP.md)**: Guía completa para configurar Azure Portal y las variables de entorno necesarias

### Características de OAuth

- ✅ Registro automático de nuevos usuarios
- ✅ Login sin contraseña para usuarios de Google/Microsoft
- ✅ Sincronización de email y nombre desde el proveedor
- ✅ Soporte para cuentas personales y corporativas (Microsoft)
- ✅ Integración con el sistema de roles existente

## 📧 Verificación de Email

SecurePass requiere que todos los usuarios verifiquen su dirección de correo electrónico antes de poder acceder a la aplicación.

### Características del Sistema de Verificación

- ✅ **Verificación obligatoria**: Los usuarios deben verificar su email antes de iniciar sesión
- ✅ **Doble método**: Código de 6 dígitos o enlace de activación
- ✅ **Emails HTML profesionales**: Con branding de SecurePass
- ✅ **Tokens con expiración**: Códigos válidos por 24 horas
- ✅ **Reenvío de código**: Los usuarios pueden solicitar un nuevo email
- ✅ **Excepción OAuth**: Usuarios de Google/Microsoft verificados automáticamente

### Flujo de Verificación

1. **Registro**: Usuario se registra con email y contraseña
2. **Email enviado**: Recibe código de 6 dígitos y enlace de activación
3. **Verificación**: Ingresa el código o hace clic en el enlace
4. **Activación**: Cuenta activada, puede iniciar sesión

### Configuración

Para configurar el sistema de verificación de email:

- **[Guía de Verificación de Email](./EMAIL_VERIFICATION_SETUP.md)**: Documentación completa del sistema de verificación

**Requisitos:**
- Cuenta de Gmail con App Password configurada
- Variables de entorno `EMAIL_USER` y `EMAIL_PASSWORD`
- Nodemailer configurado

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

### Opción 1: Ejecutar todas las aplicaciones simultáneamente

```bash
# Instalar herramientas necesarias (en la raiz del proyecto)
npm install

# Desde la raíz del monorepo:
npm run start:all
```

### Opción 2: Ejecutar cada aplicación por separado

**Backend API**:
```bash
cd apps/api
npm install
npm start
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

- Configurar variables de entorno en `.env`:


## 📄 Licencia
[MIT License] - Ver archivo LICENSE para más detalles.