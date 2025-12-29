# Guía de Usuario Administrador

## 🔐 Credenciales de Acceso Inicial

Al iniciar la aplicación por primera vez, se crea automáticamente un usuario administrador con las siguientes credenciales:

- **Email:** `admin@securepass.com`
- **Contraseña:** `admin`

> ⚠️ **IMPORTANTE:** Se recomienda encarecidamente cambiar estas credenciales después del primer inicio de sesión por motivos de seguridad.

## 📝 Configuración

Las credenciales del administrador se pueden configurar a través de variables de entorno en el archivo `.env`:

```env
ADMIN_EMAIL=admin@securepass.com
ADMIN_PASSWORD=admin
ADMIN_NAME=Administrador
```

Si no se especifican estas variables, se utilizarán los valores por defecto mencionados anteriormente.

## 🚀 Inicio Automático

El usuario administrador se crea automáticamente cuando:

1. La aplicación se inicia por primera vez
2. No existe un usuario con el email configurado en `ADMIN_EMAIL`
3. La conexión a MongoDB se establece correctamente

El script de inicialización verifica si ya existe un usuario administrador antes de crear uno nuevo, evitando duplicados.

## 🔄 Cambiar Credenciales

### Opción 1: Desde la Aplicación
1. Inicia sesión con las credenciales por defecto
2. Ve a la sección de **Ajustes** → **Perfil**
3. Actualiza tu email y/o contraseña
4. Guarda los cambios

### Opción 2: Variables de Entorno
1. Antes del primer inicio, edita el archivo `.env`
2. Modifica las siguientes variables:
   ```env
   ADMIN_EMAIL=tu-email@ejemplo.com
   ADMIN_PASSWORD=tu-contraseña-segura
   ADMIN_NAME=Tu Nombre
   ```
3. Inicia la aplicación

> **Nota:** Si ya existe un usuario administrador en la base de datos, cambiar las variables de entorno no tendrá efecto. Deberás cambiar las credenciales desde la aplicación o directamente en la base de datos.

## 🐳 Uso con Docker

Al usar Docker, las variables de entorno se configuran automáticamente desde el archivo `.env` en la raíz del proyecto. Asegúrate de que el archivo `.env` contenga las variables necesarias antes de iniciar los contenedores:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus credenciales
nano .env

# Iniciar los contenedores
docker-compose -f docker-compose.local.yml up -d
```

## 🔍 Verificación

Para verificar que el usuario administrador se creó correctamente, revisa los logs del contenedor API:

```bash
docker logs securepass-api
```

Deberías ver un mensaje similar a:
```
✓ Usuario administrador creado exitosamente
  Email: admin@securepass.com
  Contraseña: admin
  ⚠️  IMPORTANTE: Cambie estas credenciales después del primer inicio de sesión
```

## 🛡️ Seguridad

### Recomendaciones de Seguridad

1. **Cambia la contraseña inmediatamente** después del primer inicio de sesión
2. **Usa una contraseña fuerte** con al menos:
   - 12 caracteres
   - Mayúsculas y minúsculas
   - Números
   - Caracteres especiales
3. **Activa la autenticación de dos factores (2FA)** si está disponible
4. **No compartas** las credenciales de administrador
5. **Revisa regularmente** los logs de acceso

### En Producción

Para entornos de producción:

1. **NUNCA** uses las credenciales por defecto
2. Configura las variables de entorno en el servidor antes del despliegue
3. Considera usar un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)
4. Implementa políticas de rotación de contraseñas
5. Activa el monitoreo de intentos de inicio de sesión fallidos

## 📋 Solución de Problemas

### El usuario admin no se crea

1. Verifica que la conexión a MongoDB sea exitosa
2. Revisa los logs de la API para ver errores
3. Asegúrate de que no exista ya un usuario con el email configurado
4. Verifica que las variables de entorno estén correctamente configuradas

### No puedo iniciar sesión

1. Verifica que estés usando el email correcto (por defecto: `admin@securepass.com`)
2. Revisa que la contraseña sea correcta (por defecto: `admin`)
3. Asegúrate de que la API esté funcionando correctamente
4. Revisa los logs de la API para ver errores de autenticación

### Olvidé la contraseña

Si olvidaste la contraseña del administrador:

1. Conéctate directamente a la base de datos MongoDB
2. Elimina el documento del usuario administrador
3. Reinicia la aplicación para que se cree uno nuevo con las credenciales por defecto
4. O modifica la contraseña directamente en la base de datos (requiere hashear la contraseña con bcrypt)

## 📞 Soporte

Si tienes problemas con el usuario administrador, consulta la documentación completa en el [README.md](./README.md) o abre un issue en el repositorio del proyecto.
