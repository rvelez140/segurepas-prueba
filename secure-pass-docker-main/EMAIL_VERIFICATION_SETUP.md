# Sistema de Verificación de Email

Este documento explica el sistema de verificación de email implementado en SecurePass para asegurar que los usuarios confirmen su dirección de correo electrónico antes de acceder a la aplicación.

## Características del Sistema

✅ **Verificación obligatoria**: Los usuarios deben verificar su email antes de poder iniciar sesión
✅ **Doble verificación**: Código de 6 dígitos y enlace de activación
✅ **Emails HTML**: Emails con formato profesional y branding
✅ **Email de bienvenida**: Los usuarios reciben un email de bienvenida después de verificar su cuenta
✅ **Expiración de tokens**: Códigos y enlaces válidos por 24 horas
✅ **Reenvío de código**: Los usuarios pueden solicitar un nuevo código
✅ **Excepción para OAuth**: Usuarios de Google/Microsoft están verificados automáticamente

## Flujo de Verificación

### 1. Registro de Usuario

Cuando un usuario se registra:

1. Se crea la cuenta con `emailVerified: false`
2. Se generan:
   - **Código de 6 dígitos**: Para verificación manual
   - **Token único**: Para verificación por enlace
3. Se envía un email con:
   - Código de verificación
   - Enlace de activación
   - Instrucciones claras
4. El usuario recibe confirmación de registro

### 2. Intento de Login

Cuando un usuario intenta iniciar sesión:

1. El sistema verifica credenciales
2. Si el email no está verificado:
   - Retorna error 403
   - Indica que requiere verificación
   - Frontend redirige a página de verificación

### 3. Verificación del Email

El usuario puede verificar de dos formas:

#### Opción A: Código de Verificación
1. Ingresa email y código de 6 dígitos
2. Sistema valida el código
3. Marca email como verificado
4. Redirige al login

#### Opción B: Enlace de Activación
1. Usuario hace clic en el enlace del email
2. Frontend captura el token de la URL
3. Llama al backend para verificar
4. Marca email como verificado
5. Redirige al login

### 4. Email de Bienvenida

Después de la verificación exitosa:

1. El sistema envía automáticamente un email de bienvenida
2. El email incluye:
   - Nombre del usuario
   - Email del usuario
   - Rol asignado
   - Fecha de registro
   - Características principales de SecurePass
   - Enlace directo a la aplicación
3. Si el envío del email falla, el proceso de verificación continúa normalmente
4. El usuario puede acceder a la aplicación inmediatamente

## Rutas de API

### Backend (`apps/api`)

```
POST   /api/verification/verify-code
Body:  { email: string, code: string }
Desc:  Verifica un código de 6 dígitos

GET    /api/verification/verify-token/:token
Desc:  Verifica un token de activación

POST   /api/verification/resend
Body:  { email: string }
Desc:  Reenvía el email de verificación
```

### Frontend (`apps/web`)

```
/verify-email?token=xxx    - Verificación automática por token
/verify-email?email=xxx    - Verificación manual con código
```

## Estructura de los Emails

### Email de Verificación

El email de verificación incluye:

```
┌─────────────────────────────────┐
│  🔐 SECUREPASS                   │
│  Bienvenido a SecurePass        │
├─────────────────────────────────┤
│  Hola [Nombre],                 │
│                                 │
│  Código de Verificación:        │
│  ┌─────────────┐                │
│  │  123456    │  (6 dígitos)   │
│  └─────────────┘                │
│                                 │
│  O haz clic aquí:               │
│  [Verificar mi cuenta]          │
│                                 │
│  ⚠️ Válido por 24 horas          │
└─────────────────────────────────┘
```

### Email de Bienvenida

El email de bienvenida incluye:

```
┌─────────────────────────────────┐
│  🔐 SECUREPASS                   │
│  ¡Bienvenido a SecurePass!      │
├─────────────────────────────────┤
│  ¡Tu cuenta está activada! 🎉   │
│                                 │
│  Hola [Nombre],                 │
│                                 │
│  📋 Información de tu cuenta:   │
│  • Nombre: [Nombre]             │
│  • Email: [Email]               │
│  • Rol: [Rol]                   │
│  • Fecha: [Fecha de registro]   │
│                                 │
│  ✨ Características:             │
│  👥 Gestionar Visitantes         │
│  📱 Códigos QR                   │
│  📊 Historial                    │
│  🔔 Notificaciones               │
│  🛡️ Seguridad                    │
│                                 │
│  [Ir a SecurePass]              │
└─────────────────────────────────┘
```

## Configuración

### Variables de Entorno

Ya están configuradas en `.env.example`:

```env
# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Configurar Gmail para Nodemailer

1. Habilita **2-Step Verification** en tu cuenta de Google
2. Genera una **App Password**:
   - Ve a https://myaccount.google.com/security
   - Busca "App passwords"
   - Genera una contraseña para "Mail"
   - Usa esa contraseña en `EMAIL_PASSWORD`

### Probar el Sistema

```bash
# 1. Configurar variables de entorno
cd apps/api
cp .env.example .env
# Edita .env con tus credenciales

# 2. Iniciar backend
npm run dev

# 3. Iniciar frontend (otra terminal)
cd apps/web
npm run dev

# 4. Registrar un usuario
# Visita http://localhost:5173
# Completa el formulario de registro
# Revisa tu email

# 5. Verificar email
# Opción A: Ingresa el código de 6 dígitos
# Opción B: Haz clic en el enlace del email

# 6. Iniciar sesión
# Ahora podrás acceder con tus credenciales
```

## Casos Especiales

### Usuarios OAuth (Google/Microsoft)

Los usuarios que se registran con Google o Microsoft:
- **NO requieren verificación de email**
- Se marcan automáticamente como `emailVerified: true`
- Pueden acceder inmediatamente después del registro
- Los proveedores OAuth ya verifican el email

### Código Expirado

Si el código o token expira (después de 24 horas):
- El usuario ve un mensaje de error
- Puede solicitar un nuevo código con "Reenviar Email"
- Se genera un nuevo código y token
- Se actualiza la fecha de expiración

### Email No Recibido

Si el usuario no recibe el email:
1. Verificar carpeta de spam/correo no deseado
2. Usar el botón "Reenviar Email"
3. Verificar que `EMAIL_USER` y `EMAIL_PASSWORD` sean correctos
4. Revisar logs del backend para errores de SMTP

## Estructura de Archivos

### Backend

```
apps/api/src/
├── controllers/
│   ├── authController.ts          # Modificado: Login con verificación
│   └── verificationController.ts  # NUEVO: Controlador de verificación (incluye email de bienvenida)
├── services/
│   └── EmailVerificationService.ts # NUEVO: Servicio de emails (verificación + bienvenida)
├── routes/
│   └── verificationRoutes.ts      # NUEVO: Rutas de verificación
├── models/
│   └── User.ts                     # Modificado: Campos de verificación
└── interfaces/
    └── IUser.ts                    # Modificado: Interface actualizada
```

### Frontend

```
apps/web/src/
├── pages/
│   └── verification/
│       └── EmailVerification.tsx   # NUEVO: Página de verificación
├── components/
│   └── login/
│       └── Login.tsx               # Modificado: Redirección a verificación
├── styles/
│   └── visits.module.css           # Modificado: Estilos de verificación
└── App.tsx                         # Modificado: Ruta de verificación
```

## Modelo de Datos

### Campos Agregados a User

```typescript
interface IUser {
  // ... campos existentes ...
  emailVerified: boolean;              // Si el email está verificado
  verificationToken?: string;          # Token único de verificación
  verificationCode?: string;           // Código de 6 dígitos
  verificationTokenExpires?: Date;     // Fecha de expiración
}
```

### Schema de MongoDB

```javascript
{
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false  // No se devuelve en queries
  },
  verificationCode: {
    type: String,
    select: false  // No se devuelve en queries
  },
  verificationTokenExpires: {
    type: Date,
    select: false  // No se devuelve in queries
  }
}
```

## Seguridad

### Mejores Prácticas Implementadas

✅ **Tokens criptográficamente seguros**: Generados con `crypto.randomBytes(32)`
✅ **Códigos aleatorios**: Generados con `Math.random()` de 6 dígitos
✅ **Expiración de tokens**: Válidos solo por 24 horas
✅ **No se devuelven en consultas**: Campos marcados con `select: false`
✅ **Validación de email**: Formato verificado con regex
✅ **Rate limiting recomendado**: Limitar intentos de verificación

### Recomendaciones Adicionales

1. **Implementar rate limiting**: Limitar intentos de verificación por IP
2. **Captcha**: Agregar reCAPTCHA en el registro
3. **Logs de auditoría**: Registrar intentos fallidos de verificación
4. **Notificaciones**: Alertar sobre múltiples intentos fallidos

## Troubleshooting

### Error: "No se pudo enviar el email"

**Posibles causas:**
- Credenciales de Gmail incorrectas
- 2-Step Verification no habilitada
- App Password no generada o incorrecta
- Firewall bloqueando puerto 587

**Solución:**
1. Verifica `EMAIL_USER` y `EMAIL_PASSWORD`
2. Genera una nueva App Password
3. Revisa logs del backend para detalles del error

### Error: "Código de verificación incorrecto"

**Posibles causas:**
- Código ingresado incorrectamente
- Código ya usado
- Código expirado (>24 horas)

**Solución:**
- Verifica el código en el email
- Solicita un nuevo código con "Reenviar Email"
- Revisa que el email sea correcto

### Error: "Token de verificación inválido"

**Posibles causas:**
- Enlace ya usado
- Token expirado (>24 horas)
- Token manipulado

**Solución:**
- Solicita un nuevo email de verificación
- No modifiques el enlace del email

## Testing

### Pruebas Manuales

```bash
# 1. Registro
curl -X POST http://localhost:8000/api/auth/register/force \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "residente",
    "apartment": "A-1",
    "tel": "+1809-555-1234"
  }'

# 2. Verificar código
curl -X POST http://localhost:8000/api/verification/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# 3. Reenviar email
curl -X POST http://localhost:8000/api/verification/resend \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## FAQs

**P: ¿Los administradores necesitan verificar su email?**
R: Sí, todos los usuarios registrados manualmente deben verificar su email.

**P: ¿Qué pasa si pierdo el email de verificación?**
R: Puedes solicitar un nuevo código en la página de verificación con el botón "Reenviar Email".

**P: ¿Cuánto tiempo tengo para verificar mi email?**
R: 24 horas desde el momento del registro o el último reenvío.

**P: ¿Puedo cambiar mi email después de verificarlo?**
R: Necesitarías contactar al administrador para cambiar el email verificado.

**P: ¿Los usuarios de Google/Microsoft necesitan verificar?**
R: No, los proveedores OAuth ya verifican el email.

## Soporte

Para problemas o preguntas sobre el sistema de verificación de email:

1. Revisa esta documentación
2. Consulta los logs del backend
3. Verifica la configuración de email en `.env`
4. Revisa el troubleshooting arriba

---

**Última actualización**: Noviembre 2025
**Versión del sistema**: 1.0.0
