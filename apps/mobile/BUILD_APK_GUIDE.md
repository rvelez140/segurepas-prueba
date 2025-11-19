# 📱 Guía para Generar APK de SecurePass

## Compatibilidad
- ✅ Android 10 (API 29) en adelante
- ✅ Android 11, 12, 13, 14
- ✅ Arquitecturas: ARM64, ARMv7, x86_64

---

## 🚀 Método 1: EAS Build (Recomendado)

### Requisitos Previos
- Node.js instalado
- Cuenta de Expo (gratuita)
- Internet para el build en la nube

### Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 2: Login en Expo

```bash
eas login
```

Si no tienes cuenta:
```bash
eas register
```

### Paso 3: Navegar al proyecto

```bash
cd /ruta/a/segurepas-prueba/apps/mobile
```

### Paso 4: Generar el APK

#### Para Pruebas (Preview)
```bash
eas build --platform android --profile preview
```

#### Para Producción
```bash
eas build --platform android --profile production
```

### Paso 5: Descargar el APK

Cuando termine el build (10-20 minutos):
1. Te dará un link de descarga
2. O visita: https://expo.dev
3. Ve a tu proyecto → Builds
4. Descarga el APK

---

## 🔧 Método 2: Build Local (Más Rápido)

### Requisitos Previos
- Android Studio instalado
- Android SDK (API 29+)
- Java JDK 11 o superior

### Paso 1: Configurar Variables de Entorno

```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
```

### Paso 2: Build Local

```bash
cd apps/mobile
eas build --platform android --profile preview --local
```

El APK se generará en la carpeta del proyecto.

---

## 📦 Método 3: Expo Classic (Legacy)

```bash
cd apps/mobile

# Instalar expo-cli
npm install -g expo-cli

# Generar APK
expo build:android -t apk
```

---

## 🎯 Scripts NPM (Recomendado)

Agrega estos scripts a `apps/mobile/package.json`:

```json
{
  "scripts": {
    "build:android": "eas build --platform android --profile preview",
    "build:android:prod": "eas build --platform android --profile production",
    "build:android:local": "eas build --platform android --profile preview --local",
    "build:list": "eas build:list"
  }
}
```

Luego ejecuta:

```bash
npm run build:android
```

---

## 📲 Instalación en Dispositivo Android

### Método 1: Transferencia Directa

1. **Descargar el APK** en tu computadora
2. **Conectar el dispositivo** por USB
3. **Copiar el APK** a la carpeta de Descargas del teléfono
4. En el teléfono:
   - Ir a Configuración → Seguridad
   - Activar "Orígenes desconocidos" o "Instalar apps desconocidas"
   - Abrir el administrador de archivos
   - Buscar el APK en Descargas
   - Tocar e instalar

### Método 2: ADB (Android Debug Bridge)

```bash
# Instalar ADB
# Linux: sudo apt install adb
# Mac: brew install android-platform-tools
# Windows: Descargar desde Android SDK

# Conectar dispositivo y habilitar depuración USB

# Instalar APK
adb install ruta/al/archivo.apk

# Si ya está instalado (actualizar)
adb install -r ruta/al/archivo.apk
```

### Método 3: Google Drive / Email

1. Subir APK a Google Drive
2. Abrir desde el teléfono
3. Descargar e instalar

---

## ⚙️ Configuración de API URL

Antes de generar el APK, actualiza la URL de tu API:

### Opción 1: Editar app.json

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://tu-backend.com/api"
    }
  }
}
```

### Opción 2: Usar Variables de Entorno

Crea `.env` en `apps/mobile/`:

```env
API_URL=https://tu-backend.com/api
```

Y crea `app.config.js`:

```javascript
export default {
  expo: {
    // ... otras configuraciones
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:3000/api"
    }
  }
}
```

---

## 🔍 Verificar Compatibilidad del APK

Después de generar el APK, puedes verificar la compatibilidad:

```bash
# Usando aapt (Android Asset Packaging Tool)
aapt dump badging tu-app.apk | grep "sdkVersion"

# Debería mostrar:
# sdkVersion:'29'  # Mínimo Android 10
# targetSdkVersion:'34'  # Target Android 14
```

---

## 📊 Tabla de Versiones Android

| Versión Android | API Level | Nombre       | Compatible |
|----------------|-----------|--------------|------------|
| Android 10     | 29        | Q            | ✅ Sí      |
| Android 11     | 30        | R            | ✅ Sí      |
| Android 12     | 31        | S            | ✅ Sí      |
| Android 12L    | 32        | Sv2          | ✅ Sí      |
| Android 13     | 33        | Tiramisu     | ✅ Sí      |
| Android 14     | 34        | UpsideDown   | ✅ Sí      |
| Android 9      | 28        | Pie          | ❌ No      |

---

## ❓ Troubleshooting

### Error: "ANDROID_HOME not set"

```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk

# Windows
setx ANDROID_HOME "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
```

### Error: "Java version not compatible"

```bash
# Instalar Java 11
# Ubuntu/Debian
sudo apt install openjdk-11-jdk

# Mac
brew install openjdk@11

# Verificar
java -version
```

### Error: "Build failed"

1. Limpiar caché:
```bash
cd apps/mobile
rm -rf node_modules
npm install
npx expo start --clear
```

2. Verificar app.json tiene configuración correcta
3. Verificar eas.json existe

### APK muy grande (>100MB)

Normal para Expo. Para reducir tamaño:
- Usar Expo Application Services (EAS)
- Compilar con `--profile production`
- Considerar migrar a bare React Native (avanzado)

---

## 🎯 Checklist Pre-Build

Antes de generar el APK, verifica:

- [ ] `app.json` tiene configuración Android correcta
- [ ] `minSdkVersion: 29` está configurado
- [ ] `extra.apiUrl` apunta a tu backend en producción
- [ ] Permisos de cámara están configurados
- [ ] Version code incrementado si es actualización
- [ ] Probado en Expo Go primero

---

## 📝 Notas Importantes

1. **Primera Build**: Puede tardar 15-20 minutos
2. **Builds Subsiguientes**: 5-10 minutos
3. **Tamaño APK**: ~40-60MB (normal para Expo)
4. **Caducidad Link**: El link de descarga expira en 30 días
5. **Límite Builds**: 30 builds/mes en plan gratuito de Expo

---

## 🔐 Firma del APK (Producción)

Para Google Play Store necesitas:

1. Generar Keystore:
```bash
keytool -genkeypair -v -keystore securepass.keystore -alias securepass -keyalg RSA -keysize 2048 -validity 10000
```

2. Configurar en `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "credentialsSource": "local"
      }
    }
  }
}
```

3. Subir keystore cuando EAS lo pida

---

## 📞 Soporte

- Documentación Expo: https://docs.expo.dev/build/setup/
- Foros Expo: https://forums.expo.dev/
- Discord Expo: https://chat.expo.dev/

---

**Última actualización**: 2025-01-18
**Versión guía**: 1.0.0
**Compatible con**: Expo SDK 53+
