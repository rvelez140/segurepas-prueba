# Resumen: Gestión Segura de Credenciales de Base de Datos

## 🎯 Respuesta Rápida

**Pregunta**: ¿Cuáles son las credenciales de la base de datos?

**Respuesta**: Las credenciales están configuradas mediante variables de entorno y NUNCA deben estar en Git.

---

## 📍 Dónde están las credenciales

### Desarrollo Local
Archivo: `apps/api/.env.example` (son valores de ejemplo, NO usar en producción)

```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=password  # ⚠️ Solo para desarrollo
MONGO_DB_NAME=securepass
MONGODB_PORT=27017
```

### Producción
**Opción 1 - Archivo en el servidor** (Recomendado):
- Ubicación: `/opt/securepass/.env.production`
- Permisos: `600` (solo propietario puede leer/escribir)
- Generadas con scripts seguros

**Opción 2 - GitHub Secrets** (para CI/CD):
- Configuradas en: `Settings → Secrets and variables → Actions`
- Usadas por GitHub Actions para deployment automático

**Opción 3 - Variables de entorno del sistema**:
- Configuradas directamente en el servidor
- Sin archivos `.env`

---

## 🔐 Cómo Configurar Credenciales SEGURAS

### Paso 1: Generar Credenciales

```bash
# Ejecuta este script para generar credenciales aleatorias seguras
./scripts/generate-credentials.sh
```

Esto genera:
- Contraseña MongoDB: 32 caracteres aleatorios
- JWT Secret: 64 caracteres aleatorios
- Otros secrets necesarios

### Paso 2: Configurar el Servidor

**Opción A - Automático (script interactivo):**
```bash
# En el servidor de producción
sudo ./scripts/setup-production-server.sh
```

**Opción B - Manual:**
```bash
# En el servidor, crea el archivo
nano /opt/securepass/.env.production

# Pega las credenciales generadas en el paso 1
# Guarda y protege el archivo
chmod 600 .env.production
```

### Paso 3: Configurar GitHub Secrets

Usa la plantilla: `scripts/github-secrets-template.md`

Agrega en GitHub (`Settings → Secrets → Actions`):
- `MONGO_ROOT_USER`
- `MONGO_ROOT_PASSWORD`
- `JWT_SECRET`
- Y todos los demás listados en la plantilla

---

## ⚠️ REGLAS DE ORO

1. ✅ **SIEMPRE** usar variables de entorno
2. ✅ **SIEMPRE** generar contraseñas aleatorias para producción
3. ❌ **NUNCA** subir archivos `.env` a Git
4. ❌ **NUNCA** hacer commit de credenciales
5. ❌ **NUNCA** compartir credenciales por email/chat

---

## 🔍 Verificación de Seguridad

### Verificar que .env está protegido:

```bash
# Debe estar en .gitignore
grep "\.env" .gitignore
# ✅ Debería mostrar varias líneas con .env

# No debe estar en Git
git status
# ❌ .env NO debe aparecer en "Changes to be committed"
```

### Verificar permisos en el servidor:

```bash
ls -la /opt/securepass/.env.production
# Debe mostrar: -rw------- (600)
```

---

## 📚 Documentación Completa

Para información detallada, consulta:

1. **Guía completa de producción**: `docs/PRODUCCION-SETUP.md`
   - Todas las opciones de configuración
   - Instrucciones paso a paso
   - Troubleshooting

2. **Scripts de ayuda**: `scripts/README.md`
   - Cómo usar cada script
   - Flujo de trabajo recomendado
   - Problemas comunes

3. **Plantilla de GitHub Secrets**: `scripts/github-secrets-template.md`
   - Todos los secrets necesarios
   - Cómo obtener cada valor
   - Checklist de configuración

---

## 🚀 Quick Start

Para configurar producción AHORA mismo:

```bash
# 1. Genera credenciales
./scripts/generate-credentials.sh > .credentials.txt
chmod 600 .credentials.txt

# 2. Copia el script al servidor
scp scripts/setup-production-server.sh usuario@servidor:~/

# 3. Ejecuta en el servidor
ssh usuario@servidor
sudo ./setup-production-server.sh

# 4. Configura GitHub Secrets (ver plantilla)
# Settings → Secrets and variables → Actions

# 5. Push para deployment
git push origin main
```

---

## 🛡️ Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────┐
│          GitHub Repository (Código)              │
│  ✅ .env.example (valores de ejemplo)            │
│  ❌ .env (ignorado por Git)                      │
└─────────────────┬───────────────────────────────┘
                  │
                  │ GitHub Actions (CI/CD)
                  │ Usa GitHub Secrets
                  ↓
┌─────────────────────────────────────────────────┐
│         Servidor de Producción                   │
│  📁 /opt/securepass/                             │
│    ├── .env.production (permisos 600)            │
│    ├── docker-compose.production.yml             │
│    └── contenedores Docker                       │
│         └── MongoDB (solo accesible localmente)  │
└─────────────────────────────────────────────────┘
```

**Flujo seguro:**
1. Código en GitHub → Sin credenciales
2. GitHub Secrets → Para CI/CD automático
3. Archivo .env en servidor → Para la aplicación
4. MongoDB → Solo accesible desde localhost en el servidor

---

## 📞 ¿Necesitas Ayuda?

1. **Para desarrollo local**: Copia `.env.example` a `.env` y ajusta valores
2. **Para producción**: Sigue `docs/PRODUCCION-SETUP.md`
3. **Para CI/CD**: Usa `scripts/github-secrets-template.md`
4. **Problemas**: Revisa logs con `docker-compose logs`

---

**Última actualización**: 2025-12-21
**Versión**: 1.0
