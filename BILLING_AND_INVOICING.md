# Sistema de Facturación y Gestión de Deudas - SecurePass

## 📋 Descripción

Sistema completo de gestión de facturación con cambio de fechas de pago, generación automática de facturas en PDF, suspensión automática de cuentas por falta de pago y notificaciones por email.

## 🎯 Funcionalidades Implementadas

### 1. **Gestión de Fechas de Facturación**
- ✅ Cambiar día de facturación mensual (1-31)
- ✅ Solo permitido después de saldar deudas
- ✅ Actualización automática de suscripciones activas
- ✅ Notificación por email del cambio

### 2. **Sistema de Facturas**
- ✅ Generación automática de facturas
- ✅ Facturas en PDF con diseño profesional
- ✅ Numeración única (INV-2024-000001)
- ✅ Envío automático por email
- ✅ Estados: pending, paid, overdue, canceled, refunded

### 3. **Suspensión Automática de Cuentas**
- ✅ Sistema de estados: active, pending_payment, suspended, blocked
- ✅ Período de gracia de 3 días
- ✅ Suspensión a los 7 días de impago
- ✅ Bloqueo permanente a los 30 días
- ✅ Notificaciones automáticas en cada etapa

### 4. **Middleware de Verificación**
- ✅ checkAccountStatus: Verifica estado y permite acceso con advertencia
- ✅ requireActiveAccount: Bloquea acceso si la cuenta no está activa
- ✅ Respuestas con información del estado de la cuenta

### 5. **Notificaciones por Email**
- ✅ Cambio de fecha de facturación
- ✅ Advertencia de pago pendiente
- ✅ Cuenta suspendida
- ✅ Cuenta bloqueada
- ✅ Cuenta reactivada
- ✅ Envío de factura con PDF adjunto

## 📁 Archivos Creados

```
apps/api/src/
├── models/
│   ├── User.ts (modificado)         # Estados de cuenta agregados
│   └── Invoice.ts                   # Modelo de facturas
├── interfaces/
│   ├── IUser.ts (modificado)        # AccountStatus enum
│   └── IInvoice.ts                  # Interface de facturas
├── services/
│   ├── BillingService.ts            # Gestión de facturación
│   ├── InvoiceService.ts            # Generación de facturas PDF
│   └── NotificationService.ts (ext) # 6 nuevas notificaciones
├── controllers/
│   └── billingController.ts         # 11 endpoints de billing
├── routes/
│   └── billingRoutes.ts             # Rutas de billing e invoices
└── middlewares/
    └── accountStatusMiddleware.ts   # Verificación de estado
```

## 🗄️ Modelos de Datos

### **Estados de Cuenta (AccountStatus)**

| Estado | Descripción |
|--------|-------------|
| `active` | Cuenta activa sin problemas |
| `pending_payment` | Pago vencido (3-7 días) |
| `suspended` | Suspendida (7-30 días) |
| `blocked` | Bloqueada (+30 días) |

### **Estados de Factura (InvoiceStatus)**

| Estado | Descripción |
|--------|-------------|
| `pending` | Pendiente de pago |
| `paid` | Pagada |
| `overdue` | Vencida |
| `canceled` | Cancelada |
| `refunded` | Reembolsada |

### **Modelo User (campos agregados)**

```typescript
{
  accountStatus: 'active' | 'suspended' | 'blocked' | 'pending_payment',
  suspendedAt: Date,
  suspensionReason: string,
  stripeCustomerId: string,
  paymentDueDate: Date,
  customBillingDate: number,  // Día del mes (1-31)
  pendingBalance: number       // En centavos
}
```

### **Modelo Invoice**

```typescript
{
  invoiceNumber: string,       // INV-2024-000001
  userId: ObjectId,
  subscriptionId?: ObjectId,
  paymentId?: ObjectId,
  issueDate: Date,
  dueDate: Date,
  paidDate?: Date,
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  amountPaid: number,
  amountDue: number,
  items: [{
    description: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number
  }],
  status: InvoiceStatus,
  pdfUrl: string,
  customerInfo: {
    name: string,
    email: string,
    address?: string,
    taxId?: string
  },
  notes?: string
}
```

## 🔌 API Endpoints

### **Billing Management (6 endpoints)**

#### Cambiar Fecha de Facturación
```http
POST /api/billing/change-date
Content-Type: application/json

{
  "userId": "user_id",
  "newBillingDay": 15  // Día del mes 1-31
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Fecha de facturación actualizada",
  "user": {...},
  "updatedSubscriptions": 2,
  "nextBillingDate": "2024-12-15T00:00:00.000Z"
}
```

#### Pagar Factura Pendiente
```http
POST /api/billing/pay-pending
Content-Type: application/json

{
  "userId": "user_id",
  "paymentId": "payment_id"
}
```

#### Obtener Estado de Facturación
```http
GET /api/billing/status/:userId
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "accountStatus": "active",
    "pendingBalance": 0,
    "paymentDueDate": null,
    "customBillingDate": 15,
    "pendingInvoices": 0,
    "overdueInvoices": 0,
    "activeSubscriptions": 2,
    "invoices": {
      "pending": [],
      "overdue": []
    }
  }
}
```

#### Reactivar Cuenta
```http
POST /api/billing/reactivate/:userId
```

#### Suspender Cuenta (Admin)
```http
POST /api/billing/suspend/:userId
Content-Type: application/json

{
  "reason": "Incumplimiento de pagos"
}
```

#### Verificar Facturas Vencidas (Cron Job)
```http
POST /api/billing/check-overdue
```

### **Invoice Management (5 endpoints)**

#### Crear Factura
```http
POST /api/invoices
Content-Type: application/json

{
  "userId": "user_id",
  "items": [
    {
      "description": "Suscripción Premium Mensual",
      "quantity": 1,
      "unitPrice": 2999  // $29.99 en centavos
    }
  ],
  "dueDate": "2024-12-31",
  "tax": 300,        // Opcional
  "discount": 500,   // Opcional
  "notes": "Factura mensual",
  "customerInfo": {  // Opcional
    "name": "Cliente",
    "email": "email@example.com",
    "address": "Calle 123",
    "taxId": "123456789"
  }
}
```

#### Obtener Facturas de Usuario
```http
GET /api/invoices/user/:userId?status=pending&limit=10&offset=0
```

#### Obtener Factura por ID
```http
GET /api/invoices/:invoiceId
```

#### Marcar Factura como Pagada
```http
POST /api/invoices/:invoiceId/pay
Content-Type: application/json

{
  "paymentId": "payment_id"  // Opcional
}
```

#### Cancelar Factura
```http
POST /api/invoices/:invoiceId/cancel
```

## 🔄 Flujo de Suspensión Automática

```
Factura Vencida
      ↓
[Día 0] Factura cambia a OVERDUE
      ↓
[Día 3] Estado → PENDING_PAYMENT
      ↓ Email de advertencia
      ↓
[Día 7] Estado → SUSPENDED
      ↓ Email de suspensión
      ↓ Cancelar suscripciones activas
      ↓ Bloquear acceso al sistema
      ↓
[Día 30] Estado → BLOCKED
      ↓ Email de bloqueo
      ↓ Bloqueo permanente
      ↓
Usuario paga
      ↓
Estado → ACTIVE
Email de reactivación
```

## 💻 Uso de Middlewares

### checkAccountStatus
Permite acceso pero envía advertencia si hay problemas.

```javascript
import { checkAccountStatus } from '../middlewares/accountStatusMiddleware';

router.get('/dashboard', checkAccountStatus, (req, res) => {
  const warning = req.accountWarning;
  if (warning) {
    // Mostrar advertencia en UI
  }
  // Continuar normalmente
});
```

### requireActiveAccount
Bloquea acceso completamente si la cuenta no está activa.

```javascript
import { requireActiveAccount } from '../middlewares/accountStatusMiddleware';

router.post('/create-visit', requireActiveAccount, (req, res) => {
  // Solo se ejecuta si accountStatus === 'active'
});
```

## 📄 Generación de Facturas PDF

Las facturas se generan automáticamente en formato PDF con:

- **Header**: Logo y título "FACTURA"
- **Información de empresa**: SecurePass
- **Información de cliente**: Nombre, email, dirección, tax ID
- **Tabla de items**: Descripción, cantidad, precio unitario, total
- **Cálculos**: Subtotal, impuestos, descuentos, total
- **Estado de pago**: Monto pagado y monto debido
- **Notas**: Información adicional
- **Footer**: Mensaje de agradecimiento

**Ubicación de PDFs:** `/invoices/INV-2024-000001.pdf`

## 🔔 Notificaciones por Email

### 1. **Cambio de Fecha de Facturación**
- Se envía cuando el usuario cambia su día de facturación
- Incluye el nuevo día y la próxima fecha de cobro

### 2. **Advertencia de Pago**
- Se envía 3 días después del vencimiento
- Indica días restantes antes de suspensión
- Incluye monto adeudado y botón de pago

### 3. **Cuenta Suspendida**
- Se envía cuando la cuenta es suspendida (7 días)
- Explica consecuencias y cómo reactivar
- Botón para realizar pago

### 4. **Cuenta Bloqueada**
- Se envía cuando la cuenta es bloqueada (30 días)
- Indica que debe contactar soporte
- Instrucciones para desbloqueo

### 5. **Cuenta Reactivada**
- Se envía cuando se paga la deuda
- Mensaje de bienvenida
- Enlace al dashboard

### 6. **Factura Generada**
- Se envía con cada nueva factura
- Incluye enlace para descargar PDF
- Botón para ver y pagar factura

## ⚙️ Configuración de Cron Job

Para verificar facturas vencidas automáticamente, configurar un cron job:

```bash
# Ejecutar cada día a las 2 AM
0 2 * * * curl -X POST http://localhost:8000/api/billing/check-overdue
```

O usar node-cron en el código:

```javascript
import cron from 'node-cron';
import { billingService } from './services/BillingService';

// Ejecutar diariamente a las 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Verificando facturas vencidas...');
  await billingService.checkOverdueInvoices();
});
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Usuario cambia fecha de facturación

```javascript
// 1. Usuario tiene suscripción activa con cargo el día 1
// 2. Usuario quiere cambiar al día 15
const response = await fetch('/api/billing/change-date', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123',
    newBillingDay: 15
  })
});

// 3. Sistema actualiza todas las suscripciones activas
// 4. Próximo cargo será el 15 del mes
// 5. Usuario recibe email de confirmación
```

### Ejemplo 2: Usuario no paga factura

```
Día 0  : Factura vence → Estado: OVERDUE
Día 3  : Cuenta → PENDING_PAYMENT
         Email: "Tienes un pago pendiente"
Día 7  : Cuenta → SUSPENDED
         Email: "Tu cuenta ha sido suspendida"
         Acceso bloqueado
Día 30 : Cuenta → BLOCKED
         Email: "Tu cuenta ha sido bloqueada"
         Debe contactar soporte

Usuario realiza pago:
         → Cuenta → ACTIVE
         → Email: "¡Cuenta reactivada!"
```

### Ejemplo 3: Generar factura para suscripción

```javascript
// Crear factura automática cuando se procesa un pago
const invoice = await invoiceService.createInvoice({
  userId: 'user_123',
  subscriptionId: 'sub_123',
  paymentId: 'pay_123',
  items: [
    {
      description: 'Suscripción Premium - Mensual',
      quantity: 1,
      unitPrice: 2999  // $29.99
    }
  ],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 días
  notes: 'Gracias por tu suscripción'
});

// Se genera PDF automáticamente
// Se envía email con la factura
```

## 🛡️ Seguridad y Validaciones

- ✅ Solo se puede cambiar fecha de facturación sin deudas
- ✅ Verificación de permisos en middlewares
- ✅ Validación de rangos (1-31 para día de facturación)
- ✅ Estados de cuenta verificados en cada request
- ✅ Facturas con numeración única y segura
- ✅ PDFs generados en servidor (no accesibles directamente)

## 📊 Flujo de Integración con Pagos

```
1. Pago procesado exitosamente
   ↓
2. Crear factura automáticamente
   ↓
3. Marcar factura como PAID
   ↓
4. Enviar factura por email
   ↓
5. Aplicar pago a deuda pendiente (si existe)
   ↓
6. Verificar si saldo pendiente = 0
   ↓
7. Si sí → Reactivar cuenta automáticamente
   ↓
8. Enviar email de reactivación
```

## 🔧 Dependencias Agregadas

```json
{
  "dependencies": {
    "pdfkit": "^0.15.0"
  },
  "devDependencies": {
    "@types/pdfkit": "^0.13.5"
  }
}
```

## 📝 Variables de Entorno

No se requieren nuevas variables de entorno. El sistema usa las variables existentes de email y frontend URL.

## 🚀 Próximos Pasos para Desarrollo

1. **Instalar dependencias:**
   ```bash
   cd apps/api
   npm install
   ```

2. **Crear directorio de facturas:**
   ```bash
   mkdir -p invoices
   ```

3. **Configurar cron job** para verificar facturas vencidas

4. **Probar flujo completo:**
   - Crear factura
   - Simular vencimiento
   - Verificar suspensión automática
   - Realizar pago
   - Verificar reactivación

5. **Integrar middlewares** en rutas protegidas

## 💡 Notas Importantes

- Las facturas se generan en el servidor en `/invoices/*.pdf`
- Los montos se manejan en centavos ($29.99 = 2999)
- El sistema verifica facturas vencidas solo al ejecutar el endpoint `/billing/check-overdue`
- Se recomienda ejecutar el check cada 24 horas mediante cron
- Los usuarios bloqueados deben contactar soporte para desbloqueo
- Las facturas pagadas no pueden ser canceladas
- El PDF se genera automáticamente al crear la factura

## 🆘 Troubleshooting

### Error: "Debe saldar su deuda pendiente"
- El usuario tiene facturas vencidas
- Debe pagar antes de cambiar configuración

### Error: "No se puede cancelar una factura pagada"
- Las facturas pagadas son inmutables
- Usar sistema de reembolsos si es necesario

### PDF no se genera
- Verificar permisos del directorio `/invoices`
- Verificar que PDFKit esté instalado correctamente

### Cuenta no se reactiva automáticamente
- Verificar que `pendingBalance` sea 0
- Verificar que el pago se aplicó correctamente

## 📞 Soporte

Este sistema de facturación está completamente integrado con:
- Sistema de pagos con tarjeta
- Sistema de suscripciones (Stripe/PayPal)
- Sistema de notificaciones
- Analytics de suscripciones

Todas las funcionalidades están listas para desarrollo y pruebas.
