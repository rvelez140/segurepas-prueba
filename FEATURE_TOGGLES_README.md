# Sistema de Feature Toggles

Este documento explica cómo usar el sistema de Feature Toggles (interruptores de funcionalidades) implementado en la aplicación.

## ¿Qué es un Feature Toggle?

Un Feature Toggle es un mecanismo que permite activar o desactivar funcionalidades de la aplicación sin necesidad de desplegar código nuevo. Esto permite:

- 🔐 Liberar funcionalidades de forma controlada
- 👥 Habilitar features solo para ciertos roles o usuarios
- 🧪 Probar funcionalidades antes de liberarlas completamente
- 🔄 Activar/desactivar features dinámicamente
- 🏢 Ocultar configuraciones que no se usan en cada empresa

## Arquitectura

### Backend

**Modelo de datos** (`apps/api/src/models/FeatureToggle.ts`):
```typescript
{
  key: string;              // Identificador único (ej: "payment_module")
  name: string;             // Nombre legible
  description: string;      // Descripción de la funcionalidad
  enabled: boolean;         // Si está habilitada globalmente
  enabledForRoles: string[]; // Roles con acceso (admin, guardia, residente)
  enabledForUsers: string[]; // IDs de usuarios específicos
  category: string;         // Categoría (pagos, reportes, etc.)
  metadata: object;         // Metadatos adicionales
}
```

**API Endpoints** (`/api/features`):
- `GET /api/features` - Obtener todas las features (admin)
- `GET /api/features/my-features` - Obtener features habilitadas para el usuario actual
- `GET /api/features/check/:key` - Verificar si una feature está habilitada
- `POST /api/features` - Crear nueva feature (admin)
- `PUT /api/features/:key` - Actualizar feature (admin)
- `DELETE /api/features/:key` - Eliminar feature (admin)
- `POST /api/features/:key/toggle` - Activar/desactivar feature (admin)
- `POST /api/features/:key/enable-role` - Habilitar para un rol (admin)
- `POST /api/features/:key/disable-role` - Deshabilitar para un rol (admin)
- `POST /api/features/initialize` - Inicializar features por defecto (admin)

### Frontend

**Context API** (`apps/web/src/contexts/FeatureToggleContext.tsx`):
Proporciona acceso global a las features habilitadas para el usuario actual.

**Hook personalizado**:
```typescript
const { isFeatureEnabled, enabledFeatures, refreshFeatures } = useFeatureToggle();
```

**Componente de Administración** (`apps/web/src/components/settings/FeatureToggleManagement.tsx`):
Panel de administración para gestionar features (solo visible para admins).

## Uso en el Frontend

### 1. Verificar si una feature está habilitada

```tsx
import { useFeatureToggle } from "../contexts/FeatureToggleContext";

const MyComponent = () => {
  const { isFeatureEnabled } = useFeatureToggle();

  return (
    <div>
      {isFeatureEnabled('payment_module') && (
        <PaymentSection />
      )}

      {isFeatureEnabled('advanced_analytics') ? (
        <AdvancedDashboard />
      ) : (
        <BasicDashboard />
      )}
    </div>
  );
};
```

### 2. Obtener lista de features habilitadas

```tsx
const { enabledFeatures } = useFeatureToggle();

console.log('Features habilitadas:', enabledFeatures);
// Resultado: ['payment_module', 'qr_scanner', 'reports_module']
```

### 3. Recargar features después de cambios

```tsx
const { refreshFeatures } = useFeatureToggle();

const handleSomeAction = async () => {
  // ... alguna acción
  await refreshFeatures(); // Recargar features del servidor
};
```

### 4. Ocultar rutas/componentes según features

```tsx
import { useFeatureToggle } from "./contexts/FeatureToggleContext";

const AppRoutes = () => {
  const { isFeatureEnabled } = useFeatureToggle();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {isFeatureEnabled('payment_module') && (
        <Route path="/payments" element={<Payments />} />
      )}

      {isFeatureEnabled('reports_module') && (
        <Route path="/reports" element={<Reports />} />
      )}
    </Routes>
  );
};
```

## Panel de Administración

Los administradores pueden acceder al panel de Feature Toggles desde:

**Ruta**: `/settings` → Sección "Gestión de Funcionalidades"

### Funcionalidades del Panel:

1. **Inicializar Features por Defecto**: Crea las features predefinidas en el sistema
2. **Crear Nueva Feature**: Define una nueva funcionalidad
3. **Editar Feature**: Modifica nombre, descripción, roles, etc.
4. **Activar/Desactivar**: Toggle rápido del estado de la feature
5. **Eliminar Feature**: Borra una feature del sistema
6. **Filtrar por Categoría**: Ver features por categoría

### Features por Defecto

Al inicializar, se crean estas features:

| Key | Nombre | Categoría | Roles |
|-----|--------|-----------|-------|
| `payment_module` | Módulo de Pagos | pagos | admin |
| `qr_scanner` | Escáner QR | autorizaciones | guardia, admin |
| `reports_module` | Módulo de Reportes | reportes | admin |
| `advanced_analytics` | Analíticas Avanzadas | reportes | admin |
| `user_registration` | Registro de Usuarios | usuarios | admin |
| `document_upload` | Carga de Documentos | usuarios | admin, residente |
| `notifications` | Notificaciones | general | todos |
| `subscription_management` | Gestión de Suscripciones | pagos | admin |

## Uso en el Backend

### Verificar feature en un endpoint

```typescript
import FeatureToggleService from '../services/FeatureToggleService';

export const someController = async (req, res) => {
  const user = req.user; // Del middleware de auth

  const canAccessPayments = await FeatureToggleService.isFeatureEnabledForUser(
    'payment_module',
    user.id,
    user.role
  );

  if (!canAccessPayments) {
    return res.status(403).json({ error: 'Funcionalidad no disponible' });
  }

  // Continuar con la lógica...
};
```

### Crear middleware de feature toggle

```typescript
import FeatureToggleService from '../services/FeatureToggleService';

export const requireFeature = (featureKey: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    const isEnabled = await FeatureToggleService.isFeatureEnabledForUser(
      featureKey,
      user.id,
      user.role
    );

    if (!isEnabled) {
      return res.status(403).json({
        error: `Feature '${featureKey}' no está habilitada para este usuario`
      });
    }

    next();
  };
};

// Uso en rutas:
router.post('/payment', authMiddleware, requireFeature('payment_module'), createPayment);
```

## Categorías de Features

- **general**: Funcionalidades generales del sistema
- **pagos**: Módulos de pagos y suscripciones
- **reportes**: Generación de reportes y analíticas
- **autorizaciones**: Gestión de autorizaciones y accesos
- **usuarios**: Gestión de usuarios y perfiles

## Mejores Prácticas

1. **Nombres de Keys**: Usar snake_case y ser descriptivos
   - ✅ `advanced_analytics`, `payment_module`
   - ❌ `feature1`, `newFeature`

2. **Descripción Clara**: Explicar qué hace la feature
   - ✅ "Permite procesar pagos con Stripe y PayPal"
   - ❌ "Pagos"

3. **Categorización**: Agrupar features relacionadas

4. **Control de Acceso**: Usar `enabledForRoles` para limitar acceso

5. **Limpieza**: Eliminar features obsoletas del sistema

6. **Testing**: Verificar el comportamiento con feature ON y OFF

## Ejemplos de Uso Real

### Ejemplo 1: Liberar gradualmente una nueva funcionalidad

```typescript
// 1. Crear feature deshabilitada
await createFeature({
  key: 'new_dashboard',
  name: 'Nuevo Dashboard',
  description: 'Dashboard rediseñado con nuevas métricas',
  enabled: false,
  category: 'reportes'
});

// 2. Habilitar solo para admins
await enableForRole('new_dashboard', 'admin');
await updateFeature('new_dashboard', { enabled: true });

// 3. Después de probar, habilitar para todos
await updateFeature('new_dashboard', {
  enabled: true,
  enabledForRoles: ['admin', 'guardia', 'residente']
});
```

### Ejemplo 2: Feature flag temporal para testing

```tsx
const Dashboard = () => {
  const { isFeatureEnabled } = useFeatureToggle();

  return (
    <div>
      {isFeatureEnabled('new_dashboard') ? (
        <NewDashboard /> // Versión en desarrollo
      ) : (
        <OldDashboard /> // Versión estable
      )}
    </div>
  );
};
```

### Ejemplo 3: Ocultar funcionalidad para empresa específica

Si una empresa no usa cierta funcionalidad, puedes deshabilitarla:

```typescript
// Deshabilitar módulo de pagos para una empresa específica
await updateFeature('payment_module', {
  enabled: true,
  enabledForRoles: ['admin'],
  enabledForUsers: [] // No habilitar para usuarios específicos
});
```

## Troubleshooting

**Problema**: Las features no se cargan
- Verificar que el usuario esté autenticado
- Verificar que el token JWT sea válido
- Revisar la consola del navegador para errores

**Problema**: Un admin no ve el panel de features
- Verificar que el rol del usuario sea 'admin'
- Verificar que el componente esté importado en Settings.tsx

**Problema**: Una feature no se actualiza en tiempo real
- Usar `refreshFeatures()` para recargar
- Recargar la página

## Soporte

Para más información o reportar problemas, contacta al equipo de desarrollo.
