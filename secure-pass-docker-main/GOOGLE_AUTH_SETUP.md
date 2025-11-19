# Configuración de Autenticación con Google

Este documento explica cómo configurar la autenticación con Google OAuth 2.0 en SecurePass.

## Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral, navega a **APIs & Services** > **Credentials**

## Paso 2: Configurar la Pantalla de Consentimiento OAuth

1. Haz clic en **OAuth consent screen** en el menú lateral
2. Selecciona **External** y haz clic en **Create**
3. Completa los campos requeridos:
   - **App name**: SecurePass
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Haz clic en **Save and Continue**
5. En **Scopes**, haz clic en **Add or Remove Scopes**
6. Agrega los siguientes scopes:
   - `userinfo.email`
   - `userinfo.profile`
7. Haz clic en **Save and Continue**
8. Agrega usuarios de prueba si tu app está en modo de desarrollo
9. Haz clic en **Save and Continue**

## Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **Credentials** en el menú lateral
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Selecciona **Web application**
4. Completa los campos:
   - **Name**: SecurePass Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (desarrollo frontend)
     - `http://localhost:8000` (desarrollo backend)
     - Tu URL de producción cuando despliegues
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/auth/google/callback`
     - Tu URL de callback de producción cuando despliegues
5. Haz clic en **Create**
6. Copia el **Client ID** y **Client Secret**

## Paso 4: Configurar Variables de Entorno

### Backend (`apps/api/.env`)

Crea un archivo `.env` en `apps/api/` basado en `.env.example`:

```env
# MongoDB
MONGODB_URI=tu_mongodb_uri

# Server
PORT=8000

# JWT
JWT_SECRET=tu_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id_aquí
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aquí
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password
```

### Frontend (`apps/web/.env`)

Crea un archivo `.env` en `apps/web/` basado en `.env.example`:

```env
# API Backend URL
VITE_API_URL=http://localhost:8000
```

## Paso 5: Instalar Dependencias

### Backend

```bash
cd apps/api
npm install
```

Las dependencias de Google OAuth ya están incluidas en el `package.json`:
- `passport`
- `passport-google-oauth20`
- `@types/passport`
- `@types/passport-google-oauth20`

### Frontend

No se requieren dependencias adicionales para el frontend. El botón de Google OAuth está implementado con redirección nativa.

## Paso 6: Ejecutar la Aplicación

### Backend

```bash
cd apps/api
npm run dev
```

El servidor se ejecutará en `http://localhost:8000`

### Frontend

```bash
cd apps/web
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## Paso 7: Probar la Autenticación con Google

1. Abre el navegador en `http://localhost:5173`
2. Verás el botón **"Continuar con Google"** en la página de login
3. Haz clic en el botón
4. Serás redirigido a la pantalla de consentimiento de Google
5. Selecciona tu cuenta de Google
6. Acepta los permisos solicitados
7. Serás redirigido de vuelta a la aplicación y estarás autenticado

## Flujo de Autenticación

1. El usuario hace clic en **"Continuar con Google"**
2. Es redirigido a Google OAuth (`/api/auth/google`)
3. Google autentica al usuario y lo redirige a `/api/auth/google/callback`
4. El backend crea o encuentra el usuario en la base de datos
5. Se genera un JWT token
6. El usuario es redirigido al frontend con el token (`/auth/google/success?token=...`)
7. El frontend guarda el token y redirige al dashboard

## Notas de Seguridad

- **NUNCA** subas tu archivo `.env` al repositorio
- Los archivos `.env.example` son plantillas sin información sensible
- Mantén tus `GOOGLE_CLIENT_SECRET` y `JWT_SECRET` seguros
- En producción, usa URLs HTTPS para las redirect URIs
- Considera implementar rate limiting para prevenir ataques de fuerza bruta

## Comportamiento para Usuarios Nuevos

Cuando un usuario se autentica con Google por primera vez:
- Se crea una cuenta automáticamente
- El rol por defecto es **"residente"**
- Los campos `apartment` y `tel` quedan vacíos
- Los usuarios pueden completar su perfil después del login inicial

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback en Google Cloud Console coincida exactamente con `GOOGLE_CALLBACK_URL`
- Asegúrate de incluir el protocolo (`http://` o `https://`)

### Error: "Invalid credentials"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que no haya espacios antes o después de los valores

### El usuario no es redirigido después del login
- Verifica que `FRONTEND_URL` en el backend esté configurado correctamente
- Revisa la consola del navegador para errores de CORS

### Error: "Usuario no puede ser guardia"
- Los usuarios con rol "guardia" no pueden acceder a la aplicación web
- Solo residentes y administradores tienen acceso

## Recursos Adicionales

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
