# SecurePass - Instrucciones de Compilacion

## Resumen de Plataformas Soportadas

### Aplicacion Movil (apps/mobile)
| Plataforma | Formato | Script |
|------------|---------|--------|
| iOS | IPA | `npm run build:prod:ios` |
| Android | APK/AAB | `npm run build:prod:android` |
| Web | PWA | `npm run web` |

### Aplicacion de Escritorio (apps/desktop)
| Plataforma | Formatos | Script |
|------------|----------|--------|
| Windows | NSIS (.exe), Portable, ZIP | `npm run dist:win` |
| macOS | DMG, ZIP | `npm run dist:mac` |
| Linux | AppImage, DEB, RPM, Snap, TAR.GZ | `npm run dist:linux` |

---

## Aplicacion Movil

### Requisitos Previos

1. **Node.js 20+** instalado
2. **EAS CLI** instalado:
   ```bash
   npm install -g eas-cli
   ```
3. **Cuenta de Expo** (gratuita): https://expo.dev/signup
4. **Para iOS**: Apple Developer Account ($99/año)
5. **Para Android**: Google Play Console ($25 una vez)

### Configuracion Inicial

```bash
cd apps/mobile

# Instalar dependencias
npm install

# Iniciar sesion en Expo
eas login

# Configurar el proyecto en Expo
eas build:configure
```

### Compilar para Desarrollo

```bash
# iOS Simulator
npm run build:dev:ios

# Android APK (debug)
npm run build:dev:android

# Ambas plataformas
npm run build:dev
```

### Compilar para Preview (Testing Interno)

```bash
# Android APK para testers
npm run build:preview:android

# iOS para TestFlight (requiere certificados)
npm run build:preview
```

### Compilar para Produccion

```bash
# iOS para App Store
npm run build:prod:ios

# Android AAB para Play Store
npm run build:prod:android

# Ambas plataformas
npm run build:prod
```

### Enviar a las Tiendas

```bash
# iOS - App Store Connect
npm run submit:ios

# Android - Google Play Console
npm run submit:android
```

### Compilacion Local (Sin EAS Cloud)

Requiere Xcode (macOS) o Android Studio:

```bash
# Generar carpetas nativas
npm run prebuild

# Compilar iOS localmente (solo macOS)
npm run build:local:ios

# Compilar Android localmente
npm run build:local:android
```

---

## Aplicacion de Escritorio

### Requisitos Previos

1. **Node.js 20+** instalado
2. **Para Windows**: Windows 10+ (o Wine en Linux/macOS)
3. **Para macOS**: macOS 10.15+ con Xcode Command Line Tools
4. **Para Linux**: Ubuntu 18.04+ o equivalente

### Configuracion Inicial

```bash
cd apps/desktop

# Instalar dependencias
npm install

# Instalar dependencias de electron-builder
npm run postinstall
```

### Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# O manualmente
npm run build && npm start
```

### Compilar Instaladores

#### Todas las Plataformas (desde macOS)
```bash
npm run dist:all
```

#### Solo Windows
```bash
# NSIS Installer + Portable + ZIP
npm run dist:win

# Solo portable
npm run dist:win:portable
```

#### Solo macOS
```bash
# DMG + ZIP (Intel + Apple Silicon)
npm run dist:mac

# Solo DMG
npm run dist:mac:dmg
```

#### Solo Linux
```bash
# AppImage + DEB + RPM + Snap + TAR.GZ
npm run dist:linux

# Formatos individuales
npm run dist:linux:appimage
npm run dist:linux:deb
npm run dist:linux:rpm
```

### Ubicacion de Instaladores

Despues de compilar, los instaladores estaran en:
```
apps/desktop/release/
├── SecurePass-1.0.0-win-x64.exe      # Windows NSIS
├── SecurePass-1.0.0-win-x64.zip      # Windows ZIP
├── SecurePass-1.0.0-mac-x64.dmg      # macOS Intel
├── SecurePass-1.0.0-mac-arm64.dmg    # macOS Apple Silicon
├── SecurePass-1.0.0-x64.AppImage     # Linux AppImage
├── SecurePass-1.0.0-x64.deb          # Debian/Ubuntu
├── SecurePass-1.0.0-x64.rpm          # Fedora/RHEL
└── SecurePass-1.0.0-x64.tar.gz       # Linux tarball
```

---

## CI/CD con GitHub Actions

Los workflows de CI/CD se ejecutan automaticamente:

### Mobile (`build-mobile.yml`)
- **Trigger**: Push a `main`/`develop` o Release
- **Acciones**: Lint, Build iOS, Build Android, Submit to stores
- **Requisitos**: Configurar `EXPO_TOKEN` en GitHub Secrets

### Desktop (`build-desktop.yml`)
- **Trigger**: Push a `main`/`develop` o Release
- **Acciones**: Build Windows, Build macOS, Build Linux
- **Artifacts**: Disponibles por 30 dias

### Configurar Secrets en GitHub

1. Ir a Settings > Secrets and variables > Actions
2. Agregar los siguientes secrets:

**Para Mobile:**
- `EXPO_TOKEN` - Token de Expo (obtenido de expo.dev)

**Para Desktop (opcional, para firma de codigo):**
- `MAC_CERTS` - Certificado de firma de Apple (base64)
- `MAC_CERTS_PASSWORD` - Contrasena del certificado
- `APPLE_ID` - Apple ID para notarizacion
- `APPLE_ID_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Team ID de Apple Developer

---

## Iconos

### Mobile
Los iconos ya estan configurados en `apps/mobile/src/assets/`:
- `icon.png` - Icono principal
- `adaptive-icon.png` - Icono adaptativo Android
- `splash-icon.png` - Splash screen
- `favicon.png` - Icono web

### Desktop
Ver `apps/desktop/assets/ICONS_README.md` para instrucciones de como generar:
- `icon.ico` - Windows
- `icon.icns` - macOS
- `icons/` - Linux (multiples tamanios)

---

## Troubleshooting

### Error: "eas: command not found"
```bash
npm install -g eas-cli
```

### Error: Build falla por certificados iOS
Necesitas configurar tu Apple Developer Account en eas.json:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "tu-apple-id@email.com",
        "ascAppId": "tu-app-store-connect-id",
        "appleTeamId": "TU_TEAM_ID"
      }
    }
  }
}
```

### Error: electron-builder no encuentra iconos
Asegurate de que existan los archivos:
- `apps/desktop/assets/icon.ico`
- `apps/desktop/assets/icon.icns`
- `apps/desktop/assets/icons/` (carpeta con PNGs)

### Error: macOS build falla por notarizacion
Para builds locales sin notarizacion, agrega en package.json:
```json
"mac": {
  "notarize": false
}
```

---

## Soporte

Si tienes problemas con la compilacion:
1. Revisa los logs de error completos
2. Asegurate de tener las versiones correctas de Node.js
3. Verifica que las credenciales esten correctamente configuradas
4. Consulta la documentacion de [Expo](https://docs.expo.dev) y [Electron Builder](https://www.electron.build)
