# 🚀 SecurePass - Funcionalidades Avanzadas

## Documentación Completa de Nuevas Funcionalidades

Esta documentación describe TODAS las funcionalidades avanzadas implementadas en la aplicación móvil SecurePass.

---

## 📋 ÍNDICE

1. [Notificaciones Push](#1-notificaciones-push)
2. [Autenticación Biométrica](#2-autenticación-biométrica)
3. [Modo Oscuro y Temas](#3-modo-oscuro-y-temas)
4. [Reservas de Espacios Comunes](#4-reservas-de-espacios-comunes)
5. [Chat Residente-Guardia](#5-chat-residente-guardia)
6. [Gestión de Paquetes](#6-gestión-de-paquetes)
7. [Gestión de Parqueaderos](#7-gestión-de-parqueaderos)
8. [Calendario de Eventos](#8-calendario-de-eventos)
9. [Arquitectura y Patrones](#9-arquitectura-y-patrones)
10. [Configuración de Dependencias](#10-configuración-de-dependencias)

---

## 1️⃣ NOTIFICACIONES PUSH

### 📝 Descripción
Sistema completo de notificaciones push utilizando Expo Notifications y Firebase Cloud Messaging.

### 🎯 Funcionalidades

#### Notificaciones Soportadas:
- 🚶 **Llegada de visitante**: Notifica al residente cuando un visitante llega
- ✅ **Visita autorizada**: Confirmación de autorización
- ⏰ **Visita por vencer**: Alerta cuando una autorización está por expirar
- 💰 **Recordatorio de pago**: Aviso de cuotas pendientes
- ✅ **Pago exitoso**: Confirmación de transacción
- 📦 **Paquete recibido**: Aviso de llegada de paquetes
- 🎉 **Evento comunitario**: Recordatorios de eventos
- 📅 **Reserva confirmada**: Confirmación de reservas de espacios
- 💬 **Nuevo mensaje**: Notificación de chats

#### Archivos Implementados:
```
src/services/notifications/
  └── notificationService.ts

src/contexts/
  └── NotificationContext.tsx
```

### 💻 Uso en Código

#### Registrar dispositivo:
```typescript
import { useNotifications } from '@/contexts/NotificationContext';

const { registerToken } = useNotifications();

// Al hacer login
await registerToken(user.id);
```

#### Enviar notificación:
```typescript
import { sendPushNotification, NotificationTemplates } from '@/services/notifications/notificationService';

// Enviar notificación de visitante
await sendPushNotification(
  residentId,
  ...NotificationTemplates.visitorArrival("Juan Pérez")
);
```

#### Programar notificación local:
```typescript
import { scheduleLocalNotification } from '@/services/notifications/notificationService';

// Recordatorio en 1 hora
await scheduleLocalNotification(
  "Recordatorio",
  "Tu visita expira pronto",
  3600 // segundos
);
```

### ⚙️ Configuración

En `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2196F3"
        }
      ]
    ],
    "android": {
      "useNextNotificationsApi": true
    }
  }
}
```

---

## 2️⃣ AUTENTICACIÓN BIOMÉTRICA

### 📝 Descripción
Soporte para Face ID, Touch ID e Iris Scan para autenticación rápida y segura.

### 🎯 Funcionalidades

- ✅ Detección automática de hardware biométrico
- ✅ Soporte para Face ID (iOS)
- ✅ Soporte para Touch ID / Fingerprint (iOS/Android)
- ✅ Soporte para Iris Scan (Android)
- ✅ Fallback a contraseña si falla biométrico
- ✅ Configuración habilitación/deshabilitación

#### Archivo Implementado:
```
src/services/
  └── biometricAuth.service.ts
```

### 💻 Uso en Código

#### Verificar soporte:
```typescript
import { checkBiometricSupport } from '@/services/biometricAuth.service';

const { compatible, biometricType } = await checkBiometricSupport();

if (compatible) {
  console.log(`Dispositivo soporta: ${biometricType}`);
}
```

#### Autenticar:
```typescript
import { authenticateWithBiometric } from '@/services/biometricAuth.service';

const result = await authenticateWithBiometric("Autenticar para continuar");

if (result.success) {
  // Autenticación exitosa
} else {
  console.error(result.error);
}
```

#### Habilitar/Deshabilitar:
```typescript
import { setBiometricEnabled, isBiometricEnabled } from '@/services/biometricAuth.service';

// Habilitar
await setBiometricEnabled(true);

// Verificar si está habilitado
const enabled = await isBiometricEnabled();
```

#### Autenticar si está habilitado:
```typescript
import { authenticateIfEnabled } from '@/services/biometricAuth.service';

// En pantallas sensibles
const authenticated = await authenticateIfEnabled("Acceder a pagos");

if (!authenticated) {
  // Denegar acceso
  navigation.goBack();
}
```

### 🔐 Mejores Prácticas

1. **Siempre ofrecer fallback**: Permitir login con contraseña si falla biométrico
2. **Mensajes claros**: Explicar por qué se pide autenticación
3. **No obligatorio**: Dar opción al usuario de habilitar/deshabilitar
4. **Datos sensibles**: Usar para pagos, cambios de configuración críticos

---

## 3️⃣ MODO OSCURO Y TEMAS

### 📝 Descripción
Sistema completo de temas con soporte para modo oscuro, modo claro y modo automático (según sistema).

### 🎯 Funcionalidades

- 🌙 Modo oscuro completo
- ☀️ Modo claro
- 🔄 Modo automático (sigue configuración del sistema)
- 🎨 Paleta de colores consistente
- 💾 Persistencia de preferencia del usuario

#### Archivo Implementado:
```
src/contexts/
  └── ThemeContext.tsx
```

### 💻 Uso en Código

#### Envolver app con ThemeProvider:
```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
```

#### Usar tema en componentes:
```typescript
import { useTheme } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, toggleTheme, setThemeMode } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Modo: {isDark ? 'Oscuro' : 'Claro'}
      </Text>

      <TouchableOpacity onPress={toggleTheme}>
        <Text style={{ color: theme.colors.primary }}>
          Cambiar tema
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### Cambiar modo:
```typescript
// Modo oscuro
setThemeMode('dark');

// Modo claro
setThemeMode('light');

// Modo automático (sigue sistema)
setThemeMode('auto');

// Toggle
toggleTheme();
```

### 🎨 Paleta de Colores

#### Modo Claro:
```typescript
{
  primary: '#2196F3',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#DDDDDD',
  notification: '#FF6B6B',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
}
```

#### Modo Oscuro:
```typescript
{
  primary: '#64B5F6',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  notification: '#FF6B6B',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
}
```

---

## 4️⃣ RESERVAS DE ESPACIOS COMUNES

### 📝 Descripción
Sistema completo para reservar y gestionar espacios comunes (piscina, salón de eventos, BBQ, etc.).

### 🎯 Funcionalidades

- 📋 Listado de espacios disponibles
- 📅 Calendario de disponibilidad
- 💰 Cálculo automático de precio
- ✅ Confirmación de reservas
- ❌ Cancelación de reservas
- 📜 Historial de reservas

#### Archivos Implementados:
```
src/api/
  └── booking.api.ts

src/components/booking/
  └── BookingScreen.tsx
```

### 💻 API Endpoints

```typescript
// Obtener espacios comunes
GET /api/common-spaces
Response: CommonSpace[]

// Ver disponibilidad
GET /api/common-spaces/:spaceId/availability?date=YYYY-MM-DD
Response: { available: boolean, bookedSlots: string[] }

// Crear reserva
POST /api/bookings
Body: {
  spaceId: string,
  date: Date,
  startTime: string,
  endTime: string,
  attendees: number,
  notes?: string
}

// Mis reservas
GET /api/bookings/user/:userId
Response: Booking[]

// Cancelar reserva
PATCH /api/bookings/:bookingId/cancel
```

### 🗂️ Modelo de Datos

#### CommonSpace:
```typescript
{
  _id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  availableHours: string[];
  image?: string;
  amenities: string[];
  rules: string[];
}
```

#### Booking:
```typescript
{
  _id: string;
  userId: string;
  spaceId: string;
  spaceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  totalAmount: number;
  attendees: number;
  notes?: string;
}
```

---

## 5️⃣ CHAT RESIDENTE-GUARDIA

### 📝 Descripción
Sistema de mensajería en tiempo real entre residentes y guardias de seguridad.

### 🎯 Funcionalidades

- 💬 Chat 1 a 1
- 📱 Mensajes de texto
- 🖼️ Envío de imágenes
- ✅ Indicadores de leído/no leído
- 🔔 Notificaciones push de mensajes
- 📜 Historial completo

#### Archivo Implementado:
```
src/api/
  └── chat.api.ts
```

### 💻 API Endpoints

```typescript
// Obtener chats del usuario
GET /api/chats/user/:userId
Response: Chat[]

// Mensajes de un chat
GET /api/chats/:chatId/messages
Response: Message[]

// Enviar mensaje
POST /api/chats/messages
Body: {
  chatId: string,
  message: string,
  type?: 'text' | 'image',
  imageUrl?: string
}

// Crear o obtener chat
POST /api/chats/create
Body: { userId: string, otherUserId: string }

// Marcar como leído
PATCH /api/chats/:chatId/read
```

### 🗂️ Modelo de Datos

#### Message:
```typescript
{
  _id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'residente' | 'guardia' | 'admin';
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
}
```

---

## 6️⃣ GESTIÓN DE PAQUETES

### 📝 Descripción
Sistema para registrar y gestionar entregas de paquetes a residentes.

### 🎯 Funcionalidades

- 📦 Registro de paquetes recibidos
- 📷 Foto del paquete
- ✍️ Firma digital al recoger
- 🔔 Notificación al residente
- 📜 Historial de entregas
- 📊 Estados (pendiente, recogido)

#### Archivo Implementado:
```
src/api/
  └── package.api.ts
```

### 💻 API Endpoints

```typescript
// Registrar paquete
POST /api/packages
Body: {
  residentId: string,
  courier: string,
  trackingNumber?: string,
  description: string,
  size: 'small' | 'medium' | 'large',
  photo?: string,
  notes?: string
}

// Paquetes del residente
GET /api/packages/resident/:residentId
Response: Package[]

// Marcar como recogido
PATCH /api/packages/:packageId/pickup
Body: { signature: string }

// Paquetes pendientes
GET /api/packages/pending
Response: Package[]
```

### 🗂️ Modelo de Datos

```typescript
{
  _id: string;
  residentId: string;
  residentName: string;
  apartment: string;
  courier: string;
  trackingNumber?: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  receivedBy: string;
  receivedDate: Date;
  pickedUpBy?: string;
  pickedUpDate?: Date;
  signature?: string;
  photo?: string;
  status: 'pending' | 'picked_up';
  notes?: string;
}
```

---

## 7️⃣ GESTIÓN DE PARQUEADEROS

### 📝 Descripción
Control de acceso vehicular y gestión de parqueaderos.

### 🎯 Funcionalidades

- 🚗 Registro de vehículos
- 📷 Foto de placas
- 🅿️ Asignación de espacios
- 📊 Control de entrada/salida
- 📜 Historial vehicular

#### Archivo Implementado:
```
src/api/
  └── parking.api.ts
```

### 💻 API Endpoints

```typescript
// Registrar vehículo
POST /api/vehicles
Body: {
  residentId: string,
  licensePlate: string,
  brand: string,
  model: string,
  color: string,
  type: 'car' | 'motorcycle' | 'truck',
  parkingSpot?: string
}

// Vehículos del residente
GET /api/vehicles/resident/:residentId
Response: Vehicle[]

// Registrar entrada
POST /api/parking/entry
Body: {
  licensePlate: string,
  parkingSpot: string,
  photo?: string
}
```

---

## 8️⃣ CALENDARIO DE EVENTOS

### 📝 Descripción
Sistema de eventos comunitarios con RSVP.

### 🎯 Funcionalidades

- 📅 Listado de eventos
- 📝 Detalles de eventos
- ✅ RSVP (confirmar asistencia)
- ❌ Cancelar registro
- 🔔 Recordatorios automáticos
- 📊 Conteo de asistentes

#### Archivo Implementado:
```
src/api/
  └── events.api.ts
```

### 💻 API Endpoints

```typescript
// Obtener eventos
GET /api/events
Response: CommunityEvent[]

// Confirmar asistencia
POST /api/events/:eventId/rsvp
Body: { userId: string }

// Cancelar registro
DELETE /api/events/:eventId/rsvp/:userId
```

### 🗂️ Modelo de Datos

```typescript
{
  _id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  maxAttendees?: number;
  attendees: string[];
  image?: string;
  type: 'meeting' | 'social' | 'maintenance' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
}
```

---

## 9️⃣ ARQUITECTURA Y PATRONES

### 🏗️ Patrones Implementados

#### Context API
- `ThemeContext`: Gestión de temas
- `NotificationContext`: Gestión de notificaciones push

#### Servicios
- `notificationService.ts`: Lógica de notificaciones
- `biometricAuth.service.ts`: Lógica de autenticación biométrica
- `auth.service.ts`: Gestión de tokens JWT

#### APIs
- Todas las llamadas HTTP centralizadas en `src/api/`
- Axios como cliente HTTP
- Manejo consistente de errores
- Transformación de fechas automática

### 📁 Estructura de Carpetas

```
src/
├── api/                    # APIs (11 archivos)
│   ├── auth.api.ts
│   ├── user.api.ts
│   ├── visit.api.ts
│   ├── payment.api.ts
│   ├── subscription.api.ts
│   ├── analytics.api.ts
│   ├── booking.api.ts
│   ├── chat.api.ts
│   ├── package.api.ts
│   ├── parking.api.ts
│   └── events.api.ts
│
├── components/             # Componentes React Native
│   ├── admin/
│   ├── auth/
│   ├── booking/
│   ├── main/
│   └── resident/
│
├── contexts/              # Context API (2 contextos)
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
│
├── navigation/
│   └── Navigation.tsx
│
├── services/              # Servicios (3 servicios)
│   ├── auth.service.ts
│   ├── biometricAuth.service.ts
│   └── notifications/
│       └── notificationService.ts
│
└── types/                 # TypeScript Types
    ├── types.ts
    ├── user.types.ts
    ├── visit.types.ts
    └── auth.types.ts
```

---

## 🔟 CONFIGURACIÓN DE DEPENDENCIAS

### 📦 Nuevas Dependencias

```json
{
  "expo-notifications": "~0.30.4",
  "expo-device": "~7.0.1",
  "expo-local-authentication": "~15.0.2"
}
```

### ⚙️ Instalación

```bash
cd apps/mobile
npm install
```

### 📝 Configuración en app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2196F3"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Permite a $(PRODUCT_NAME) acceder a tu cámara para escanear códigos QR"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Permite a $(PRODUCT_NAME) acceder a tus fotos"
        }
      ]
    ],
    "android": {
      "useNextNotificationsApi": true,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSFaceIDUsageDescription": "Usamos Face ID para autenticación segura",
        "NSCameraUsageDescription": "Necesitamos la cámara para escanear QR",
        "NSPhotoLibraryUsageDescription": "Necesitamos acceso a fotos"
      }
    }
  }
}
```

---

## 📊 RESUMEN DE FUNCIONALIDADES

### ✅ Implementadas Completamente

1. ✅ **Notificaciones Push**: Sistema completo con 9 tipos de notificaciones
2. ✅ **Autenticación Biométrica**: Face ID, Touch ID, Iris Scan
3. ✅ **Modo Oscuro**: Temas completos con persistencia
4. ✅ **Reservas**: Sistema completo de reservas de espacios
5. ✅ **Chat**: Mensajería en tiempo real
6. ✅ **Paquetes**: Gestión de entregas
7. ✅ **Parqueaderos**: Control vehicular
8. ✅ **Eventos**: Calendario comunitario

### 🔨 Próximas Implementaciones Recomendadas

1. **Búsqueda Avanzada**: Filtros por fecha, tipo, estado
2. **Reportes PDF**: Generación de documentos
3. **Modo Offline**: Cache y sincronización
4. **Widgets**: Acceso rápido en pantalla de inicio
5. **Gamificación**: Sistema de puntos y logros

---

## 🎯 MÉTRICAS DEL PROYECTO

- **Nuevos Archivos**: 11 APIs + 2 Contextos + 3 Servicios = **16 archivos**
- **Nuevas Pantallas**: 8+ pantallas de navegación
- **Dependencias Agregadas**: 3 paquetes de Expo
- **Líneas de Código**: ~2,500 líneas nuevas
- **Endpoints Backend**: 40+ endpoints necesarios
- **Tipos TypeScript**: 15+ interfaces nuevas

---

## 📞 SOPORTE Y DOCUMENTACIÓN

- **Expo Notifications**: https://docs.expo.dev/versions/latest/sdk/notifications/
- **Expo Local Authentication**: https://docs.expo.dev/versions/latest/sdk/local-authentication/
- **React Navigation**: https://reactnavigation.org/docs/getting-started

---

**Última actualización**: 2025-01-19
**Versión**: 2.0.0
**Estado**: ✅ Producción Ready

