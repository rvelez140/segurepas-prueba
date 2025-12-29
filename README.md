# SecurePass | Sistema de Control de Acceso 🏠🔐

## 📌 Sistema de Gestión de Visitantes para Residencias

Repositorio monorepo que contiene las cuatro aplicaciones del proyecto SecurePass:

- **Frontend Web** (React)
- **Aplicación Móvil** (React Native + Expo)
- **Aplicación Desktop** (Electron - Windows y Linux)
- **Backend API** (Node.js + Express + MongoDB)

## 🛡️ Infraestructura de Calidad y Testing

Este proyecto cuenta con una infraestructura completa de calidad de código, testing y monitoreo:

### ✅ Calidad de Código

- **ESLint + Prettier**: Análisis y formateo automático de código
- **Husky**: Git hooks para validación pre-commit
- **lint-staged**: Linters solo en archivos modificados

```bash
npm run lint              # Analizar código
npm run lint:fix          # Corregir problemas
npm run format            # Formatear código
```

### 🧪 Testing

- **Jest + Testing Library**: Framework de testing completo
- **Cobertura de código**: Configurada con umbrales del 50%

```bash
npm run test:api          # Tests de la API
npm run test:web          # Tests de la web
npm run test:all          # Todos los tests
```

### 🔒 Validación y Seguridad

- **Zod**: Validación de esquemas TypeScript-first
- **Helmet.js**: Seguridad HTTP (CSP, HSTS, XSS Protection)
- **express-mongo-sanitize**: Prevención de inyección NoSQL
- **Rate limiting y CORS**: Configurados

### 📚 Documentación de API

- **Swagger UI**: Disponible en `/api-docs`
- Documentación interactiva con autenticación JWT
- Esquemas de datos y ejemplos

### 📊 Monitoreo

- **Sentry**: Monitoreo de errores y performance
- Session replay y profiling
- Configuración para API y Web

Para más detalles sobre la infraestructura de calidad, consulta la sección "Flujo de Desarrollo" más abajo.

## 🚀 Tecnologías

### Frontend Web

- Typescript, HTML, CSS
- React
- Axios para conexión API

### Aplicación Móvil

- Typescript
- React Native + Expo
- Axios para conexión API

### Aplicación Desktop

- Typescript
- Electron (multiplataforma)
- Integración con aplicación web
- Soporte para Windows y Linux
- Actualizaciones automáticas

### Backend API

- Node.js + Express
- MongoDB Atlas
- Autenticación JWT
- Cloudinary (almacenamiento)
- Nodemailer (notificaciones por email)

## 👥 Roles de Usuarios

| Usuario           | Funcionalidades                                                                        |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Residente**     | Crear/autorizar visitas, Generar QR's, Editar autorizaciones, Ver historial de visitas |
| **Guardia**       | Escanear QR's, Registrar entradas/salidas, Ver residentes y sus historiales            |
| **Administrador** | Gestionar usuarios, Generar reportes, Configurar sistema, Cambiar roles                |

## 🛠️ Funcionalidades Principales

| Módulo            | Descripción                                                 |
| ----------------- | ----------------------------------------------------------- |
| **Autenticación** | Registro, login, gestión de roles (residente/guardia/admin) |
| **Visitas**       | Autorizaciones, registro de entradas/salidas, validación QR |
| **Imágenes**      | Subida de fotos de vehículos/visitantes                     |
| **Reportes**      | Historial de visitas y generación de PDFs                   |

## 💾 Descargar Aplicación Desktop

¿Solo quieres usar la aplicación? Descarga el instalador para tu sistema operativo:

### 📥 Última Versión

Visita la página de [**Releases**](../../releases/latest) para descargar la última versión estable.

#### Windows

- **Instalador NSIS** (.exe) - Instalación tradicional con accesos directos
- **Versión Portable** (.exe) - No requiere instalación, ejecuta directamente

#### Linux

- **AppImage** (.AppImage) - Universal para todas las distribuciones
  ```bash
  chmod +x SecurePass-*.AppImage
  ./SecurePass-*.AppImage
  ```
- **Paquete Debian** (.deb) - Para Ubuntu, Debian y derivados
  ```bash
  sudo dpkg -i securepass-desktop_*.deb
  ```
- **Paquete RPM** (.rpm) - Para Fedora, RHEL, CentOS y derivados
  ```bash
  sudo rpm -i securepass-desktop-*.rpm
  ```

### 📋 Requisitos del Sistema

**Windows:**

- Windows 10 o superior (64-bit)
- 4 GB de RAM mínimo
- 200 MB de espacio en disco

**Linux:**

- Kernel 3.10 o superior
- 4 GB de RAM mínimo
- 200 MB de espacio en disco
- Entorno de escritorio (GNOME, KDE, XFCE, etc.)

### ⚙️ Instalación Rápida

1. Descarga el instalador correspondiente a tu sistema operativo
2. Ejecuta el instalador
3. Sigue las instrucciones en pantalla
4. Abre SecurePass desde el menú de inicio o escritorio
5. La aplicación se conectará automáticamente al servidor

---

## 🏗️ Estructura del Monorepo

```
securepass/
├── apps/
│   ├── api/         # Backend (Node.js + Express)
│   ├── desktop/     # Aplicación desktop (Electron)
│   ├── mobile/      # Aplicación móvil (React Native)
│   └── web/         # Frontend web (React)
├── packages/        # Código compartido
├── README.md        # Este archivo
└── package.json     # Configuración root
```

## 🚀 Instalación y Despliegue

### 🖥️ Instalación en VPS (Producción)

Para instalar SecurePass en un servidor VPS con Git y Docker:

#### Instalación Automática (Recomendado)

```bash
# Con curl
curl -fsSL https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install.sh | sudo bash

# O con wget
wget -O - https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install.sh | sudo bash
```

Este script instalará automáticamente:
- ✅ Git
- ✅ Docker y Docker Compose
- ✅ Configuración del servidor
- ✅ Firewall y seguridad
- ✅ Clonación del repositorio

Para más detalles sobre la instalación en VPS, consulta la **[Guía de Instalación en VPS](VPS_INSTALLATION.md)**.

### 💻 Desarrollo Local

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

**Aplicación Desktop** (Windows/Linux):

```bash
cd apps/desktop
npm install
npm run dev
```

O desde la raíz (ejecuta API, Web y Desktop juntos):

```bash
npm run start:desktop-full
```

## 📦 Compilar Instaladores Desktop

Para generar instaladores de la aplicación desktop:

**Para Windows**:

```bash
npm run dist:desktop:win
```

Genera: Instalador NSIS (.exe) y versión portable

**Para Linux**:

```bash
npm run dist:desktop:linux
```

Genera: AppImage, paquete .deb (Ubuntu/Debian), paquete .rpm (Fedora/RHEL)

**Para todas las plataformas**:

```bash
npm run dist:desktop
```

Los instaladores se generarán en `apps/desktop/release/`

Ver [apps/desktop/README.md](apps/desktop/README.md) para más detalles sobre la aplicación desktop.

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

## 🔧 Flujo de Desarrollo

### Antes de hacer commit

Husky ejecutará automáticamente:

1. ESLint para verificar calidad del código
2. Prettier para formatear código
3. Solo se commitearán archivos que pasen validaciones

### Ejecutar tests

```bash
npm run test:all          # Todos los tests
npm run test:coverage     # Con reporte de cobertura
```

### Configurar Sentry (opcional)

En `.env`:

```env
SENTRY_DSN=tu-dsn-aqui
REACT_APP_SENTRY_DSN=tu-dsn-aqui
```

### Ver documentación de API

Una vez iniciado el servidor: http://localhost:48721/api-docs

## 🌐 Configuración de Entornos

- Configurar variables de entorno en `.env` (ver `.env.example`):

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error: "ADMIN_PASSWORD no está configurado"

**Síntoma:** La API no inicia y muestra un error sobre ADMIN_PASSWORD

**Solución:**
```bash
# Generar credenciales seguras
node scripts/generate-credentials.js

# Copiar ADMIN_PASSWORD generado a .env
# Asegúrate de que tenga al menos 12 caracteres
```

#### 2. Error de Conexión a MongoDB

**Síntoma:** `Error al conectar a MongoDB: Connection refused`

**Soluciones:**
- Verificar que MongoDB esté ejecutándose
- Revisar que MONGODB_URI en `.env` sea correcta
- Para MongoDB local: Verificar que el puerto 37849 esté disponible
- Para MongoDB Atlas: Verificar credenciales y whitelist de IP

```bash
# Verificar si MongoDB está corriendo (local)
docker ps | grep mongodb

# Reiniciar MongoDB con Docker
docker-compose -f docker-compose.production.yml restart mongodb
```

#### 3. Error: "JWT_SECRET no definida"

**Síntoma:** Error al iniciar la API relacionado con JWT

**Solución:**
```bash
# Asegúrate de tener JWT_SECRET en .env
# Genera una con:
node scripts/generate-credentials.js
```

#### 4. Puerto ya en Uso

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::48721`

**Solución:**
```bash
# Encontrar proceso usando el puerto
lsof -i :48721

# Matar el proceso (reemplaza PID)
kill -9 <PID>

# O usar un puerto diferente en .env
PORT=48722
```

#### 5. Errores de TypeScript en Compilación

**Síntoma:** Errores de tipo al ejecutar `npm run build`

**Solución:**
```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar versión de TypeScript
npm list typescript

# Ejecutar type check
npx tsc --noEmit
```

#### 6. Tests Fallando

**Síntoma:** Tests no pasan o hay errores en Jest

**Solución:**
```bash
# Limpiar caché de Jest
npm test -- --clearCache

# Ejecutar tests en modo verbose
npm test -- --verbose

# Verificar configuración de test
cat jest.config.js
```

#### 7. Docker Build Falla

**Síntoma:** Error al construir imágenes Docker

**Solución:**
```bash
# Limpiar caché de Docker
docker builder prune -a

# Reconstruir sin caché
docker build --no-cache -t securepass-api ./apps/api

# Verificar logs detallados
docker build --progress=plain -t securepass-api ./apps/api
```

#### 8. Logs No Aparecen

**Síntoma:** No se ven logs en desarrollo

**Solución:**
```bash
# Verificar que Winston esté configurado
cat apps/api/src/config/logger.ts

# Verificar nivel de log
NODE_ENV=development npm run dev

# Verificar carpeta de logs existe
ls -la apps/api/logs/
```

#### 9. Redis No Conecta (Opcional)

**Síntoma:** Advertencias sobre Redis

**Solución:**
```bash
# Redis es OPCIONAL - El sistema funciona sin él
# Si no usas Redis, asegúrate:
REDIS_ENABLED=false

# Si quieres usarlo, verifica que esté corriendo
docker ps | grep redis
```

#### 10. ESLint/Prettier Conflictos

**Síntoma:** Errores de linting contradictorios

**Solución:**
```bash
# Ejecutar formateo
npm run format

# Ejecutar lint fix
npm run lint:fix

# Verificar configuración
cat eslint.config.js
cat .prettierrc.json
```

### Verificar Salud del Sistema

```bash
# Verificar health de la API
curl http://localhost:48721/health

# Ver logs en tiempo real
tail -f apps/api/logs/combined.log

# Verificar variables de entorno cargadas
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

### Obtener Ayuda

Si ninguna solución funciona:

1. **Revisa los logs:**
   - `apps/api/logs/error.log`
   - `apps/api/logs/combined.log`
   - Output de console

2. **Verifica configuración:**
   - `.env` tiene todas las variables requeridas
   - Versiones de Node.js (18+) y npm

3. **Reporta el problema:**
   - Issues: https://github.com/rvelez140/segurepas-prueba/issues
   - Incluye: logs, configuración (sin credenciales), pasos para reproducir

## 📄 Licencia

[MIT License] - Ver archivo LICENSE para más detalles.
