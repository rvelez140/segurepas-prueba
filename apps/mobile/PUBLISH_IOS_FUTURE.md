# SecurePass - Guia de Publicacion en App Store (Para el Futuro)

## Estado: PREPARADO - Listo para cuando adquieras Apple Developer

Este documento contiene todo lo necesario para publicar en App Store cuando estes listo.

---

## Requisitos (Cuando estes listo)

1. **Apple Developer Program** - $99 USD/año
   - Registrate en: https://developer.apple.com/programs/

2. **Mac con Xcode** (obligatorio para iOS)

3. **Apple ID** con autenticacion de dos factores

---

## Que ya esta configurado

La configuracion de iOS ya esta lista en el proyecto:

### app.config.ts
```typescript
ios: {
  supportsTablet: true,
  bundleIdentifier: 'com.securepass.mobile',
  buildNumber: '1',
  infoPlist: {
    NSCameraUsageDescription: '...',
    NSPhotoLibraryUsageDescription: '...',
    NSLocationWhenInUseUsageDescription: '...',
    NSFaceIDUsageDescription: '...',
  },
  config: {
    usesNonExemptEncryption: false,
  },
  associatedDomains: ['applinks:securepass.com'],
}
```

### eas.json
```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

---

## Pasos cuando tengas Apple Developer

### Paso 1: Configurar credenciales en eas.json

Edita `eas.json` y reemplaza:
```json
"ios": {
  "appleId": "TU_EMAIL@icloud.com",
  "ascAppId": "1234567890",  // Lo obtienes de App Store Connect
  "appleTeamId": "ABCD1234"  // Lo obtienes de developer.apple.com
}
```

### Paso 2: Crear App en App Store Connect

1. Ir a https://appstoreconnect.apple.com
2. Apps > "+" > Nueva App
3. Completar:
   - Nombre: SecurePass
   - Idioma: Espanol
   - Bundle ID: com.securepass.mobile
   - SKU: securepass-mobile-001

### Paso 3: Compilar para iOS

```bash
cd apps/mobile

# Con EAS Build (en la nube, no necesita Mac)
npm run build:prod:ios

# O localmente (requiere Mac con Xcode)
npm run prebuild
npm run build:local:ios
```

### Paso 4: Enviar a App Store

```bash
# Automatico con EAS
npm run submit:ios

# O manual desde Xcode/Transporter
```

---

## Assets necesarios para App Store

### Iconos (se generan automaticamente con Expo)
- 1024x1024 px (App Store)

### Capturas de Pantalla

**iPhone 6.7" (iPhone 14 Pro Max):**
- 1290x2796 px
- Minimo 3, maximo 10

**iPhone 6.5" (iPhone 11 Pro Max):**
- 1284x2778 px
- Minimo 3, maximo 10

**iPhone 5.5" (iPhone 8 Plus):**
- 1242x2208 px
- Minimo 3, maximo 10

**iPad Pro 12.9" (si soportas tablet):**
- 2048x2732 px
- Minimo 3, maximo 10

### Video Preview (Opcional)
- 15-30 segundos
- Mismo tamano que capturas

---

## Informacion de la App

### Descripcion (4000 caracteres max)
(Usa la misma que Android, adaptada)

### Palabras clave (100 caracteres)
```
control acceso,visitantes,seguridad,residencial,porteria,qr,condominio
```

### Categoria
- Principal: Utilidades
- Secundaria: Productividad

### Clasificacion de edad
- 4+ (sin contenido objetable)

---

## Politicas de Apple a tener en cuenta

1. **Compras in-app**: Si cobras suscripcion, DEBE ser via Apple (30% comision)
2. **Privacidad**: Declarar todos los datos recopilados
3. **Permisos**: Justificar cada permiso solicitado
4. **Login**: Si tienes login, debes ofrecer "Sign in with Apple"

---

## Tiempo estimado de revision

- Primera publicacion: 1-3 dias
- Actualizaciones: 24-48 horas
- Rechazos: Apple explica motivo, corrige y reenvia

---

## Costo Total iOS

| Concepto | Costo | Frecuencia |
|----------|-------|------------|
| Apple Developer | $99 | Anual |
| EAS Build iOS | Gratis* | 30 builds/mes |
| Mac (si no tienes) | Variable | Una vez |

*EAS Build compila en la nube, no necesitas Mac para compilar.
Pero necesitas Mac para desarrollo local y debugging.

---

## Alternativa: Mac en la nube

Si no tienes Mac, puedes alquilar uno:
- **MacStadium**: Desde $79/mes
- **MacinCloud**: Desde $20/mes
- **AWS EC2 Mac**: Por hora

O usar EAS Build que compila en la nube sin necesidad de Mac.

---

## Checklist Pre-Publicacion iOS

```
[ ] Apple Developer Account activo
[ ] Bundle ID registrado en Apple
[ ] App creada en App Store Connect
[ ] eas.json configurado con credenciales
[ ] Icono 1024x1024
[ ] Capturas de pantalla para todos los tamanos
[ ] Descripcion y palabras clave
[ ] Politica de privacidad URL
[ ] Clasificacion de edad completada
[ ] Categoria seleccionada
[ ] Precio configurado
```

---

## Resumen

**Todo esta listo en el codigo.** Cuando adquieras Apple Developer:

1. Actualiza `eas.json` con tus credenciales
2. Ejecuta `npm run build:prod:ios`
3. Ejecuta `npm run submit:ios`
4. Completa la informacion en App Store Connect
5. Espera aprobacion (1-3 dias)

El proyecto ya tiene toda la configuracion necesaria.
