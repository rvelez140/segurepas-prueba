# SecurePass Desktop

Aplicación de escritorio multiplataforma para Windows y Linux del sistema SecurePass.

## Características

- Compatible con Windows (64-bit)
- Compatible con Linux (AppImage, .deb, .rpm)
- Actualizaciones automáticas
- Menús nativos en español
- Integración con la aplicación web existente
- Sincronización automática con el backend

## Tecnologías

- **Electron**: Framework para aplicaciones de escritorio
- **TypeScript**: Lenguaje de programación
- **electron-builder**: Generador de instaladores multiplataforma
- **electron-updater**: Sistema de actualizaciones automáticas

## Requisitos Previos

- Node.js 18+ y npm
- El backend API debe estar corriendo
- La aplicación web debe estar disponible (en desarrollo: http://localhost:3000)

## Instalación

```bash
cd apps/desktop
npm install
```

## Desarrollo

### Modo Desarrollo

```bash
# Asegúrate de que el backend y la app web estén corriendo primero
cd apps/api && npm run dev
cd apps/web && npm start

# Luego inicia la aplicación desktop
cd apps/desktop
npm run dev
```

La aplicación se abrirá y cargará la interfaz web desde `http://localhost:3000`.

### Compilar TypeScript

```bash
npm run build
```

### Ejecutar la Aplicación Compilada

```bash
npm start
```

## Construcción de Instaladores

### Construir para Windows

```bash
npm run dist:win
```

Esto generará:
- Instalador NSIS (`.exe`) - Instalador tradicional
- Versión portable (`.exe`) - No requiere instalación

Los archivos se guardarán en `apps/desktop/release/`

### Construir para Linux

```bash
npm run dist:linux
```

Esto generará:
- AppImage (`.AppImage`) - Ejecutable universal para Linux
- Paquete Debian (`.deb`) - Para Ubuntu/Debian
- Paquete RPM (`.rpm`) - Para Fedora/RedHat/CentOS

### Construir para Todas las Plataformas

```bash
npm run dist
```

## Estructura del Proyecto

```
apps/desktop/
├── src/
│   ├── main.ts        # Proceso principal de Electron
│   └── preload.ts     # Script de contexto para seguridad
├── renderer/          # Archivos del renderer (si se usan localmente)
├── assets/            # Iconos y recursos
│   ├── icon.png       # Icono para Linux
│   └── icon.ico       # Icono para Windows
├── dist/              # Código TypeScript compilado
├── release/           # Instaladores generados
├── package.json       # Configuración del proyecto
└── tsconfig.json      # Configuración de TypeScript
```

## Configuración

### URL de la Aplicación Web

Edita `src/main.ts` para cambiar la URL de la aplicación web:

```typescript
const WEB_APP_URL = isDevelopment
  ? 'http://localhost:3000'      // Desarrollo
  : 'https://tu-app.com';         // Producción
```

### Iconos

Coloca tus iconos personalizados en:
- `assets/icon.png` - Para Linux (512x512px recomendado)
- `assets/icon.ico` - Para Windows (256x256px recomendado)

## Distribución

### Windows

1. Ejecuta `npm run dist:win`
2. Los instaladores estarán en `release/`
3. Distribuye el archivo `.exe` a los usuarios

### Linux

1. Ejecuta `npm run dist:linux`
2. Los paquetes estarán en `release/`
3. Distribuye según la distribución:
   - **Ubuntu/Debian**: archivo `.deb`
   - **Fedora/RHEL**: archivo `.rpm`
   - **Universal**: archivo `.AppImage`

## Características Implementadas

- Ventana principal con dimensiones configurables
- Menú de aplicación en español
- Zoom y controles de vista
- Actualización automática (en producción)
- Diálogo "Acerca de"
- Apertura de enlaces externos en navegador
- DevTools en modo desarrollo
- Comunicación IPC para información de plataforma
- Iconos personalizados por plataforma

## Comunicación con el Renderer

La aplicación expone una API segura a través de `window.electronAPI`:

```javascript
// En tu código del renderer (aplicación web)
if (window.electronAPI) {
  // Obtener versión de la app
  const version = await window.electronAPI.getAppVersion();

  // Obtener información de plataforma
  const info = await window.electronAPI.getPlatformInfo();

  // Verificar si es desktop
  if (window.electronAPI.isDesktop) {
    console.log('Corriendo en aplicación desktop');
  }

  // Detectar plataforma
  if (window.electronAPI.platform === 'win32') {
    console.log('Windows');
  } else if (window.electronAPI.platform === 'linux') {
    console.log('Linux');
  }
}
```

## Solución de Problemas

### La aplicación no se conecta al backend

Verifica que:
1. El backend esté corriendo en el puerto correcto
2. La URL en `src/main.ts` sea correcta
3. No haya problemas de CORS

### Error al construir instaladores

Asegúrate de tener las dependencias del sistema instaladas:

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install -y rpm

# Fedora
sudo dnf install dpkg
```

### La aplicación no arranca

Revisa los logs:
- **Windows**: Abre DevTools con `Ctrl+Shift+I`
- **Linux**: Ejecuta desde terminal para ver errores

## Scripts Disponibles

- `npm run dev` - Modo desarrollo con recarga automática
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar aplicación compilada
- `npm run pack` - Crear paquete sin instalador
- `npm run dist` - Crear instaladores para todas las plataformas
- `npm run dist:win` - Crear instalador para Windows
- `npm run dist:linux` - Crear instaladores para Linux

## Próximas Mejoras

- [ ] Integración con notificaciones nativas del sistema
- [ ] Soporte para modo offline
- [ ] Caché local de datos
- [ ] Atajos de teclado personalizados
- [ ] Temas oscuro/claro nativos
- [ ] Integración con impresoras térmicas (para guardias)

## Licencia

MIT - Ver LICENSE.txt en la raíz del proyecto
