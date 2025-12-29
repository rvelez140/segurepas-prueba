# 🏗️ Arquitectura del Sistema - SecurePass

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Backend API](#backend-api)
4. [Frontend Web](#frontend-web)
5. [Aplicación Móvil](#aplicación-móvil)
6. [Aplicación Desktop](#aplicación-desktop)
7. [Base de Datos](#base-de-datos)
8. [Seguridad](#seguridad)
9. [Flujo de Datos](#flujo-de-datos)
10. [Despliegue](#despliegue)

---

## Visión General

SecurePass es un sistema de control de acceso modular construido con arquitectura monorepo que separa:

- **Backend API**: Servidor REST con Node.js + Express
- **Frontend Web**: Aplicación React para navegadores
- **Mobile App**: Aplicación React Native + Expo
- **Desktop App**: Aplicación Electron multiplataforma

### Principios de Arquitectura

1. **Separation of Concerns**: Cada módulo tiene responsabilidades bien definidas
2. **API-First**: Toda funcionalidad pasa por la API REST
3. **Type Safety**: TypeScript en todas las capas
4. **Security by Default**: Autenticación, autorización y validación en cada endpoint
5. **Scalability**: Diseñado para crecer horizontalmente

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTES                             │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Web App    │  Mobile App  │  Desktop App │  Third Party   │
│   (React)    │  (RN+Expo)   │  (Electron)  │   (API REST)   │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    NGINX (Reverse       │
              │      Proxy/LB)          │
              └──────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐     ┌────────┐
    │  API   │      │  API   │ ... │  API   │
    │ Server │      │ Server │     │ Server │
    │  (1)   │      │  (2)   │     │  (n)   │
    └───┬────┘      └───┬────┘     └───┬────┘
        │               │              │
        └───────────────┴──────────────┘
                        │
        ┌───────────────┼───────────────┬──────────────┐
        ▼               ▼               ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌──────────┐   ┌─────────┐
   │ MongoDB │    │  Redis  │    │Cloudinary│   │ Sentry  │
   │   DB    │    │ (Cache) │    │(Storage) │   │(Monitor)│
   └─────────┘    └─────────┘    └──────────┘   └─────────┘
```

---

## Backend API

### Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express 5.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 7.0 + Mongoose
- **Cache**: Redis (opcional)
- **Authentication**: JWT + 2FA (Speakeasy)
- **Validation**: Zod
- **Logging**: Winston + Morgan
- **Monitoring**: Sentry
- **Documentation**: Swagger/OpenAPI

### Estructura de Carpetas

```
apps/api/
├── src/
│   ├── config/           # Configuraciones (logger, sentry, swagger)
│   ├── controllers/      # Controladores REST
│   ├── middlewares/      # Middlewares (auth, validation, rate-limit)
│   ├── models/          # Modelos Mongoose
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── schemas/         # Esquemas de validación Zod
│   ├── types/           # Tipos TypeScript
│   ├── interfaces/      # Interfaces
│   └── utils/           # Utilidades
├── tests/
│   ├── unit/            # Tests unitarios
│   ├── integration/     # Tests de integración
│   └── e2e/             # Tests end-to-end
└── logs/                # Logs de Winston
```

### Capas de la API

#### 1. **Routes Layer**
Define endpoints y asocia con controladores

```typescript
router.post('/login',
  validateBody(loginSchema),
  authController.loginUser
);
```

#### 2. **Middleware Layer**
- **Authentication**: Verifica JWT
- **Authorization**: Verifica roles
- **Validation**: Valida con Zod
- **Rate Limiting**: Previene abuso
- **Security**: Helmet, CORS, Sanitization

#### 3. **Controller Layer**
Maneja requests HTTP, valida entrada, llama servicios

```typescript
async loginUser(req, res) {
  const user = await UserService.authenticate(req.body);
  const token = generateJWT(user);
  res.json({ user, token });
}
```

#### 4. **Service Layer**
Lógica de negocio, orquesta operaciones

```typescript
class UserService {
  static async authenticate(credentials) {
    // Lógica de autenticación
  }
}
```

#### 5. **Model Layer**
Interacción con MongoDB via Mongoose

```typescript
const userSchema = new Schema({
  auth: { email, password },
  name: String,
  role: String
});
```

### Principales Módulos

| Módulo | Descripción | Endpoints Clave |
|--------|-------------|----------------|
| **Auth** | Autenticación y autorización | `/api/login`, `/api/register` |
| **Users** | Gestión de usuarios | `/api/users` |
| **Visits** | Gestión de visitas | `/api/visits` |
| **Parking** | Control de parqueaderos | `/api/parking` |
| **Notifications** | Sistema de notificaciones | `/api/notifications` |
| **Audit** | Logs de auditoría | `/api/audit` |
| **2FA** | Autenticación de dos factores | `/api/2fa` |

---

## Frontend Web

### Stack Tecnológico

- **Framework**: React 19
- **Language**: TypeScript
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **State**: React Context API
- **Styling**: CSS Modules
- **Build**: Create React App

### Estructura

```
apps/web/src/
├── components/
│   ├── authorization/   # Componentes de autorizaciones
│   ├── login/          # Componentes de login
│   ├── settings/       # Componentes de configuración
│   ├── visits/         # Componentes de visitas
│   └── common/         # Componentes reutilizables
├── contexts/           # React Contexts (Theme, Sidebar)
├── pages/              # Páginas principales
├── services/           # Servicios API
├── api/                # Clientes API
├── types/              # Tipos TypeScript
└── styles/             # Estilos CSS
```

### Arquitectura de Componentes

```
App
├── ThemeProvider
│   └── SidebarProvider
│       ├── Home (Login)
│       ├── Dashboard
│       │   ├── Header
│       │   ├── Sidebar
│       │   ├── StatCards
│       │   ├── QuickActions
│       │   └── VisitHistory
│       ├── Authorizations
│       │   ├── AuthorizationsTable
│       │   ├── VisitFormModal
│       │   └── QRModal
│       ├── Settings
│       │   ├── Profile
│       │   ├── RegisterForm
│       │   └── ThemeToggle
│       └── History
```

### Flujo de Autenticación

1. Usuario ingresa credenciales
2. Frontend envía POST a `/api/login`
3. Backend valida y retorna JWT
4. Frontend guarda JWT en localStorage
5. Todas las requests incluyen `Authorization: Bearer {token}`
6. Middleware de backend valida token en cada request

---

## Aplicación Móvil

### Stack Tecnológico

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **HTTP**: Axios
- **QR Scanner**: expo-barcode-scanner

### Funcionalidades Principales

- **Guardia**: Escaneo de QR, registro de entradas/salidas
- **Residente**: Ver visitas, generar QR codes
- **Notificaciones Push**: Firebase Cloud Messaging

---

## Aplicación Desktop

### Stack Tecnológico

- **Framework**: Electron
- **UI**: React (embedded web app)
- **Auto Updates**: electron-updater
- **Platforms**: Windows (.exe), Linux (.deb, .rpm, .AppImage)

### Arquitectura Electron

```
Main Process (Node.js)
├── Window Management
├── Auto Updater
├── IPC Handlers
└── System Integration

Renderer Process (Chromium)
└── React Web App
```

---

## Base de Datos

### MongoDB Schema Design

#### Users Collection
```javascript
{
  _id: ObjectId,
  auth: {
    email: String,
    username: String (optional),
    password: String (hashed),
    twoFactorSecret: String,
    twoFactorEnabled: Boolean
  },
  name: String,
  role: 'residente' | 'guardia' | 'admin',
  apartment: String (residente),
  tel: String (residente),
  shift: String (guardia),
  registerDate: Date,
  updateDate: Date
}
```

#### Visits Collection
```javascript
{
  _id: ObjectId,
  residentId: ObjectId (ref: 'User'),
  visitorName: String,
  visitorDocument: String,
  vehiclePlate: String,
  qrCode: String (unique),
  entryDate: Date,
  exitDate: Date,
  status: 'pending' | 'active' | 'completed',
  images: [String] (Cloudinary URLs)
}
```

### Índices

```javascript
// Users
{ 'auth.email': 1 } (unique)
{ 'auth.username': 1 } (unique, sparse)
{ role: 1 }

// Visits
{ qrCode: 1 } (unique)
{ residentId: 1, status: 1 }
{ entryDate: 1 }
```

---

## Seguridad

### Capas de Seguridad

1. **Transport Layer**
   - HTTPS/TLS en producción
   - Certificados SSL/TLS

2. **Application Layer**
   - **Helmet.js**: Headers HTTP seguros
   - **CORS**: Origen cruzado controlado
   - **Rate Limiting**: Prevención de abuso
   - **Input Validation**: Zod schemas
   - **SQL/NoSQL Injection**: mongo-sanitize
   - **XSS Protection**: Content Security Policy

3. **Authentication Layer**
   - **JWT**: Tokens con expiración
   - **Password Hashing**: bcrypt (10 rounds)
   - **2FA**: TOTP (Time-based One-Time Password)
   - **Session Management**: JWT refresh tokens

4. **Authorization Layer**
   - **Role-Based Access Control (RBAC)**
   - Middleware de roles por endpoint

5. **Data Layer**
   - **Encryption at Rest**: MongoDB encryption
   - **Sensitive Data**: Nunca loggear passwords
   - **PII Protection**: Minimizar datos personales

### Authentication Flow

```
┌──────┐                ┌─────┐              ┌──────────┐
│Client│                │ API │              │ Database │
└──┬───┘                └──┬──┘              └────┬─────┘
   │                       │                      │
   │  POST /login         │                      │
   │  {email, password}   │                      │
   ├─────────────────────>│                      │
   │                      │ findUser(email)      │
   │                      ├─────────────────────>│
   │                      │<─────────────────────┤
   │                      │  User + hashedPass   │
   │                      │                      │
   │                      │ bcrypt.compare()     │
   │                      │                      │
   │                      │ generateJWT()        │
   │                      │                      │
   │  {user, token}       │                      │
   │<─────────────────────┤                      │
   │                      │                      │
   │ GET /api/visits      │                      │
   │ Auth: Bearer {token} │                      │
   ├─────────────────────>│                      │
   │                      │ verifyJWT()          │
   │                      │ checkRole()          │
   │                      │                      │
   │                      │ getVisits()          │
   │                      ├─────────────────────>│
   │                      │<─────────────────────┤
   │  {visits: [...]}     │                      │
   │<─────────────────────┤                      │
```

---

## Flujo de Datos

### Creación de Visita

```
Residente (Web/Mobile)
    │
    │ 1. Completa formulario de visita
    │
    ▼
POST /api/visits
    │
    ├─ Middleware: Auth (JWT)
    ├─ Middleware: Role (residente)
    ├─ Middleware: Validation (Zod)
    │
    ▼
VisitController.createVisit()
    │
    ▼
VisitService.create()
    │
    ├─ Generar QR único
    ├─ Upload imágenes → Cloudinary
    ├─ Guardar en MongoDB
    │
    ▼
Response: {visit, qrCode}
    │
    ▼
Frontend muestra QR generado
```

### Escaneo de QR (Guardia)

```
Guardia (Mobile)
    │
    │ 1. Escanea QR code
    │
    ▼
POST /api/visits/scan
    │
    ├─ Middleware: Auth (JWT)
    ├─ Middleware: Role (guardia)
    │
    ▼
VisitController.scanQR()
    │
    ▼
VisitService.registerEntry()
    │
    ├─ Validar QR existe
    ├─ Verificar status
    ├─ Actualizar entryDate
    ├─ Cambiar status → 'active'
    │
    ▼
Response: {visit, resident}
    │
    ▼
Mobile muestra confirmación
```

---

## Despliegue

### Entornos

1. **Development** (local)
   - MongoDB local o Atlas
   - API: localhost:48721
   - Web: localhost:52341

2. **Staging** (pre-producción)
   - MongoDB Atlas
   - Docker containers
   - Nginx reverse proxy

3. **Production**
   - MongoDB Atlas (Cluster M10+)
   - Docker Swarm o Kubernetes
   - Load Balancer (Nginx/HAProxy)
   - CDN para assets estáticos
   - SSL/TLS certificates

### Docker Architecture

```
┌─────────────────────────────────────┐
│         Nginx Container             │
│  (Reverse Proxy + SSL Termination)  │
│         Port 80/443                 │
└────────┬────────────────────────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
┌──────┐ ┌──────┐ ┌──────┐
│ API  │ │ API  │ │ API  │
│ (1)  │ │ (2)  │ │ (3)  │
└──┬───┘ └──┬───┘ └──┬───┘
   │        │        │
   └────────┼────────┘
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
┌─────────┐ ┌────────┐
│ MongoDB │ │ Redis  │
│Container│ │Container│
└─────────┘ └────────┘
```

### CI/CD Pipeline

```
GitHub Push
    │
    ▼
GitHub Actions
    │
    ├─ Lint & Type Check
    ├─ Run Tests
    ├─ Build Docker Images
    ├─ Security Scan
    │
    ▼
Deploy to Registry
    │
    ▼
Deploy to Server
    │
    ├─ Pull new images
    ├─ Run migrations
    ├─ Rolling update
    ├─ Health check
    │
    ▼
Monitor (Sentry)
```

---

## Escalabilidad

### Estrategias de Escalado

1. **Horizontal Scaling**
   - Múltiples instancias de API detrás de load balancer
   - Stateless API (JWT)
   - Session en Redis compartido

2. **Database Scaling**
   - MongoDB Replica Sets
   - Sharding para grandes volúmenes
   - Índices optimizados

3. **Caching**
   - Redis para datos frecuentes
   - CDN para assets estáticos
   - Browser caching

4. **Performance Optimization**
   - Compresión gzip
   - Minificación de assets
   - Lazy loading
   - Code splitting

---

## Monitoreo y Observabilidad

### Logs
- **Winston**: Logs estructurados
- **Morgan**: HTTP request logs
- **Rotación**: Archivos de 5MB, 5 archivos

### Métricas
- **Health Endpoint**: `/health`
- **Uptime monitoring**
- **Response times**

### Error Tracking
- **Sentry**: Errores en producción
- **Stack traces**
- **User context**

---

## Mejores Prácticas

1. ✅ **Never trust user input**: Validar todo con Zod
2. ✅ **Fail securely**: Errores genéricos al usuario
3. ✅ **Principle of least privilege**: Roles mínimos necesarios
4. ✅ **Defense in depth**: Múltiples capas de seguridad
5. ✅ **Audit everything**: Logs de todas las acciones sensibles
6. ✅ **Keep dependencies updated**: npm audit regularmente
7. ✅ **Use environment variables**: Nunca hardcodear credenciales
8. ✅ **HTTPS everywhere**: En producción siempre HTTPS

---

## Referencias

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
