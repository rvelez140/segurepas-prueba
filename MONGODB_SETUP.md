# Configuración de MongoDB Externa (MongoDB Atlas)

Esta guía te ayudará a configurar una base de datos MongoDB externa para el proyecto SecurePass.

## Opciones de Base de Datos

### Opción 1: MongoDB Local (Desarrollo)

- **Uso**: Desarrollo local
- **Costo**: Gratis
- **Configuración**: Simple, usa Docker
- **URI**: `mongodb://localhost:37849/securepass`

### Opción 2: MongoDB Atlas (Producción) ⭐ RECOMENDADO

- **Uso**: Producción, staging, desarrollo remoto
- **Costo**: Plan gratuito disponible (512 MB)
- **Configuración**: Requiere cuenta en MongoDB Atlas
- **URI**: `mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>`

---

## Configurar MongoDB Atlas (Base de datos externa)

### Paso 1: Crear una cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Haz clic en "Start Free" o "Try Free"
3. Regístrate con tu email o cuenta de Google/GitHub

### Paso 2: Crear un Cluster

1. Una vez dentro del dashboard, haz clic en "Build a Database"
2. Selecciona el plan **FREE** (M0 Sandbox)
3. Elige tu proveedor cloud preferido:
   - **AWS** (Amazon Web Services)
   - **Google Cloud**
   - **Azure**
4. Selecciona la región más cercana a tus usuarios (ejemplo: `us-east-1` para USA)
5. Dale un nombre a tu cluster (ejemplo: `securepass-cluster`)
6. Haz clic en "Create Cluster"

### Paso 3: Configurar Seguridad

#### 3.1 Crear un usuario de base de datos

1. En el menú lateral, ve a **Security** → **Database Access**
2. Haz clic en "Add New Database User"
3. Configura:
   - **Authentication Method**: Password
   - **Username**: `securepass_admin` (o el nombre que prefieras)
   - **Password**: Genera una contraseña segura o usa la autogenerada
   - **⚠️ IMPORTANTE**: Guarda esta contraseña, la necesitarás para la URI
4. En **Database User Privileges**, selecciona "Read and write to any database"
5. Haz clic en "Add User"

#### 3.2 Configurar Network Access (Lista blanca de IPs)

1. En el menú lateral, ve a **Security** → **Network Access**
2. Haz clic en "Add IP Address"
3. Tienes dos opciones:

   **Opción A: Permitir acceso desde cualquier IP (más fácil, menos seguro)**
   - Haz clic en "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   - ⚠️ Solo recomendado para desarrollo

   **Opción B: Permitir solo IPs específicas (más seguro)**
   - Agrega la IP de tu servidor de producción
   - Agrega tu IP local para desarrollo
   - Puedes agregar múltiples IPs

4. Haz clic en "Confirm"

### Paso 4: Obtener la URI de conexión

1. Ve a **Database** en el menú lateral
2. En tu cluster, haz clic en "Connect"
3. Selecciona "Connect your application"
4. Configuración:
   - **Driver**: Node.js
   - **Version**: 5.5 or later (la más reciente)
5. Copia la **Connection String** que se muestra

La URI se verá así:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Paso 5: Configurar tu archivo `.env`

1. Crea un archivo `.env` en `apps/api/` (si no existe)
2. Copia el contenido de `.env.example`
3. Actualiza la variable `MONGODB_URI` con tu URI de MongoDB Atlas:

```bash
# Reemplaza los valores entre < >
MONGODB_URI=mongodb+srv://<tu_usuario>:<tu_password>@cluster0.xxxxx.mongodb.net/securepass?retryWrites=true&w=majority
```

**Ejemplo real:**

```bash
MONGODB_URI=mongodb+srv://securepass_admin:MiPassword123@cluster0.abc123.mongodb.net/securepass?retryWrites=true&w=majority
```

⚠️ **IMPORTANTE**:

- Reemplaza `<tu_usuario>` con el usuario que creaste (ejemplo: `securepass_admin`)
- Reemplaza `<tu_password>` con la contraseña del usuario
- Reemplaza `cluster0.xxxxx` con tu cluster real
- Agrega el nombre de la base de datos antes del `?` (ejemplo: `/securepass`)
- Si tu contraseña contiene caracteres especiales, debes codificarlos en URL:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `+` → `%2B`
  - etc.

### Paso 6: Verificar la conexión

1. Inicia tu servidor:

```bash
cd apps/api
npm run dev
```

2. Deberías ver en la consola:

```
✓ Se ha realizado la conexión con MongoDB
  Tipo de conexión: MongoDB Atlas (Externa)
Servidor corriendo en Puerto: 8000
```

---

## Migrar datos de MongoDB Local a MongoDB Atlas

Si ya tienes datos en tu MongoDB local y quieres migrarlos a Atlas:

### Opción 1: Usando mongodump y mongorestore

```bash
# 1. Exportar datos de MongoDB local
mongodump --uri="mongodb://localhost:37849/securepass" --out=./backup

# 2. Importar a MongoDB Atlas
mongorestore --uri="mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/securepass" ./backup/securepass
```

### Opción 2: Usando MongoDB Compass (GUI)

1. Descarga [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Conéctate a tu MongoDB local
3. Exporta las colecciones que necesites
4. Conéctate a MongoDB Atlas
5. Importa las colecciones

---

## Otros Proveedores de MongoDB en la Nube

Además de MongoDB Atlas, existen otras opciones:

### 1. **MongoDB Cloud Manager**

- Gestión de MongoDB auto-hosted
- Más control pero más complejo
- URL: https://www.mongodb.com/cloud/cloud-manager

### 2. **Railway.app**

- Hosting sencillo con MongoDB
- Plan gratuito disponible
- URL: https://railway.app

### 3. **DigitalOcean Managed Databases**

- MongoDB como servicio gestionado
- Desde $15/mes
- URL: https://www.digitalocean.com/products/managed-databases-mongodb

### 4. **AWS DocumentDB**

- Compatible con MongoDB
- Para aplicaciones en AWS
- URL: https://aws.amazon.com/documentdb

---

## Troubleshooting (Solución de Problemas)

### Error: "MongoServerError: bad auth"

- **Causa**: Usuario o contraseña incorrectos
- **Solución**: Verifica las credenciales en MongoDB Atlas y en tu archivo `.env`

### Error: "MongooseServerSelectionError: connect ETIMEDOUT"

- **Causa**: Tu IP no está en la lista blanca o hay problemas de red
- **Solución**:
  - Verifica Network Access en MongoDB Atlas
  - Agrega tu IP actual o permite `0.0.0.0/0`

### Error: "Authentication failed"

- **Causa**: Contraseña con caracteres especiales no codificados
- **Solución**: Codifica los caracteres especiales en URL encoding

### La conexión es muy lenta

- **Causa**: Cluster muy lejos geográficamente
- **Solución**: Considera cambiar la región del cluster

---

## Mejores Prácticas

1. ✅ **Usa variables de entorno**: Nunca hardcodees la URI de MongoDB en el código
2. ✅ **Contraseñas seguras**: Usa contraseñas fuertes y únicas
3. ✅ **Backups regulares**: Configura backups automáticos en MongoDB Atlas
4. ✅ **Monitoreo**: Usa las herramientas de monitoreo de Atlas para ver el uso
5. ✅ **Índices**: Crea índices apropiados para mejorar el rendimiento
6. ✅ **Límites de conexión**: Configura connection pooling apropiado
7. ⚠️ **Network Access**: En producción, solo permite IPs específicas
8. ⚠️ **Usuarios específicos**: Crea usuarios con permisos mínimos necesarios

---

## Recursos Adicionales

- 📚 [Documentación oficial de MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- 📚 [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- 📚 [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)
- 🎓 [MongoDB University (Cursos gratis)](https://university.mongodb.com/)

---

## Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de tu aplicación
2. Verifica la configuración en MongoDB Atlas
3. Consulta la documentación oficial
4. Abre un issue en el repositorio del proyecto
