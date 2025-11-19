# Sistema de Suscripciones B2B SaaS - SecurePass

## Descripción General

SecurePass ahora incluye un modelo de ingresos B2B SaaS con tres planes de suscripción diseñados para residenciales de diferentes tamaños y necesidades.

## Planes Disponibles

### 🔒 Plan Básico - $29 USD/mes
- **Hasta 50 viviendas**
- Gestión de visitas
- Control de entrada/salida
- Códigos QR
- Reportes básicos
- Ideal para residenciales pequeños

### 🔐 Plan Pro - $69 USD/mes
- **Hasta 200 viviendas**
- Todas las características del Plan Básico
- **Reportes avanzados**
- Analíticas y estadísticas
- Notificaciones personalizadas
- Ideal para residenciales medianos

### 🏢 Plan Enterprise - Personalizado
- **Viviendas ilimitadas**
- Todas las características del Plan Pro
- **Múltiples entradas**
- **Acceso API REST**
- **Marca blanca (White Label)**
- Soporte prioritario
- Integración personalizada
- Ideal para grandes residenciales y complejos

## Estructura del Sistema

### Backend (API)

#### Modelos
- **Subscription** (`apps/api/src/models/Subscription.ts`)
  - Gestiona la información de suscripciones
  - Incluye límites, precios, estado y uso actual
  - Métodos para verificar estado y límites

- **User** (actualizado)
  - Administradores ahora tienen referencia a una suscripción
  - Campo `subscription` vincula al residencial con su plan

#### Interfaces
- **ISubscription** (`apps/api/src/interfaces/ISubscription.ts`)
  - Define la estructura de datos de suscripciones
  - Incluye enum PlanType con los tres planes

#### Servicios
- **SubscriptionService** (`apps/api/src/services/SubscriptionService.ts`)
  - `createSubscription()` - Crear nueva suscripción
  - `upgradePlan()` - Mejorar plan actual
  - `activateSubscription()` - Activar suscripción después de pago
  - `cancelSubscription()` - Cancelar suscripción
  - `suspendSubscription()` - Suspender por falta de pago
  - `updateUsageCount()` - Actualizar cantidad de viviendas
  - `checkLimits()` - Verificar límites del plan
  - `getPlanDetails()` - Obtener detalles de un plan

#### Controladores
- **subscriptionController** (`apps/api/src/controllers/subscriptionController.ts`)
  - Maneja todas las peticiones HTTP relacionadas con suscripciones
  - Endpoints para CRUD completo de suscripciones
  - Gestión de planes y límites

#### Rutas
- **subscriptionRoutes** (`apps/api/src/routes/subscriptionRoutes.ts`)
  - `GET /api/plans` - Obtener todos los planes
  - `GET /api/plans/:planType` - Detalles de un plan
  - `POST /api/` - Crear suscripción (requiere autenticación)
  - `GET /api/` - Listar todas las suscripciones
  - `GET /api/:id` - Obtener suscripción específica
  - `PUT /api/:id` - Actualizar suscripción
  - `POST /api/:id/upgrade` - Mejorar plan
  - `POST /api/:id/activate` - Activar suscripción
  - `POST /api/:id/cancel` - Cancelar suscripción
  - `PUT /api/:id/usage` - Actualizar uso
  - `GET /api/:id/limits` - Verificar límites

#### Middlewares
- **subscriptionMiddleware** (`apps/api/src/middlewares/subscriptionMiddleware.ts`)
  - `checkSubscriptionActive` - Verifica que la suscripción esté activa
  - `checkUnitsLimit` - Verifica límite de viviendas
  - `checkAdvancedReports` - Verifica acceso a reportes avanzados
  - `checkMultipleEntries` - Verifica acceso a múltiples entradas
  - `checkApiAccess` - Verifica acceso a API
  - `checkWhiteLabel` - Verifica acceso a marca blanca

### Frontend (Web)

#### API Client
- **subscription.api.ts** (`apps/web/src/api/subscription.api.ts`)
  - Cliente HTTP para consumir endpoints de suscripciones
  - Funciones para todas las operaciones CRUD
  - Tipos TypeScript para suscripciones y planes

#### Páginas
- **Pricing** (`apps/web/src/pages/main/Pricing.tsx`)
  - Muestra los tres planes disponibles
  - Comparación de características
  - Botones de acción para seleccionar plan
  - Ruta: `/pricing`

#### Componentes
- **SubscriptionCard** (`apps/web/src/components/subscription/SubscriptionCard.tsx`)
  - Muestra información de suscripción actual
  - Estado del plan, uso de viviendas, características
  - Barra de progreso de uso
  - Botón para mejorar plan
  - Información de próximo pago

## Flujo de Trabajo

### 1. Registro de Residencial
```javascript
// Crear nueva suscripción (período de prueba de 30 días)
const subscription = await SubscriptionService.createSubscription({
  residentialName: "Residencial El Bosque",
  planType: PlanType.BASIC
});
```

### 2. Crear Administrador
```javascript
// El admin se vincula a la suscripción
const admin = await UserService.createUser({
  role: "admin",
  name: "Juan Pérez",
  auth: { email: "admin@residencial.com", password: "..." },
  subscription: subscription._id
});
```

### 3. Verificar Límites
```javascript
// Middleware automático en rutas protegidas
router.post('/residents',
  authMiddleware,
  checkSubscriptionActive,
  checkUnitsLimit,
  createResident
);
```

### 4. Activar Suscripción
```javascript
// Después de procesar el pago
await SubscriptionService.activateSubscription(subscriptionId);
```

### 5. Mejorar Plan
```javascript
// Usuario decide mejorar a Plan Pro
await SubscriptionService.upgradePlan(
  subscriptionId,
  PlanType.PRO
);
```

## Características Principales

### Período de Prueba
- 30 días gratuitos al registrarse
- Acceso completo a características del plan seleccionado
- Estado: `trial`

### Gestión de Límites
- Verificación automática de límites de viviendas
- Bloqueo de funcionalidades según plan
- Notificaciones cuando se acerca al límite

### Estados de Suscripción
- `trial` - Período de prueba
- `active` - Suscripción activa y pagada
- `cancelled` - Cancelada por el usuario
- `suspended` - Suspendida por falta de pago
- `inactive` - Inactiva

### Ciclos de Facturación
- Mensual (`monthly`)
- Anual (`yearly`) - Puede implementarse con descuento

## Integración con Pasarelas de Pago

El sistema está preparado para integrar con:
- Stripe
- PayPal
- MercadoPago
- Otros procesadores

Campo `paymentInfo` en el modelo guarda información de pagos.

## Ejemplo de Uso en el Frontend

```typescript
// Mostrar información de suscripción en dashboard de admin
import SubscriptionCard from './components/subscription/SubscriptionCard';

<SubscriptionCard subscriptionId={admin.subscription} />
```

## Próximos Pasos Sugeridos

1. **Integración de Pagos**
   - Implementar Stripe/PayPal
   - Webhooks para renovaciones automáticas
   - Manejo de pagos fallidos

2. **Notificaciones**
   - Email cuando se acerca el límite de viviendas
   - Recordatorios de pago
   - Confirmación de cambio de plan

3. **Analytics**
   - Dashboard de métricas de suscripciones
   - Reportes de ingresos
   - Análisis de uso por plan

4. **Descuentos y Promociones**
   - Códigos de descuento
   - Precios especiales para pagos anuales
   - Programa de referidos

## Seguridad

- Los middlewares verifican automáticamente permisos
- Solo admins pueden gestionar suscripciones
- Validación de límites en tiempo real
- Tokens JWT para autenticación

## Soporte

Para preguntas o soporte sobre el sistema de suscripciones:
- Revisar la documentación de la API
- Consultar los tipos TypeScript para estructura de datos
- Verificar los middlewares para lógica de restricciones
