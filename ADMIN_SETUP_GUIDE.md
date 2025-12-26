# Guía de Configuración de Usuario Administrador

Esta guía te ayudará a crear un usuario administrador para acceder al sistema SecurePass.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- El proyecto SecurePass debe estar corriendo (`docker-compose up -d`)
- Acceso SSH o terminal al servidor donde está corriendo SecurePass

## 🚀 Método 1: Script Automático (Recomendado)

Este es el método más sencillo. El script se encarga de todo automáticamente.

### Pasos:

1. **Navegar al directorio del proyecto:**
   ```bash
   cd /opt/securepass
   ```

2. **Asegurarse de tener los últimos cambios:**
   ```bash
   git pull origin claude/update-ubuntu-lts-ahbqj
   ```

3. **Ejecutar el script de configuración:**
   ```bash
   ./scripts/setup-admin.sh
   ```

4. **Usar las credenciales por defecto:**
   - Email: `admin@securepass.com`
   - Password: `Admin123!`

### Personalizar las credenciales:

Si deseas usar credenciales personalizadas, ejecuta:

```bash
ADMIN_EMAIL="tu-email@ejemplo.com" \
ADMIN_PASSWORD="TuPassword123!" \
ADMIN_NAME="Tu Nombre" \
./scripts/setup-admin.sh
```

## 🔧 Método 2: Ejecución Manual

Si prefieres hacerlo paso a paso o el script automático no funciona:

### Paso 1: Copiar el script al contenedor

```bash
cd /opt/securepass
docker cp scripts/create-admin.js securepass-api:/app/create-admin.js
```

### Paso 2: Ejecutar el script dentro del contenedor

```bash
docker exec -it securepass-api node /app/create-admin.js
```

### Paso 3: (Opcional) Limpiar el archivo temporal

```bash
docker exec securepass-api rm /app/create-admin.js
```

## 🔑 Método 3: Comando Directo en el Contenedor

Si los scripts no funcionan, puedes crear el usuario directamente con MongoDB:

```bash
docker exec -it securepass-api node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  auth: { email: String, password: String },
  name: String,
  role: String,
  registerDate: Date,
  updateDate: Date,
  lastAccess: Date
});

const User = mongoose.model('User', userSchema);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    const admin = new User({
      auth: { email: 'admin@securepass.com', password: hashedPassword },
      name: 'Administrador',
      role: 'admin',
      registerDate: new Date(),
      updateDate: new Date(),
      lastAccess: new Date()
    });

    await admin.save();
    console.log('✅ Admin creado!');
    console.log('Email: admin@securepass.com');
    console.log('Password: Admin123!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
})();
"
```

## 📱 Iniciar Sesión

Una vez creado el usuario administrador:

1. **Accede a la aplicación web** en tu navegador:
   - URL local: `http://localhost:8472`
   - URL de producción: `http://TU_IP_SERVIDOR:8472`

2. **Inicia sesión con las credenciales:**
   - Email: `admin@securepass.com`
   - Password: `Admin123!`

3. **Cambia tu contraseña** después del primer login (recomendado)

## ⚠️ Solución de Problemas

### Error: "El contenedor no está corriendo"

**Solución:**
```bash
cd /opt/securepass
docker-compose up -d
```

### Error: "Cannot find module"

**Causa:** El script no está disponible dentro del contenedor.

**Solución:** Usa el Método 3 (comando directo) que no requiere archivos externos.

### Error: "Email already exists" (Email ya existe)

**Solución:** El usuario ya existe en la base de datos. Opciones:

1. **Resetear la contraseña del usuario existente:**
   ```bash
   docker exec -it securepass-mongodb mongosh -u $MONGO_ROOT_USER -p $MONGO_ROOT_PASSWORD
   use securepass
   db.users.deleteOne({ "auth.email": "admin@securepass.com" })
   exit
   ```
   Luego ejecuta nuevamente el script de creación.

2. **Usar un email diferente:**
   ```bash
   ADMIN_EMAIL="otro-admin@securepass.com" ./scripts/setup-admin.sh
   ```

### Error de Conexión a MongoDB

**Verificar que MongoDB está corriendo:**
```bash
docker ps | grep mongodb
```

**Ver logs de MongoDB:**
```bash
docker logs securepass-mongodb
```

**Verificar variables de entorno:**
```bash
docker exec securepass-api env | grep MONGODB_URI
```

## 🔐 Seguridad

### Recomendaciones Importantes:

1. **Cambia la contraseña por defecto** después del primer login
2. **No uses credenciales débiles** en producción
3. **Mantén las credenciales seguras** y no las compartas
4. **Habilita autenticación de dos factores** si está disponible
5. **Revisa regularmente** los logs de acceso

### Cambiar Contraseña Después del Login:

Una vez dentro del sistema:
1. Ve a **Configuración de Perfil**
2. Selecciona **Cambiar Contraseña**
3. Ingresa la contraseña actual y la nueva
4. Guarda los cambios

## 📞 Soporte

Si encuentras problemas:

1. **Verifica los logs del contenedor:**
   ```bash
   docker logs securepass-api
   ```

2. **Verifica el estado de los servicios:**
   ```bash
   docker-compose ps
   ```

3. **Reinicia los contenedores si es necesario:**
   ```bash
   docker-compose restart
   ```

## 📝 Notas Adicionales

- El script `create-admin.js` verifica si ya existe un usuario antes de crear uno nuevo
- Puedes ejecutar el script múltiples veces de forma segura
- El script te pedirá confirmación antes de actualizar un usuario existente
- Las contraseñas se hashean automáticamente usando bcrypt

## ✅ Verificación Final

Para verificar que el usuario se creó correctamente:

```bash
docker exec -it securepass-mongodb mongosh -u $MONGO_ROOT_USER -p $MONGO_ROOT_PASSWORD --eval "
  use securepass;
  db.users.findOne({ 'auth.email': 'admin@securepass.com' }, { 'auth.email': 1, name: 1, role: 1 });
"
```

Deberías ver algo como:
```json
{
  "_id": ObjectId("..."),
  "auth": { "email": "admin@securepass.com" },
  "name": "Administrador",
  "role": "admin"
}
```
