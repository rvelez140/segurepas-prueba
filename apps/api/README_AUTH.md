# 🔐 Nuevas Funcionalidades de Autenticación - SecurePass

## Resumen

Este documento describe las nuevas funcionalidades de autenticación implementadas en SecurePass:

1. **Google Authenticator (2FA/TOTP)** - Autenticación de dos factores
2. **QR Login** - Inicio de sesión mediante escaneo de código QR desde la app móvil
3. **Magic Links** - Enlaces seguros para iniciar sesión sin contraseña
4. **Gestión de Dispositivos** - Control de sesiones activas con nombres editables

---

## 📱 1. Google Authenticator (2FA)

### Configuración

La autenticación de dos factores utiliza Google Authenticator o cualquier app compatible con TOTP.

### Endpoints

#### Generar Secreto 2FA
```http
POST /api/2fa/generate
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauthUrl": "otpauth://totp/SecurePass...",
  "qrCode": "data:image/png;base64,...",
  "message": "Escanea el código QR con Google Authenticator"
}
```

#### Habilitar 2FA
```http
POST /api/2fa/enable
Authorization: Bearer {token}
Content-Type: application/json

{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Respuesta:**
```json
{
  "message": "Autenticación de dos factores habilitada exitosamente",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    ...
  ],
  "warning": "Guarda estos códigos de respaldo en un lugar seguro"
}
```

#### Deshabilitar 2FA
```http
POST /api/2fa/disable
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "tu_contraseña"
}
```

#### Regenerar Códigos de Respaldo
```http
POST /api/2fa/backup-codes/regenerate
Authorization: Bearer {token}
```

#### Verificar Estado 2FA
```http
GET /api/2fa/status
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "twoFactorEnabled": true
}
```

### Flujo de Login con 2FA

1. Usuario ingresa email y contraseña
2. Si tiene 2FA habilitado, el servidor responde:
```json
{
  "requiresTwoFactor": true,
  "message": "Se requiere código de autenticación de dos factores"
}
```
3. Usuario ingresa código de Google Authenticator o código de respaldo
4. Login exitoso con token JWT

---

## 🔍 2. QR Login - Inicio de Sesión con Código QR

### Flujo

1. **Usuario en Web/Desktop:** Solicita un código QR para login
2. **Usuario en App Móvil:** Escanea el código QR
3. **Usuario en App Móvil:** Aprueba o rechaza el login
4. **Web/Desktop:** Recibe el token y completa el login

### Endpoints

#### Crear Sesión QR (Web/Desktop)
```http
POST /api/qr-login/create
```

**Respuesta:**
```json
{
  "sessionId": "uuid-v4",
  "qrCode": "data:image/png;base64,...",
  "expiresAt": "2025-12-27T10:35:00.000Z",
  "message": "Escanea el código QR con la app móvil para iniciar sesión"
}
```

#### Escanear QR (App Móvil)
```http
POST /api/qr-login/scan
Authorization: Bearer {token_movil}
Content-Type: application/json

{
  "sessionId": "uuid-v4"
}
```

**Respuesta:**
```json
{
  "message": "QR escaneado exitosamente",
  "status": "scanned"
}
```

#### Aprobar Login (App Móvil)
```http
POST /api/qr-login/approve
Authorization: Bearer {token_movil}
Content-Type: application/json

{
  "sessionId": "uuid-v4"
}
```

**Respuesta:**
```json
{
  "message": "Login aprobado exitosamente",
  "status": "approved"
}
```

#### Rechazar Login (App Móvil)
```http
POST /api/qr-login/reject
Authorization: Bearer {token_movil}
Content-Type: application/json

{
  "sessionId": "uuid-v4"
}
```

#### Verificar Estado de Sesión (Web/Desktop - Polling)
```http
GET /api/qr-login/status/{sessionId}
```

**Respuestas posibles:**
```json
// Pendiente
{
  "status": "pending"
}

// Escaneado
{
  "status": "scanned",
  "scannedBy": "Juan Pérez"
}

// Aprobado
{
  "status": "approved",
  "token": "jwt_token_here"
}

// Rechazado
{
  "status": "rejected"
}

// Expirado
{
  "status": "expired"
}
```

#### Cancelar Sesión
```http
POST /api/qr-login/cancel
Content-Type: application/json

{
  "sessionId": "uuid-v4"
}
```

### Implementación en Frontend

**Web/Desktop:**
```javascript
// 1. Crear sesión QR
const response = await fetch('/api/qr-login/create', { method: 'POST' });
const { sessionId, qrCode, expiresAt } = await response.json();

// 2. Mostrar código QR
document.getElementById('qr-image').src = qrCode;

// 3. Polling para verificar estado cada 2 segundos
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/qr-login/status/${sessionId}`);
  const { status, token } = await statusResponse.json();

  if (status === 'approved') {
    clearInterval(pollInterval);
    // Guardar token y redirigir
    localStorage.setItem('auth_token', token);
    window.location.href = '/dashboard';
  } else if (status === 'rejected' || status === 'expired') {
    clearInterval(pollInterval);
    // Mostrar error
  }
}, 2000);

// 4. Limpiar polling cuando expire o se cancele
setTimeout(() => clearInterval(pollInterval), 120000); // 2 minutos
```

**App Móvil:**
```javascript
// 1. Escanear código QR con expo-camera o expo-barcode-scanner
const { sessionId } = JSON.parse(qrData);

// 2. Marcar como escaneado
await fetch('/api/qr-login/scan', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ sessionId })
});

// 3. Mostrar confirmación al usuario
// "¿Deseas iniciar sesión en este dispositivo?"

// 4. Aprobar o rechazar
if (userApproved) {
  await fetch('/api/qr-login/approve', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });
} else {
  await fetch('/api/qr-login/reject', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });
}
```

---

## 🔗 3. Magic Links - Enlaces Seguros

### Flujo

1. Usuario ingresa su email
2. Se envía un email con un enlace único
3. Usuario hace clic en el enlace
4. Login automático sin contraseña

### Endpoints

#### Solicitar Magic Link
```http
POST /api/magic-link/create
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

**Respuesta (siempre la misma por seguridad):**
```json
{
  "message": "Si el email existe, se ha enviado un enlace de acceso seguro"
}
```

#### Verificar Magic Link
```http
POST /api/magic-link/verify
Content-Type: application/json

{
  "token": "hex_token_from_email"
}
```

**Respuesta:**
```json
{
  "token": "jwt_token",
  "user": {
    "_id": "...",
    "name": "Juan Pérez",
    "email": "usuario@example.com",
    "role": "residente",
    ...
  },
  "deviceId": "device_id",
  "expiresIn": 604800,
  "message": "Autenticación exitosa"
}
```

#### Revocar Magic Links
```http
POST /api/magic-link/revoke
Authorization: Bearer {token}
```

### Email Template

El email enviado incluye:
- Botón de "Iniciar Sesión"
- Enlace de texto como alternativa
- Advertencia de expiración (15 minutos)
- Advertencia de uso único
- Información del dispositivo detectado

---

## 💻 4. Gestión de Dispositivos

### Funcionalidades

- Ver todos los dispositivos activos
- Editar nombre del dispositivo
- Cerrar sesión en dispositivo específico
- Cerrar sesión en todos los demás dispositivos
- Ver estadísticas de dispositivos

### Endpoints

#### Listar Dispositivos
```http
GET /api/devices
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "devices": [
    {
      "_id": "device_id",
      "deviceName": "iPhone de Juan",
      "deviceType": "mobile",
      "deviceOS": "iOS 17.2",
      "deviceBrowser": null,
      "deviceModel": "iPhone 14 Pro",
      "deviceIcon": "📱",
      "ipAddress": "192.168.1.100",
      "lastActive": "2025-12-27T10:30:00.000Z",
      "isActive": true,
      "createdAt": "2025-12-20T08:00:00.000Z"
    },
    {
      "_id": "device_id_2",
      "deviceName": "Chrome en Windows",
      "deviceType": "web",
      "deviceOS": "Windows 11",
      "deviceBrowser": "Chrome 120.0",
      "deviceIcon": "🌐",
      "ipAddress": "192.168.1.101",
      "lastActive": "2025-12-27T09:15:00.000Z",
      "isActive": true,
      "createdAt": "2025-12-25T14:30:00.000Z"
    }
  ],
  "total": 2
}
```

#### Actualizar Nombre de Dispositivo
```http
PATCH /api/devices/{deviceId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceName": "Mi iPhone Personal"
}
```

**Respuesta:**
```json
{
  "message": "Nombre de dispositivo actualizado",
  "device": { ... }
}
```

#### Cerrar Sesión en Dispositivo
```http
DELETE /api/devices/{deviceId}
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Dispositivo desactivado exitosamente"
}
```

#### Cerrar Sesión en Otros Dispositivos
```http
POST /api/devices/deactivate-others
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Todos los demás dispositivos han sido desactivados"
}
```

#### Estadísticas de Dispositivos
```http
GET /api/devices/stats
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "total": 5,
  "active": 5,
  "byType": {
    "web": 2,
    "mobile": 2,
    "desktop": 1
  }
}
```

### Iconos de Dispositivos

Los dispositivos se muestran con iconos según su tipo:
- 📱 Móvil
- 🌐 Web
- 💻 Desktop

---

## 🔄 Login Mejorado

### Nuevo Flujo de Login

El endpoint de login ahora soporta:
- Autenticación de dos factores (2FA)
- Registro automático de dispositivos
- Nombre personalizado de dispositivo
- Tokens con duración de 7 días

### Endpoint Actualizado

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña",
  "twoFactorToken": "123456",  // Opcional, solo si tiene 2FA
  "deviceName": "Mi Laptop"     // Opcional
}
```

**Respuesta (sin 2FA):**
```json
{
  "token": "jwt_token",
  "user": { ... },
  "deviceId": "device_id",
  "expiresIn": 604800
}
```

**Respuesta (requiere 2FA):**
```json
{
  "requiresTwoFactor": true,
  "message": "Se requiere código de autenticación de dos factores"
}
```

---

## 📦 Modelos de Base de Datos

### Device
```typescript
{
  userId: ObjectId,
  deviceName: string,                    // Editable por el usuario
  deviceType: 'web' | 'mobile' | 'desktop',
  deviceOS?: string,                     // "iOS 17.2", "Windows 11"
  deviceBrowser?: string,                // "Chrome 120.0"
  deviceModel?: string,                  // "iPhone 14 Pro"
  deviceIcon?: string,                   // "📱", "🌐", "💻"
  ipAddress?: string,
  userAgent?: string,
  lastActive: Date,
  isActive: boolean,
  token?: string,                        // JWT token (no se retorna en queries)
  refreshToken?: string,
  location?: {
    country?: string,
    city?: string,
    lat?: number,
    lon?: number
  },
  trustScore?: number,                   // 0-100
  createdAt: Date,
  updatedAt: Date
}
```

### QRLoginSession
```typescript
{
  sessionId: string,                     // UUID v4
  qrCode: string,                        // Código QR en base64
  deviceInfo?: {
    type: 'web' | 'desktop',
    userAgent?: string,
    ipAddress?: string,
    platform?: string
  },
  status: 'pending' | 'scanned' | 'approved' | 'rejected' | 'expired',
  scannedBy?: ObjectId,                  // Usuario que escaneó
  scannedAt?: Date,
  approvedAt?: Date,
  token?: string,                        // JWT generado (no se retorna)
  expiresAt: Date,                       // 2 minutos
  createdAt: Date
}
```

### MagicLink
```typescript
{
  userId: ObjectId,
  token: string,                         // Token único
  deviceInfo?: {
    type: 'web' | 'mobile' | 'desktop',
    userAgent?: string,
    ipAddress?: string
  },
  expiresAt: Date,                       // 15 minutos
  usedAt?: Date,
  isUsed: boolean,
  createdAt: Date
}
```

### User (campos agregados)
```typescript
{
  auth: {
    email: string,
    password: string,
    twoFactorSecret?: string,            // Secreto TOTP
    twoFactorEnabled: boolean,           // 2FA habilitado
    twoFactorBackupCodes?: string[]      // Códigos de respaldo hasheados
  },
  ...
}
```

---

## 🛡️ Seguridad

### Autenticación de Dos Factores (2FA)
- Secreto de 32 caracteres generado con speakeasy
- Ventana de tiempo de ±60 segundos para TOTP
- 10 códigos de respaldo hasheados con SHA-256
- Códigos de respaldo de un solo uso

### Magic Links
- Token de 32 bytes (64 caracteres hex)
- Expiración de 15 minutos
- Uso único (se marca como usado tras verificación)
- No se revela si el email existe o no

### QR Login
- Session ID con UUID v4
- Expiración de 2 minutos
- Limpieza automática con TTL index
- Requiere autenticación en app móvil para aprobar

### Dispositivos
- Detección automática de tipo, OS y navegador
- IP address y user agent registrados
- Tokens asociados a dispositivos específicos
- Limpieza automática de dispositivos inactivos (30 días)

---

## 🔧 Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```env
# Magic Links & QR Login
WEB_URL=http://localhost:52341
MOBILE_DEEP_LINK=securepass://
DESKTOP_URL=http://localhost:52341

# Email (necesario para magic links)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Redis (opcional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false
```

### Dependencias

```bash
npm install speakeasy ua-parser-js
npm install --save-dev @types/speakeasy @types/ua-parser-js
```

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Habilitar 2FA

```javascript
// 1. Generar secreto
const { qrCode, secret } = await fetch('/api/2fa/generate', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 2. Mostrar QR al usuario
document.getElementById('qr').src = qrCode;

// 3. Usuario escanea con Google Authenticator e ingresa código
const code = prompt('Ingresa el código de Google Authenticator');

// 4. Habilitar 2FA
const { backupCodes } = await fetch('/api/2fa/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ secret, token: code })
}).then(r => r.json());

// 5. Guardar códigos de respaldo
console.log('Códigos de respaldo:', backupCodes);
```

### Ejemplo 2: Login con QR desde App Móvil

```javascript
// En Web/Desktop
const createQRSession = async () => {
  const { sessionId, qrCode } = await fetch('/api/qr-login/create', {
    method: 'POST'
  }).then(r => r.json());

  // Mostrar QR
  setQRCode(qrCode);

  // Polling
  const interval = setInterval(async () => {
    const { status, token } = await fetch(`/api/qr-login/status/${sessionId}`)
      .then(r => r.json());

    if (status === 'approved') {
      clearInterval(interval);
      login(token);
    }
  }, 2000);

  return () => clearInterval(interval);
};

// En App Móvil (React Native + Expo)
import { BarCodeScanner } from 'expo-barcode-scanner';

const scanQR = async ({ data }) => {
  const { sessionId } = JSON.parse(data);

  // Escanear
  await fetch('/api/qr-login/scan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });

  // Mostrar confirmación
  Alert.alert(
    '¿Iniciar sesión?',
    '¿Deseas iniciar sesión en este dispositivo?',
    [
      {
        text: 'Rechazar',
        onPress: () => rejectLogin(sessionId)
      },
      {
        text: 'Aprobar',
        onPress: () => approveLogin(sessionId)
      }
    ]
  );
};

const approveLogin = async (sessionId) => {
  await fetch('/api/qr-login/approve', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });
};
```

### Ejemplo 3: Enviar Magic Link

```javascript
// Solicitar magic link
const requestMagicLink = async (email) => {
  await fetch('/api/magic-link/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  alert('Si el email existe, recibirás un enlace de acceso');
};

// Verificar magic link (cuando el usuario hace clic)
const verifyMagicLink = async (token) => {
  const { token: jwtToken, user } = await fetch('/api/magic-link/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  }).then(r => r.json());

  // Guardar token y redirigir
  localStorage.setItem('auth_token', jwtToken);
  window.location.href = '/dashboard';
};
```

### Ejemplo 4: Gestión de Dispositivos

```javascript
// Listar dispositivos
const devices = await fetch('/api/devices', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Actualizar nombre
await fetch(`/api/devices/${deviceId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ deviceName: 'Mi iPhone Personal' })
});

// Cerrar sesión en dispositivo
await fetch(`/api/devices/${deviceId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Cerrar sesión en todos los demás
await fetch('/api/devices/deactivate-others', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🎯 Mejores Prácticas

### Para Frontend

1. **QR Login:** Usar polling con intervalo de 2 segundos
2. **Magic Links:** Extraer token de URL query parameter
3. **2FA:** Validar formato de código (6 dígitos) antes de enviar
4. **Dispositivos:** Mostrar últimaactividad en formato relativo ("hace 2 horas")

### Para Backend

1. **Seguridad:** Usar rate limiting en todos los endpoints sensibles
2. **Limpieza:** Ejecutar cleanup de sesiones y links expirados periódicamente
3. **Logging:** Registrar todos los intentos de autenticación en AuditLog
4. **Emails:** Usar plantillas HTML profesionales

### Para Móvil

1. **Permisos:** Solicitar permiso de cámara antes de escanear QR
2. **UX:** Mostrar confirmación clara antes de aprobar login
3. **Seguridad:** Validar formato de QR antes de procesar
4. **Feedback:** Mostrar estado visual durante el proceso

---

## 🐛 Troubleshooting

### Error: "Código 2FA inválido"
- Verificar que el reloj del dispositivo esté sincronizado
- El código tiene 30 segundos de validez
- Usar códigos de respaldo si es necesario

### Error: "Magic link expirado"
- Los enlaces expiran en 15 minutos
- Solicitar nuevo enlace

### Error: "Sesión QR expirada"
- Las sesiones QR expiran en 2 minutos
- Generar nuevo código QR

### No se reciben emails
- Verificar configuración de EMAIL_USER y EMAIL_PASSWORD
- Usar "App Password" de Gmail, no la contraseña normal
- Verificar que el email no esté en spam

---

## 📝 Changelog

### v1.0.0 (2025-12-27)
- ✅ Implementación de Google Authenticator (2FA/TOTP)
- ✅ Sistema de login con código QR
- ✅ Magic links para autenticación sin contraseña
- ✅ Gestión completa de dispositivos y sesiones
- ✅ Nombres editables de dispositivos
- ✅ Detección automática de tipo de dispositivo
- ✅ Códigos de respaldo para 2FA
- ✅ Limpieza automática de sesiones expiradas
- ✅ Documentación completa de APIs

---

## 📄 Licencia

SecurePass © 2025
