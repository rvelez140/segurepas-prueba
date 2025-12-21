# GitHub Secrets - Plantilla de Configuración

Esta plantilla te ayuda a configurar los GitHub Secrets necesarios para el deployment automático.

## 📍 Dónde configurar

Ve a tu repositorio en GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

## 🔐 Secrets Requeridos

### 1. Configuración del Servidor

#### `SERVER_HOST`
- **Descripción**: IP pública o dominio de tu servidor
- **Ejemplo**: `123.45.67.89` o `servidor.tudominio.com`
- **Valor**: `_______________` (completa aquí)

#### `SERVER_USER`
- **Descripción**: Usuario SSH para conectarse al servidor
- **Ejemplo**: `ubuntu`, `root`, `admin`
- **Valor**: `_______________`

#### `SERVER_SSH_KEY`
- **Descripción**: Llave privada SSH completa para autenticación
- **Cómo obtenerla**:
  ```bash
  # En tu máquina local
  cat ~/.ssh/id_rsa

  # O generar una nueva
  ssh-keygen -t rsa -b 4096 -C "deploy@securepass"
  ```
- **Formato**: Debe incluir `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`
- **IMPORTANTE**: También debes agregar la llave pública al servidor:
  ```bash
  # En el servidor
  echo "tu-llave-publica" >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```

#### `SERVER_PORT`
- **Descripción**: Puerto SSH del servidor
- **Ejemplo**: `22` (puerto por defecto)
- **Valor**: `22`

#### `DEPLOY_PATH`
- **Descripción**: Ruta donde se despliega la aplicación en el servidor
- **Ejemplo**: `/opt/securepass`
- **Valor**: `_______________`

#### `DOMAIN_NAME`
- **Descripción**: Dominio principal de tu aplicación
- **Ejemplo**: `tudominio.com`
- **Valor**: `_______________`

---

### 2. Base de Datos MongoDB

#### `MONGO_ROOT_USER`
- **Descripción**: Usuario administrador de MongoDB
- **Recomendado**: `admin`
- **Valor**: `_______________`

#### `MONGO_ROOT_PASSWORD`
- **Descripción**: Contraseña del usuario de MongoDB
- **Seguridad**: Mínimo 32 caracteres, generada aleatoriamente
- **Generar**: `openssl rand -base64 32 | tr -d "=+/" | cut -c1-32`
- **Valor**: `_______________`

#### `MONGO_DB_NAME`
- **Descripción**: Nombre de la base de datos
- **Recomendado**: `securepass`
- **Valor**: `_______________`

---

### 3. Autenticación y Seguridad

#### `JWT_SECRET`
- **Descripción**: Secreto para firmar tokens JWT
- **Seguridad**: Mínimo 64 caracteres, generado aleatoriamente
- **Generar**: `openssl rand -base64 64 | tr -d "=+/" | cut -c1-64`
- **Valor**: `_______________`

#### `JWT_EXPIRES_IN`
- **Descripción**: Tiempo de expiración de los tokens JWT
- **Recomendado**: `7d` (7 días)
- **Valor**: `7d`

---

### 4. Cloudinary (Opcional - para almacenamiento de imágenes)

#### `CLOUDINARY_CLOUD_NAME`
- **Descripción**: Nombre de tu cloud en Cloudinary
- **Dónde obtenerlo**: Dashboard de Cloudinary
- **Valor**: `_______________`

#### `CLOUDINARY_API_KEY`
- **Valor**: `_______________`

#### `CLOUDINARY_API_SECRET`
- **Valor**: `_______________`

---

### 5. Configuración de Email (Opcional)

#### `EMAIL_HOST`
- **Gmail**: `smtp.gmail.com`
- **Valor**: `smtp.gmail.com`

#### `EMAIL_PORT`
- **Gmail**: `587`
- **Valor**: `587`

#### `EMAIL_USER`
- **Descripción**: Tu email de Gmail
- **Valor**: `_______________`

#### `EMAIL_PASSWORD`
- **Descripción**: App Password de Gmail (NO tu contraseña normal)
- **Cómo obtenerla**:
  1. Ve a https://myaccount.google.com/security
  2. Activa verificación en 2 pasos
  3. Ve a "App Passwords"
  4. Genera una contraseña para "Mail"
- **Valor**: `_______________`

---

### 6. Stripe (Opcional - para pagos)

#### `STRIPE_SECRET_KEY`
- **Descripción**: Clave secreta de Stripe
- **Producción**: Empieza con `sk_live_`
- **Testing**: Empieza con `sk_test_`
- **Valor**: `_______________`

#### `STRIPE_WEBHOOK_SECRET`
- **Descripción**: Secret para validar webhooks de Stripe
- **Valor**: `_______________`

#### Stripe Price IDs
- `STRIPE_PRICE_BASIC_MONTHLY`: `_______________`
- `STRIPE_PRICE_BASIC_YEARLY`: `_______________`
- `STRIPE_PRICE_PREMIUM_MONTHLY`: `_______________`
- `STRIPE_PRICE_PREMIUM_YEARLY`: `_______________`
- `STRIPE_PRICE_ENTERPRISE_MONTHLY`: `_______________`
- `STRIPE_PRICE_ENTERPRISE_YEARLY`: `_______________`

---

### 7. PayPal (Opcional - para pagos)

#### `PAYPAL_CLIENT_ID`
- **Valor**: `_______________`

#### `PAYPAL_CLIENT_SECRET`
- **Valor**: `_______________`

#### `PAYPAL_MODE`
- **Sandbox**: `sandbox` (para pruebas)
- **Producción**: `live`
- **Valor**: `_______________`

#### PayPal Plan IDs
- `PAYPAL_PLAN_BASIC_MONTHLY`: `_______________`
- `PAYPAL_PLAN_BASIC_YEARLY`: `_______________`
- `PAYPAL_PLAN_PREMIUM_MONTHLY`: `_______________`
- `PAYPAL_PLAN_PREMIUM_YEARLY`: `_______________`
- `PAYPAL_PLAN_ENTERPRISE_MONTHLY`: `_______________`
- `PAYPAL_PLAN_ENTERPRISE_YEARLY`: `_______________`

---

## 📋 Checklist de Configuración

Marca cada secret mientras lo configuras:

**Servidor y Deployment:**
- [ ] SERVER_HOST
- [ ] SERVER_USER
- [ ] SERVER_SSH_KEY
- [ ] SERVER_PORT
- [ ] DEPLOY_PATH
- [ ] DOMAIN_NAME

**Base de Datos:**
- [ ] MONGO_ROOT_USER
- [ ] MONGO_ROOT_PASSWORD
- [ ] MONGO_DB_NAME

**Seguridad:**
- [ ] JWT_SECRET

**Opcionales (marca los que uses):**
- [ ] Cloudinary (CLOUD_NAME, API_KEY, API_SECRET)
- [ ] Email (HOST, PORT, USER, PASSWORD)
- [ ] Stripe (SECRET_KEY, WEBHOOK_SECRET, Price IDs)
- [ ] PayPal (CLIENT_ID, CLIENT_SECRET, Plan IDs)

---

## 🔍 Verificación

Después de configurar todos los secrets, verifica:

1. **En GitHub**:
   ```
   Settings → Secrets and variables → Actions
   ```
   Deberías ver todos los secrets listados (pero no sus valores)

2. **Prueba el workflow**:
   ```bash
   # Haz un push a main o ejecuta manualmente el workflow
   git push origin main
   ```

3. **Revisa los logs**:
   ```
   Actions → Selecciona el workflow → Revisa cada step
   ```

---

## ⚠️ Seguridad

- ❌ NUNCA compartas los valores de los secrets
- ❌ NUNCA los escribas en código o commits
- ❌ NUNCA los envíes por email o chat sin cifrar
- ✅ Usa un gestor de contraseñas para guardarlos
- ✅ Rota las credenciales periódicamente
- ✅ Usa diferentes credenciales para staging y producción

---

## 🆘 Problemas Comunes

### Error: "Permission denied (publickey)"
- **Causa**: La llave SSH no está configurada correctamente
- **Solución**:
  1. Verifica que SERVER_SSH_KEY contiene la llave privada completa
  2. Verifica que la llave pública está en `~/.ssh/authorized_keys` del servidor

### Error: "La variable X no está definida"
- **Causa**: Falta configurar un secret
- **Solución**: Agrega el secret en GitHub Settings

### Deployment falla pero no hay errores claros
- **Causa**: Problemas de red o permisos
- **Solución**:
  1. Verifica que SERVER_HOST es accesible
  2. Verifica que el usuario tiene permisos para ejecutar Docker
  3. Revisa los logs completos en GitHub Actions
