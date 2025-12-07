# Configuración de Base de Datos MongoDB Externa

## ✅ Configuración Completada

Se ha configurado la conexión a la base de datos MongoDB externa en `mongodb.asolutions.digital`.

### 📋 Credenciales Configuradas

- **Host**: `mongodb.asolutions.digital`
- **Puerto**: `27017`
- **Usuario**: `securepass`
- **Base de datos**: `securepass`
- **Contraseña**: Configurada en `.env`

### 🔧 Archivos Modificados

1. **`.env`** - Configuración de variables de entorno
2. **`src/index.ts`** - Mejorada la conexión con opciones de producción
3. **`test-connection.js`** - Script de prueba de conexión

### 🚀 Cómo Probar la Conexión

```bash
cd apps/api

# Método 1: Script de prueba rápida
node test-connection.js

# Método 2: Iniciar el servidor completo
npm run dev
```

### ✅ Resultado Esperado

Al conectarse correctamente, verás:

```
✅ ¡CONEXIÓN EXITOSA!
✓ Se ha realizado la conexión con MongoDB
✓ Tipo de conexión: MongoDB Externo (asolutions.digital)
✓ Base de datos: securepass
✓ Estado: Conectado
```

---

## 🔍 Solución de Problemas

### Problema: Error "getaddrinfo EAI_AGAIN"

Este error indica un problema temporal de DNS al resolver el nombre `mongodb.asolutions.digital`.

**Soluciones:**

#### 1. Usar la IP directamente (si conoces la IP del servidor)

Edita el archivo `.env` y reemplaza:
```bash
MONGODB_URI=mongodb://securepass:PB3Lx2n4Sx4tlYK5@mongodb.asolutions.digital:27017/securepass?authSource=admin
```

Por (ejemplo con IP):
```bash
MONGODB_URI=mongodb://securepass:PB3Lx2n4Sx4tlYK5@192.168.1.100:27017/securepass?authSource=admin
```

Para obtener la IP del servidor:
```bash
nslookup mongodb.asolutions.digital
# o
ping mongodb.asolutions.digital
```

#### 2. Verificar /etc/hosts

Agrega una entrada manual en `/etc/hosts`:
```bash
sudo nano /etc/hosts
```

Agrega:
```
<IP_DEL_SERVIDOR> mongodb.asolutions.digital
```

#### 3. Verificar DNS del sistema

```bash
# Ver configuración DNS actual
cat /etc/resolv.conf

# Probar resolver el dominio
dig mongodb.asolutions.digital
# o
nslookup mongodb.asolutions.digital
```

#### 4. Reiniciar servicio de red

```bash
# En sistemas Linux
sudo systemctl restart systemd-resolved

# O reiniciar el servicio de red
sudo systemctl restart NetworkManager
```

---

### Problema: Error "Authentication failed"

**Causas:**
- Usuario o contraseña incorrectos
- authSource incorrecto
- El usuario no tiene permisos en la base de datos

**Solución:**

1. Verifica las credenciales en la imagen Docker o configuración de MongoDB
2. Asegúrate que el `authSource` sea correcto (generalmente `admin`)
3. Verifica los permisos del usuario en MongoDB:

```javascript
// Conectarse a MongoDB y verificar
use admin
db.auth("securepass", "PB3Lx2n4Sx4tlYK5")
show dbs
use securepass
show collections
```

---

### Problema: Error "Connection timeout"

**Causas:**
- Firewall bloqueando el puerto 27017
- IP no está en la lista blanca
- Servidor MongoDB no está ejecutándose

**Solución:**

1. **Verificar que el servidor esté accesible:**
```bash
telnet mongodb.asolutions.digital 27017
# o
nc -zv mongodb.asolutions.digital 27017
```

2. **Verificar firewall:**
```bash
# Verificar reglas de firewall
sudo ufw status
sudo iptables -L
```

3. **Agregar IP a lista blanca** (si es necesario en la configuración de MongoDB)

---

### Problema: Errores de TypeScript en StorageService.ts

Estos son errores pre-existentes en el código, no relacionados con la configuración de MongoDB.

**Solución temporal:**

Ejecutar el servidor sin verificación de tipos:
```bash
# Compilar y ejecutar
npm run build
npm start
```

O configurar `tsconfig.json` para modo menos estricto temporalmente.

---

## 📊 Verificar Estado de la Conexión

### Opción 1: Usando MongoDB Compass (GUI)

1. Descarga [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Conecta usando la URI:
   ```
   mongodb://securepass:PB3Lx2n4Sx4tlYK5@mongodb.asolutions.digital:27017/securepass?authSource=admin
   ```

### Opción 2: Usando mongosh (CLI)

```bash
mongosh "mongodb://securepass:PB3Lx2n4Sx4tlYK5@mongodb.asolutions.digital:27017/securepass?authSource=admin"

# Verificar conexión
show dbs
use securepass
show collections
```

### Opción 3: Script de Node.js

Ya está incluido: `node test-connection.js`

---

## 🔐 Seguridad

### Importante:

1. **NO** subas el archivo `.env` a git (ya está en `.gitignore`)
2. **Cambia las contraseñas** en producción
3. **Configura firewall** para permitir solo IPs autorizadas
4. **Usa SSL/TLS** en producción:
   ```bash
   MONGODB_URI=mongodb://user:pass@host:27017/db?ssl=true&authSource=admin
   ```

---

## 📝 Próximos Pasos

1. Probar la conexión desde tu entorno local
2. Verificar que el DNS resuelva correctamente
3. Si el problema persiste, contacta al administrador de `mongodb.asolutions.digital`
4. Considera usar MongoDB Atlas como alternativa (ver `MONGODB_SETUP.md`)

---

## 🆘 Soporte Adicional

Si tienes problemas:
1. Revisa los logs del servidor: `npm run dev`
2. Ejecuta el script de prueba: `node test-connection.js`
3. Contacta al administrador de la base de datos
4. Revisa la documentación completa en `MONGODB_SETUP.md`
