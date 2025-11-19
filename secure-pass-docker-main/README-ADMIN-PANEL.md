# 🎛️ Panel de Super Administración - SecurePass

Documentación completa del panel de administración multi-tenant con control de servicios, auditoría e impersonación.

---

## 📋 Índice

1. [Descripción](#descripción)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [API Endpoints](#api-endpoints)
5. [Gestión de Módulos/Servicios](#gestión-de-módulosservicios)
6. [Sistema de Auditoría](#sistema-de-auditoría)
7. [Impersonación de Empresas](#impersonación-de-empresas)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📖 Descripción

El Panel de Super Administración permite a los administradores del sistema:

- ✅ **Controlar servicios** habilitados por empresa
- ✅ **Auditar cambios** con historial completo
- ✅ **Acceder como cliente** (impersonación) para soporte
- ✅ **Ver estadísticas** globales del sistema
- ✅ **Exportar logs** para análisis forense

---

## 🎯 Características

### 1. Control de Servicios/Módulos

Cada empresa puede tener diferentes módulos habilitados según su plan:

**Módulos Disponibles:**

| Módulo | Descripción | Planes |
|--------|-------------|--------|
| `visits` | Gestión de visitas | Todos |
| `residents` | Gestión de residentes | Todos |
| `guards` | Gestión de guardias | Todos |
| `qr_codes` | Códigos QR | Todos |
| `reports` | Reportes y PDFs | Basic+ |
| `email_notifications` | Emails automatizados | Basic+ |
| `image_upload` | Subida de imágenes | Basic+ |
| `analytics` | Estadísticas avanzadas | Premium+ |
| `mobile_app` | Acceso app móvil | Premium+ |
| `custom_branding` | Logos y colores | Premium+ |
| `audit_logs` | Logs de auditoría | Premium+ |
| `multi_location` | Múltiples ubicaciones | Enterprise |
| `integrations` | Integraciones externas | Enterprise |

### 2. Sistema de Auditoría

**Eventos Auditados:**

- 🏢 **Empresas**: Creación, actualización, activación/desactivación
- 👤 **Usuarios**: CRUD, cambios de rol, login/logout
- 📋 **Visitas**: Autorizaciones, entradas, salidas
- ⚙️ **Configuración**: Cambios de settings, branding, módulos
- 🔐 **Seguridad**: Intentos fallidos de login, cambios de password
- 👁️ **Impersonación**: Inicio y fin de sesiones como empresa

**Niveles de Severidad:**
- `INFO`: Operaciones normales
- `WARNING`: Acciones que requieren atención
- `ERROR`: Errores del sistema
- `CRITICAL`: Eventos críticos (eliminaciones, brechas de seguridad)

### 3. Impersonación

Los administradores pueden **acceder como cualquier empresa** para:
- Diagnosticar problemas
- Proporcionar soporte directo
- Verificar configuraciones

**Características de Seguridad:**
- ✅ Tokens con expiración de 2 horas
- ✅ Logs completos de quién, cuándo y qué empresa
- ✅ Flag visible de "modo impersonación"
- ✅ Imposible ocultar que es impersonación

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│     Super Admin Panel (Frontend)       │
└───────────────┬─────────────────────────┘
                │ HTTP/REST
┌───────────────▼─────────────────────────┐
│         Admin API (/api/admin/*)        │
├─────────────────────────────────────────┤
│  - adminController                      │
│  - Authentication Middleware            │
│  - Role Middleware (admin only)         │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼────┐
│Features│  │ Audit │  │Company │
│Service │  │Service│  │Service │
└───┬───┘  └───┬───┘  └───┬────┘
    │          │          │
    └──────────┼──────────┘
               │
        ┌──────▼──────┐
        │   MongoDB   │
        │  Collections│
        ├─────────────┤
        │ - companies │
        │ - auditlogs │
        │ - users     │
        │ - visits    │
        └─────────────┘
```

---

## 🌐 API Endpoints

**Base URL:** `/api/admin/*`

**Autenticación:** Todas las rutas requieren:
- Header: `Authorization: Bearer {admin-token}`
- Rol: `admin`

### Gestión de Módulos

```http
# Listar módulos de una empresa
GET /api/admin/companies/:companyId/modules

# Habilitar módulo
POST /api/admin/companies/:companyId/modules/:module/enable
Content-Type: application/json
{
  "settings": { /* configuración opcional */ }
}

# Deshabilitar módulo
POST /api/admin/companies/:companyId/modules/:module/disable

# Configurar módulo
PUT /api/admin/companies/:companyId/modules/:module/config
Content-Type: application/json
{
  "settings": {
    "maxReports": 100,
    "emailLimit": 1000
  }
}
```

### Auditoría

```http
# Obtener logs
GET /api/admin/audit/logs?companyId=XXX&limit=50&offset=0
Query params:
  - companyId: ID de empresa (opcional)
  - userId: ID de usuario (opcional)
  - action: Acción específica (opcional)
  - category: Categoría (opcional)
  - severity: Severidad (opcional)
  - startDate: Fecha inicio (opcional)
  - endDate: Fecha fin (opcional)
  - limit: Cantidad (default: 50)
  - offset: Paginación (default: 0)

# Obtener estadísticas
GET /api/admin/audit/stats?companyId=XXX&startDate=2024-01-01

# Exportar logs
GET /api/admin/audit/export?companyId=XXX&format=csv
Query params:
  - format: json | csv
  - companyId, startDate, endDate
```

### Impersonación

```http
# Iniciar impersonación
POST /api/admin/companies/:companyId/impersonate
Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "2h",
  "warning": "Este token permite acceso completo a la empresa"
}

# Finalizar impersonación
POST /api/admin/impersonate/end
```

### Dashboard

```http
# Dashboard de super admin
GET /api/admin/dashboard
```

---

## 🔧 Gestión de Módulos/Servicios

### Listar Módulos Disponibles

```bash
curl -X GET http://localhost:8000/api/admin/companies/507f1f77bcf86cd799439011/modules \
  -H "Authorization: Bearer {admin-token}"
```

**Respuesta:**
```json
{
  "modules": [
    {
      "module": "visits",
      "enabled": true,
      "info": {
        "name": "Gestión de Visitas",
        "description": "Autorizar y gestionar visitas",
        "category": "Core"
      },
      "settings": {}
    },
    {
      "module": "analytics",
      "enabled": false,
      "info": {
        "name": "Analytics",
        "description": "Estadísticas y análisis avanzado",
        "category": "Premium"
      }
    }
  ],
  "categorized": {
    "Core": [...],
    "Features": [...],
    "Premium": [...],
    "Enterprise": [...]
  }
}
```

### Habilitar un Módulo

```bash
curl -X POST http://localhost:8000/api/admin/companies/507f1f77bcf86cd799439011/modules/analytics/enable \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "dashboardAccess": true,
      "exportLimit": 1000
    }
  }'
```

### Deshabilitar un Módulo

```bash
curl -X POST http://localhost:8000/api/admin/companies/507f1f77bcf86cd799439011/modules/analytics/disable \
  -H "Authorization: Bearer {admin-token}"
```

---

## 📊 Sistema de Auditoría

### Obtener Logs Recientes

```bash
curl -X GET "http://localhost:8000/api/admin/audit/logs?companyId=507f1f77bcf86cd799439011&limit=10" \
  -H "Authorization: Bearer {admin-token}"
```

**Respuesta:**
```json
{
  "logs": [
    {
      "id": "...",
      "action": "feature.enabled",
      "category": "configuration",
      "severity": "info",
      "actor": {
        "userId": "...",
        "email": "admin@system.com",
        "role": "admin"
      },
      "description": "Módulo 'analytics' habilitado",
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "module": "analytics",
        "ip": "192.168.1.1"
      }
    }
  ],
  "total": 1247,
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### Filtrar por Categoría

```bash
curl -X GET "http://localhost:8000/api/admin/audit/logs?category=security&severity=warning" \
  -H "Authorization: Bearer {admin-token}"
```

### Obtener Estadísticas

```bash
curl -X GET "http://localhost:8000/api/admin/audit/stats?companyId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {admin-token}"
```

**Respuesta:**
```json
{
  "totalLogs": 5432,
  "byCategory": {
    "company": 145,
    "user": 892,
    "visit": 3201,
    "security": 67,
    "configuration": 1127
  },
  "bySeverity": {
    "info": 5100,
    "warning": 298,
    "error": 32,
    "critical": 2
  },
  "byAction": {
    "visit.created": 1890,
    "user.login": 712,
    "visit.entry": 654
  },
  "recentActivity": [...]
}
```

### Exportar Logs

**CSV:**
```bash
curl -X GET "http://localhost:8000/api/admin/audit/export?format=csv&companyId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {admin-token}" \
  -o audit-logs.csv
```

**JSON:**
```bash
curl -X GET "http://localhost:8000/api/admin/audit/export?format=json" \
  -H "Authorization: Bearer {admin-token}" \
  -o audit-logs.json
```

---

## 👁️ Impersonación de Empresas

### Iniciar Sesión como Empresa

```bash
curl -X POST http://localhost:8000/api/admin/companies/507f1f77bcf86cd799439011/impersonate \
  -H "Authorization: Bearer {admin-token}"
```

**Respuesta:**
```json
{
  "message": "Token de impersonación generado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImNvbXBhbnlJZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlzSW1wZXJzb25hdGluZyI6dHJ1ZSwiaW1wZXJzb25hdGVkQnkiOiI2MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDUzMTU4MDAsImV4cCI6MTcwNTMyMzAwMH0.xyz",
  "expiresIn": "2h",
  "warning": "Este token permite acceso completo a la empresa"
}
```

**Usar el token:**
```bash
# Ahora puedes usar este token para hacer requests como si fueras esa empresa
curl -X GET http://localhost:8000/api/visits \
  -H "Authorization: Bearer {impersonation-token}"
```

### Finalizar Impersonación

```bash
curl -X POST http://localhost:8000/api/admin/impersonate/end \
  -H "Authorization: Bearer {impersonation-token}"
```

**Logs Generados:**

Cuando haces impersonación, se generan logs automáticos:
- `impersonation.start` - Al iniciar
- Todas las acciones tienen flag `isImpersonating: true`
- `impersonation.end` - Al finalizar

---

## 💡 Ejemplos de Uso

### Caso 1: Habilitar Analytics para Cliente Premium

```javascript
// 1. Cliente solicita upgrade a premium
// 2. Admin actualiza el plan
const updatePlan = await fetch('/api/companies/company-id/subscription', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer admin-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    plan: 'premium',
    maxUsers: 200,
    maxResidents: 1000
  })
});

// 3. Admin habilita módulo de analytics
const enableAnalytics = await fetch('/api/admin/companies/company-id/modules/analytics/enable', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer admin-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    settings: {
      retentionDays: 365,
      exportEnabled: true
    }
  })
});

// 4. Verificar en logs
const checkLogs = await fetch('/api/admin/audit/logs?action=subscription.updated&limit=5', {
  headers: { 'Authorization': 'Bearer admin-token' }
});
```

### Caso 2: Investigar Problema de un Cliente

```javascript
// 1. Cliente reporta problema con visitas
// 2. Admin se impersona para verificar
const impersonate = await fetch('/api/admin/companies/client-company-id/impersonate', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer admin-token' }
});

const { token } = await impersonate.json();

// 3. Ver visitas como si fuera el cliente
const visits = await fetch('/api/visits', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 4. Identificar problema y solucionarlo
// ...

// 5. Finalizar impersonación
await fetch('/api/admin/impersonate/end', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 6. Revisar logs de la sesión
const sessionLogs = await fetch('/api/admin/audit/logs?action=impersonation.start', {
  headers: { 'Authorization': 'Bearer admin-token' }
});
```

### Caso 3: Auditoría Mensual

```javascript
// Exportar todos los logs del último mes
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 1);

const export Logs = await fetch(
  `/api/admin/audit/export?format=csv&startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`,
  { headers: { 'Authorization': 'Bearer admin-token' } }
);

const csvData = await exportLogs.text();
// Guardar o analizar csvData
```

---

## 🔐 Seguridad

### Mejores Prácticas

1. **Tokens de Impersonación:**
   - ✅ Expiran en 2 horas
   - ✅ No pueden ser renovados
   - ✅ Quedan registrados en logs

2. **Auditoría:**
   - ✅ Todos los cambios se registran
   - ✅ No se pueden eliminar logs (solo super-admin con acceso DB)
   - ✅ Incluye IP, user agent, timestamp

3. **Acceso:**
   - ✅ Solo rol `admin` puede acceder
   - ✅ Tokens JWT con secret seguro
   - ✅ Rate limiting recomendado

### Logs que NO se Pueden Eliminar

Los siguientes eventos SIEMPRE quedan registrados:
- Login/Logout
- Cambios de password
- Impersonación
- Cambios de rol de usuario
- Activación/desactivación de empresas
- Eliminación de datos

---

## 📈 Métricas Útiles

### Consultas Comunes

**Empresas más activas:**
```sql
db.auditlogs.aggregate([
  { $group: { _id: "$company", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

**Intentos fallidos de login:**
```sql
db.auditlogs.find({
  action: "user.failed_login",
  timestamp: { $gte: new Date("2024-01-01") }
}).count()
```

**Impersonaciones del día:**
```sql
db.auditlogs.find({
  action: "impersonation.start",
  timestamp: { $gte: new Date().setHours(0,0,0,0) }
})
```

---

## 🎓 Resumen

El Panel de Super Administración te permite:

✅ **Controlar** qué servicios usa cada empresa
✅ **Auditar** cada cambio en el sistema
✅ **Ayudar** a clientes accediendo como ellos
✅ **Analizar** patrones de uso
✅ **Exportar** datos para reportes

**Todo con trazabilidad completa y seguridad máxima.**

---

## 📞 Soporte

¿Preguntas sobre el panel de admin?
- Consulta la documentación completa en `/docs`
- Revisa los ejemplos en `/examples`
- Abre un issue en GitHub

**Versión:** 1.0.0
**Última actualización:** 2024
