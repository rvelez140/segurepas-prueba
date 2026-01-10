# SecurePass - Firma de APK Android

## Generar Keystore (Solo una vez)

Para publicar en Google Play Store, necesitas firmar tu APK con un keystore. Este archivo es **MUY IMPORTANTE** - si lo pierdes, no podras actualizar tu app.

### Paso 1: Crear el Keystore

```bash
cd apps/mobile

# Crear carpeta para el keystore
mkdir -p android/app/keystore

# Generar keystore (guarda la contrasena!)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/keystore/securepass.keystore \
  -alias securepass \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Te pedira:
- **Contrasena del keystore**: (ej: MiContrasenaSegura123!)
- **Nombre y apellido**: Tu nombre o nombre de empresa
- **Unidad organizativa**: (ej: Desarrollo)
- **Organizacion**: (ej: SecurePass)
- **Ciudad**: Tu ciudad
- **Estado/Provincia**: Tu estado
- **Codigo de pais**: (ej: CO, MX, ES, AR)

### Paso 2: Configurar Gradle

Crea el archivo `android/gradle.properties` (si no existe) y agrega:

```properties
SECUREPASS_UPLOAD_STORE_FILE=keystore/securepass.keystore
SECUREPASS_UPLOAD_KEY_ALIAS=securepass
SECUREPASS_UPLOAD_STORE_PASSWORD=TuContrasenaAqui
SECUREPASS_UPLOAD_KEY_PASSWORD=TuContrasenaAqui
```

### Paso 3: Configurar build.gradle

Edita `android/app/build.gradle` y agrega en la seccion `android`:

```gradle
android {
    ...

    signingConfigs {
        release {
            if (project.hasProperty('SECUREPASS_UPLOAD_STORE_FILE')) {
                storeFile file(SECUREPASS_UPLOAD_STORE_FILE)
                storePassword SECUREPASS_UPLOAD_STORE_PASSWORD
                keyAlias SECUREPASS_UPLOAD_KEY_ALIAS
                keyPassword SECUREPASS_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Paso 4: Compilar APK Firmado

```bash
cd android
./gradlew assembleRelease
```

El APK firmado estara en:
`android/app/build/outputs/apk/release/app-release.apk`

---

## IMPORTANTE - Respalda tu Keystore

```
╔══════════════════════════════════════════════════════════════╗
║  ⚠️  ADVERTENCIA CRITICA                                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. NUNCA subas el keystore a Git                            ║
║  2. NUNCA pierdas el keystore o la contrasena                ║
║  3. Guarda copias en lugares seguros:                        ║
║     - Google Drive/Dropbox encriptado                        ║
║     - USB de respaldo                                        ║
║     - Gestor de contrasenas (1Password, Bitwarden)           ║
║                                                              ║
║  Si pierdes el keystore, NO podras actualizar tu app         ║
║  en Play Store. Tendras que publicar una app NUEVA.          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Generar AAB (Android App Bundle)

Google Play prefiere AAB en lugar de APK:

```bash
cd android
./gradlew bundleRelease
```

El AAB estara en:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Variables de Entorno (Recomendado para CI/CD)

En lugar de guardar contrasenas en archivos, usa variables de entorno:

```bash
export SECUREPASS_UPLOAD_STORE_PASSWORD="TuContrasena"
export SECUREPASS_UPLOAD_KEY_PASSWORD="TuContrasena"
```

Y en `gradle.properties`:
```properties
SECUREPASS_UPLOAD_STORE_FILE=keystore/securepass.keystore
SECUREPASS_UPLOAD_KEY_ALIAS=securepass
SECUREPASS_UPLOAD_STORE_PASSWORD=${SECUREPASS_UPLOAD_STORE_PASSWORD}
SECUREPASS_UPLOAD_KEY_PASSWORD=${SECUREPASS_UPLOAD_KEY_PASSWORD}
```
