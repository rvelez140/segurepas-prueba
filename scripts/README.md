# Scripts de Ayuda para Producción

Este directorio contiene scripts útiles para configurar y desplegar SecurePass en producción de forma segura.

## 📋 Scripts Disponibles

### 1. `generate-credentials.sh`

Genera credenciales aleatorias seguras para usar en producción.

**Uso:**
```bash
./scripts/generate-credentials.sh
```

**Lo que hace:**
- Genera contraseña segura para MongoDB (32 caracteres)
- Genera JWT secret (64 caracteres)
- Genera secrets para webhooks y API keys
- Muestra advertencias de seguridad

**Ejemplo de salida:**
```
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=Xy7kL9mN2pQ4rS6tU8vW1xY3zA5bC7dE
JWT_SECRET=aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR
```

**Guardar en archivo:**
```bash
./scripts/generate-credentials.sh > .credentials.txt
chmod 600 .credentials.txt
# ⚠️ NO subas este archivo a Git
```

---

### 2. `setup-production-server.sh`

Script interactivo para configurar el servidor de producción completo.

**Uso:**
```bash
# En el servidor de producción
sudo ./scripts/setup-production-server.sh
```

**Lo que hace:**
1. Verifica dependencias (Docker, Docker Compose)
2. Crea estructura de directorios en `/opt/securepass`
3. Solicita credenciales de forma interactiva
4. Genera archivo `.env.production` con permisos seguros (600)
5. Configura firewall (UFW) - puertos 22, 80, 443
6. Muestra instrucciones para los siguientes pasos

**Requisitos:**
- Ubuntu/Debian con Docker instalado
- Permisos de root (ejecutar con `sudo`)
- OpenSSL instalado

---

### 3. `github-secrets-template.md`

Plantilla para configurar GitHub Secrets necesarios para CI/CD.

**Uso:**
1. Abre el archivo `github-secrets-template.md`
2. Completa cada valor marcado con `_______________`
3. Ve a tu repositorio en GitHub: `Settings → Secrets and variables → Actions`
4. Agrega cada secret uno por uno

**Secrets principales:**
- `SERVER_HOST` - IP del servidor
- `SERVER_USER` - Usuario SSH
- `SERVER_SSH_KEY` - Llave privada SSH
- `MONGO_ROOT_PASSWORD` - Contraseña de MongoDB
- `JWT_SECRET` - Secret para JWT

---

## 🚀 Flujo de Trabajo Recomendado

### Para configurar un nuevo servidor de producción:

1. **Genera credenciales seguras:**
   ```bash
   ./scripts/generate-credentials.sh > .credentials.txt
   chmod 600 .credentials.txt
   ```

2. **Copia el script al servidor:**
   ```bash
   scp scripts/setup-production-server.sh usuario@servidor:~/
   ```

3. **Ejecuta el script en el servidor:**
   ```bash
   ssh usuario@servidor
   sudo ./setup-production-server.sh
   ```

4. **Copia archivos necesarios al servidor:**
   ```bash
   # Desde tu máquina local
   scp docker-compose.production.yml usuario@servidor:/opt/securepass/
   scp -r nginx usuario@servidor:/opt/securepass/
   ```

5. **Configura GitHub Secrets:**
   - Usa `github-secrets-template.md` como guía
   - Agrega todos los secrets en GitHub

6. **Configura SSL con Let's Encrypt:**
   ```bash
   # En el servidor
   sudo certbot --nginx -d tudominio.com -d api.tudominio.com
   ```

7. **Haz push a main para activar deployment:**
   ```bash
   git push origin main
   ```

---

## 🔐 Mejores Prácticas de Seguridad

### ✅ HACER:
- Usar el script `generate-credentials.sh` para generar contraseñas
- Guardar credenciales en un gestor de contraseñas
- Usar permisos 600 para archivos `.env`
- Configurar GitHub Secrets para CI/CD
- Usar contraseñas diferentes para staging y producción
- Rotar credenciales periódicamente

### ❌ NO HACER:
- Subir archivos `.env` a Git
- Compartir credenciales por email o chat
- Usar contraseñas débiles o predecibles
- Reutilizar contraseñas entre servicios
- Hardcodear credenciales en el código

---

## 🛠️ Requisitos

### En tu máquina local:
- Bash
- OpenSSL
- Git
- SSH client

### En el servidor de producción:
- Ubuntu/Debian Linux
- Docker y Docker Compose
- OpenSSL
- UFW (firewall)
- Certbot (para SSL)

---

## 📚 Documentación Relacionada

- **Guía completa de producción**: `docs/PRODUCCION-SETUP.md`
- **Configuración de Docker**: `docker-compose.production.yml`
- **Workflow de CI/CD**: `.github/workflows/deploy.yml`

---

## 🆘 Problemas Comunes

### Script falla con "openssl: command not found"
```bash
# Ubuntu/Debian
sudo apt-get install openssl

# macOS
brew install openssl
```

### Error "Permission denied"
```bash
# Dale permisos de ejecución
chmod +x scripts/*.sh
```

### El servidor no acepta la conexión SSH
```bash
# Verifica la llave SSH
ssh-keygen -y -f ~/.ssh/id_rsa

# Agrega la llave pública al servidor
ssh-copy-id usuario@servidor
```

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa `docs/PRODUCCION-SETUP.md`
2. Verifica los logs: `docker-compose logs`
3. Revisa el estado: `docker-compose ps`
4. Abre un issue en GitHub

---

**Última actualización**: 2025-12-21
