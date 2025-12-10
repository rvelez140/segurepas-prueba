# Configuración de Autenticación con Microsoft

Este documento explica cómo configurar la autenticación con Microsoft OAuth 2.0 en SecurePass.

## Paso 1: Crear una Aplicación en Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Navega a **Azure Active Directory** (o **Microsoft Entra ID**)
3. En el menú lateral, selecciona **App registrations** (Registros de aplicaciones)
4. Haz clic en **New registration** (Nuevo registro)

## Paso 2: Registrar la Aplicación

1. Completa el formulario de registro:
   - **Name**: SecurePass
   - **Supported account types**: Selecciona una de las siguientes opciones:
     - **Accounts in any organizational directory and personal Microsoft accounts** (Recomendado para máxima compatibilidad)
     - **Accounts in this organizational directory only** (Solo para tu organización)
   - **Redirect URI**:
     - Tipo: **Web**
     - URL: `http://localhost:8000/api/auth/microsoft/callback`
2. Haz clic en **Register**

## Paso 3: Configurar la Aplicación

### 3.1 Obtener el Application (client) ID

1. En la página de **Overview** de tu aplicación, copia el **Application (client) ID**
2. Este será tu `MICROSOFT_CLIENT_ID`

### 3.2 Crear un Client Secret

1. En el menú lateral, ve a **Certificates & secrets**
2. En la pestaña **Client secrets**, haz clic en **New client secret**
3. Completa:
   - **Description**: SecurePass Client Secret
   - **Expires**: Selecciona la duración (recomendado: 24 meses)
4. Haz clic en **Add**
5. **IMPORTANTE**: Copia el **Value** del secret INMEDIATAMENTE (solo se muestra una vez)
6. Este será tu `MICROSOFT_CLIENT_SECRET`

### 3.3 Configurar Permisos de API

1. En el menú lateral, ve a **API permissions**
2. Verifica que tengas los siguientes permisos de Microsoft Graph:
   - `User.Read` (ya debería estar agregado por defecto)
3. Si necesitas agregar más permisos:
   - Haz clic en **Add a permission**
   - Selecciona **Microsoft Graph**
   - Selecciona **Delegated permissions**
   - Busca y selecciona `User.Read`
   - Haz clic en **Add permissions**

### 3.4 Agregar URLs de Redirección Adicionales (Producción)

1. Ve a **Authentication** en el menú lateral
2. En **Platform configurations** > **Web**, haz clic en **Add URI**
3. Agrega:
   - URL de desarrollo: `http://localhost:8000/api/auth/microsoft/callback`
   - URL de producción: `https://tudominio.com/api/auth/microsoft/callback`
4. Habilita las siguientes opciones en **Implicit grant and hybrid flows**:
   - ✅ **Access tokens**
   - ✅ **ID tokens**
5. Haz clic en **Save**

## Paso 4: Configurar Variables de Entorno

### Backend (`apps/api/.env`)

Crea o actualiza tu archivo `.env` en `apps/api/`:

```env
# MongoDB
MONGODB_URI=tu_mongodb_uri

# Server
PORT=8000

# JWT
JWT_SECRET=tu_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=tu_application_client_id_aquí
MICROSOFT_CLIENT_SECRET=tu_client_secret_value_aquí
MICROSOFT_CALLBACK_URL=http://localhost:8000/api/auth/microsoft/callback

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

```env
# API Backend URL
VITE_API_URL=http://localhost:8000
```

## Paso 5: Ejecutar la Aplicación

### Backend

```bash
cd apps/api
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:8000`

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## Paso 6: Probar la Autenticación con Microsoft

1. Abre el navegador en `http://localhost:5173`
2. Verás los botones **"Continuar con Google"** y **"Continuar con Microsoft"**
3. Haz clic en **"Continuar con Microsoft"**
4. Serás redirigido a la página de login de Microsoft
5. Ingresa tus credenciales de Microsoft (cuenta personal o corporativa)
6. Acepta los permisos solicitados
7. Serás redirigido de vuelta a la aplicación y estarás autenticado

## Flujo de Autenticación

1. El usuario hace clic en **"Continuar con Microsoft"**
2. Es redirigido a Microsoft OAuth (`/api/auth/microsoft`)
3. Microsoft autentica al usuario y lo redirige a `/api/auth/microsoft/callback`
4. El backend crea o encuentra el usuario en la base de datos
5. Se genera un JWT token
6. El usuario es redirigido al frontend con el token (`/auth/microsoft/success?token=...`)
7. El frontend guarda el token y redirige al dashboard

## Tipos de Cuentas Compatibles

Microsoft OAuth soporta diferentes tipos de cuentas:

1. **Personal Microsoft Accounts** (Hotmail, Outlook.com, Live.com)
2. **Work or School Accounts** (Azure AD / Microsoft Entra ID)
3. **Azure AD B2C Accounts**

La configuración en este documento soporta tanto cuentas personales como corporativas.

## Notas de Seguridad

- **NUNCA** subas tu archivo `.env` al repositorio
- Guarda el **Client Secret** de forma segura (solo se muestra una vez en Azure Portal)
- Mantén tu `MICROSOFT_CLIENT_SECRET` y `JWT_SECRET` seguros
- En producción, usa URLs HTTPS para las redirect URIs
- Rota tus secrets periódicamente (cada 6-12 meses)
- Considera implementar rate limiting para prevenir ataques de fuerza bruta

## Comportamiento para Usuarios Nuevos

Cuando un usuario se autentica con Microsoft por primera vez:

- Se crea una cuenta automáticamente
- El rol por defecto es **"residente"**
- Los campos `apartment` y `tel` quedan vacíos
- Los usuarios pueden completar su perfil después del login inicial
- El email se obtiene del perfil de Microsoft

## Diferencias entre Cuentas Personales y Corporativas

### Cuentas Personales (@hotmail, @outlook, @live)

- Login directo con credenciales de Microsoft
- No requiere permisos de administrador
- Acceso inmediato

### Cuentas Corporativas (Work/School)

- Pueden requerir permisos de administrador del tenant de Azure AD
- El administrador puede necesitar dar consentimiento a la aplicación
- Políticas de seguridad corporativas pueden aplicar

## Troubleshooting

### Error: "AADSTS50011: The reply URL specified in the request does not match"

- Verifica que la URL de callback en Azure Portal coincida exactamente con `MICROSOFT_CALLBACK_URL`
- Asegúrate de incluir el protocolo (`http://` o `https://`)
- Revisa que no haya espacios o caracteres adicionales

### Error: "AADSTS700016: Application not found in the directory"

- Verifica que `MICROSOFT_CLIENT_ID` sea correcto
- Asegúrate de estar usando el **Application (client) ID**, no el **Object ID**

### Error: "invalid_client"

- Verifica que `MICROSOFT_CLIENT_SECRET` sea correcto
- Asegúrate de que el secret no haya expirado
- El secret debe ser el **Value**, no el **Secret ID**

### Error: "AADSTS65001: The user or administrator has not consented"

- El usuario o administrador necesita dar consentimiento a la aplicación
- En cuentas corporativas, contacta al administrador de Azure AD
- Revisa los permisos configurados en **API permissions**

### El usuario no es redirigido después del login

- Verifica que `FRONTEND_URL` en el backend esté configurado correctamente
- Revisa la consola del navegador para errores de CORS
- Asegúrate de que la ruta `/auth/microsoft/success` existe en el frontend

### Error: "Usuario no puede ser guardia"

- Los usuarios con rol "guardia" no pueden acceder a la aplicación web
- Solo residentes y administradores tienen acceso

## Configuración de Producción

Para producción, actualiza las siguientes configuraciones:

### En Azure Portal:

1. Agrega la URL de producción en **Redirect URIs**:
   - `https://tudominio.com/api/auth/microsoft/callback`
2. Agrega la URL del frontend en **Redirect URIs** si es necesario

### En variables de entorno:

```env
MICROSOFT_CALLBACK_URL=https://tudominio.com/api/auth/microsoft/callback
FRONTEND_URL=https://tufrontend.com
```

## Recursos Adicionales

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)
- [Passport Microsoft Strategy](https://github.com/seanfisher/passport-microsoft)
