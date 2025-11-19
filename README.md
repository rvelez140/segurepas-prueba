# SecurePass | Sistema de Control de Acceso 🏠🔐

## 📌 Sistema de Gestión de Visitantes para Residencias

Repositorio monorepo que contiene las cuatro aplicaciones del proyecto SecurePass:
- **Frontend Web** (React)
- **Aplicación Móvil** (React Native + Expo)
- **Aplicación Desktop** (Electron - Windows y Linux)
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

| Usuario              | Funcionalidades |
|----------------------|----------------|
| **Residente**        | Crear/autorizar visitas, Generar QR's, Editar autorizaciones, Ver historial de visitas |
| **Guardia**          | Escanear QR's, Registrar entradas/salidas, Ver residentes y sus historiales |
| **Administrador**    | Gestionar usuarios, Generar reportes, Configurar sistema, Cambiar roles |

## 🛠️ Funcionalidades Principales

| Módulo               | Descripción |
|----------------------|------------|
| **Autenticación**    | Registro, login, gestión de roles (residente/guardia/admin) |
| **Visitas**          | Autorizaciones, registro de entradas/salidas, validación QR |
| **Imágenes**         | Subida de fotos de vehículos/visitantes |
| **Reportes**         | Historial de visitas y generación de PDFs |

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

## 🌐 Configuración de Entornos

- Configurar variables de entorno en `.env`:


## 📄 Licencia
[MIT License] - Ver archivo LICENSE para más detalles.