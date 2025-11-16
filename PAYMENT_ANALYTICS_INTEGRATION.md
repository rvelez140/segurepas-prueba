# Integración de Pagos y Analytics - SecurePass

## 📋 Descripción

Esta documentación describe las nuevas funcionalidades de integración con procesadores de pago (Stripe y PayPal), sistema de notificaciones por email para suscripciones, y analytics avanzado de suscripciones implementadas en SecurePass.

## 🎯 Funcionalidades Implementadas

### 1. Integración con Procesadores de Pago

#### **Stripe**
- Creación de sesiones de checkout
- Gestión de suscripciones (crear, cancelar, actualizar)
- Webhooks para eventos de pago
- Soporte para múltiples planes (Basic, Premium, Enterprise)
- Ciclos de facturación mensual y anual

#### **PayPal**
- Creación de suscripciones
- Activación de suscripciones después de aprobación del usuario
- Webhooks para eventos de PayPal
- Soporte para múltiples planes y ciclos de facturación

### 2. Sistema de Notificaciones por Email

Se implementaron notificaciones automáticas para:
- **Bienvenida**: Email de bienvenida al suscribirse
- **Pago Exitoso**: Confirmación de pago procesado
- **Pago Fallido**: Notificación de error en el pago
- **Cancelación**: Confirmación de cancelación de suscripción
- **Renovación**: Recordatorio de próxima renovación
- **Expiración**: Notificación de suscripción expirada

### 3. Analytics de Suscripciones

Métricas implementadas:
- **Revenue Metrics**: Ingresos totales, MRR, ARR, ingresos por plan y proveedor
- **Subscription Metrics**: Suscripciones activas, canceladas, por plan, churn rate, retention rate
- **Growth Metrics**: Nuevas suscripciones, cancelaciones, crecimiento neto
- **Payment Metrics**: Tasa de éxito de pagos, valor promedio de transacción
- **Trends**: Tendencias mensuales de suscripciones e ingresos

## 📁 Estructura de Archivos Creados

```
apps/api/src/
├── interfaces/
│   ├── ISubscription.ts       # Interfaces para suscripciones
│   └── IPayment.ts            # Interfaces para pagos
├── models/
│   ├── Subscription.ts        # Modelo de suscripciones
│   └── Payment.ts             # Modelo de pagos
├── services/
│   ├── StripePaymentService.ts           # Servicio de Stripe
│   ├── PayPalPaymentService.ts           # Servicio de PayPal
│   ├── SubscriptionAnalyticsService.ts   # Servicio de analytics
│   └── NotificationService.ts (extendido) # Notificaciones de suscripciones
├── controllers/
│   ├── subscriptionController.ts  # Controlador de suscripciones
│   └── analyticsController.ts     # Controlador de analytics
└── routes/
    ├── subscriptionRoutes.ts      # Rutas de suscripciones
    └── analyticsRoutes.ts         # Rutas de analytics
```

## 🔧 Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_BASIC_MONTHLY=price_id_here
STRIPE_PRICE_BASIC_YEARLY=price_id_here
STRIPE_PRICE_PREMIUM_MONTHLY=price_id_here
STRIPE_PRICE_PREMIUM_YEARLY=price_id_here
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_id_here
STRIPE_PRICE_ENTERPRISE_YEARLY=price_id_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # 'sandbox' or 'live'
PAYPAL_PLAN_BASIC_MONTHLY=plan_id_here
PAYPAL_PLAN_BASIC_YEARLY=plan_id_here
PAYPAL_PLAN_PREMIUM_MONTHLY=plan_id_here
PAYPAL_PLAN_PREMIUM_YEARLY=plan_id_here
PAYPAL_PLAN_ENTERPRISE_MONTHLY=plan_id_here
PAYPAL_PLAN_ENTERPRISE_YEARLY=plan_id_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Consulta el archivo `.env.example` para más detalles.

### 2. Instalar Dependencias

```bash
cd apps/api
npm install
```

## 📡 API Endpoints

### Suscripciones

#### Crear Checkout de Stripe
```http
POST /api/subscriptions/stripe/checkout
Content-Type: application/json

{
  "userId": "user_id_here",
  "plan": "basic",  // basic | premium | enterprise
  "billingCycle": "monthly"  // monthly | yearly
}
```

#### Crear Suscripción de PayPal
```http
POST /api/subscriptions/paypal/create
Content-Type: application/json

{
  "userId": "user_id_here",
  "plan": "premium",
  "billingCycle": "yearly"
}
```

#### Activar Suscripción de PayPal
```http
POST /api/subscriptions/paypal/activate
Content-Type: application/json

{
  "userId": "user_id_here",
  "subscriptionId": "paypal_subscription_id"
}
```

#### Obtener Suscripciones del Usuario
```http
GET /api/subscriptions/user/:userId
```

#### Obtener Suscripción Activa
```http
GET /api/subscriptions/user/:userId/active
```

#### Cancelar Suscripción
```http
POST /api/subscriptions/:subscriptionId/cancel
Content-Type: application/json

{
  "reason": "Usuario solicitó cancelación"
}
```

### Analytics

#### Dashboard Completo
```http
GET /api/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

#### Métricas de Ingresos
```http
GET /api/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31
```

#### Métricas de Suscripciones
```http
GET /api/analytics/subscriptions
```

#### Métricas de Crecimiento
```http
GET /api/analytics/growth?startDate=2024-01-01&endDate=2024-12-31
```

#### Métricas de Pagos
```http
GET /api/analytics/payments?startDate=2024-01-01&endDate=2024-12-31
```

#### Tendencias
```http
GET /api/analytics/trends?months=12
```

### Webhooks

#### Webhook de Stripe
```http
POST /api/webhooks/stripe
```

#### Webhook de PayPal
```http
POST /api/webhooks/paypal
```

## 🔐 Configuración de Webhooks

### Stripe

1. Ve a tu [Dashboard de Stripe](https://dashboard.stripe.com/webhooks)
2. Crea un nuevo webhook endpoint
3. URL: `https://tu-dominio.com/api/webhooks/stripe`
4. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copia el webhook secret a `STRIPE_WEBHOOK_SECRET`

### PayPal

1. Ve a tu [Dashboard de PayPal](https://developer.paypal.com/dashboard/)
2. Configura webhooks en tu aplicación
3. URL: `https://tu-dominio.com/api/webhooks/paypal`
4. Eventos a escuchar:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`

## 💳 Configuración de Planes en Stripe

1. Ve a [Productos en Stripe](https://dashboard.stripe.com/products)
2. Crea productos para cada plan:
   - Basic
   - Premium
   - Enterprise
3. Para cada producto, crea precios:
   - Mensual
   - Anual
4. Copia los IDs de precio a las variables de entorno correspondientes

## 💳 Configuración de Planes en PayPal

1. Ve a [Dashboard de PayPal](https://www.paypal.com/billing/plans)
2. Crea planes de facturación para:
   - Basic (mensual y anual)
   - Premium (mensual y anual)
   - Enterprise (mensual y anual)
3. Copia los IDs de plan a las variables de entorno correspondientes

## 📊 Modelos de Datos

### Subscription
```typescript
{
  userId: ObjectId,
  plan: 'basic' | 'premium' | 'enterprise',
  status: 'active' | 'canceled' | 'expired' | 'pending' | 'trial',
  provider: 'stripe' | 'paypal',
  providerId: string,
  startDate: Date,
  endDate: Date,
  canceledAt?: Date,
  trialEndDate?: Date,
  amount: number,
  currency: string,
  billingCycle: 'monthly' | 'yearly',
  autoRenew: boolean,
  metadata?: Record<string, any>
}
```

### Payment
```typescript
{
  userId: ObjectId,
  subscriptionId?: ObjectId,
  provider: 'stripe' | 'paypal',
  providerId: string,
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'canceled',
  type: 'subscription' | 'one_time' | 'refund',
  description?: string,
  metadata?: Record<string, any>,
  paymentMethod?: string,
  receiptUrl?: string,
  failureReason?: string
}
```

## 🧪 Pruebas en Desarrollo

### Probar con Stripe

1. Usar tarjetas de prueba de Stripe:
   - Éxito: `4242 4242 4242 4242`
   - Rechazo: `4000 0000 0000 0002`
2. Cualquier fecha futura y CVV de 3 dígitos
3. Usar Stripe CLI para probar webhooks localmente:
   ```bash
   stripe listen --forward-to localhost:8000/api/webhooks/stripe
   ```

### Probar con PayPal

1. Usar [Sandbox de PayPal](https://developer.paypal.com/dashboard/accounts)
2. Crear cuentas de prueba (personal y business)
3. Usar las credenciales de sandbox en el `.env`
4. Configurar webhooks en el dashboard de sandbox

## 🎨 Integración con Frontend

Ejemplo de flujo de checkout con Stripe:

```javascript
// Crear sesión de checkout
const response = await fetch('/api/subscriptions/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    plan: 'premium',
    billingCycle: 'monthly'
  })
});

const { url } = await response.json();

// Redirigir al usuario a Stripe Checkout
window.location.href = url;
```

## 📈 Uso de Analytics

Ejemplo de obtención de dashboard:

```javascript
const response = await fetch('/api/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31');
const { data } = await response.json();

console.log('MRR:', data.revenue.monthlyRecurringRevenue);
console.log('Active Subscriptions:', data.subscriptions.totalActive);
console.log('Churn Rate:', data.subscriptions.churnRate);
```

## 🐛 Troubleshooting

### Error: "Stripe API key not set"
- Verifica que `STRIPE_SECRET_KEY` esté configurado en `.env`
- Asegúrate de que la clave comience con `sk_`

### Error: "PayPal authentication failed"
- Verifica `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`
- Asegúrate de usar las credenciales correctas según el modo (sandbox/live)

### Emails no se envían
- Verifica las credenciales de email en `.env`
- Si usas Gmail, necesitas una [App Password](https://support.google.com/accounts/answer/185833)
- Verifica que el puerto 587 no esté bloqueado

## 📝 Notas Importantes

- Los montos se almacenan en centavos (ej: $10.00 = 1000)
- Los webhooks requieren verificación de firma para seguridad
- Las suscripciones activas pueden tener status 'active' o 'trial'
- El churn rate se calcula mensualmente
- Los analytics pueden requerir índices en MongoDB para mejor performance

## 🔄 Próximos Pasos

Para activar las funcionalidades en producción:

1. Obtener credenciales de producción de Stripe y PayPal
2. Configurar webhooks de producción
3. Crear planes de producción en ambas plataformas
4. Actualizar variables de entorno de producción
5. Probar flujo completo antes de lanzar

## 📞 Soporte

Para problemas o preguntas sobre la implementación, contactar al equipo de desarrollo de SecurePass.
