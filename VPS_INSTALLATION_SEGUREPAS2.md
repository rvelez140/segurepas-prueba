# Guía de Instalación en VPS - Segurepas2

Esta guía te ayudará a instalar una segunda instancia de SecurePass en tu VPS en la ruta `/opt/segurepas2`.

## 📋 ¿Por qué usar esta instalación?

- Instalar una segunda instancia del proyecto en el mismo VPS
- Crear un ambiente de prueba separado
- Tener múltiples versiones funcionando simultáneamente
- Usar puertos diferentes para evitar conflictos

## 🚀 Instalación Rápida (Método Automático)

### Opción 1: Instalación directa con curl

```bash
curl -fsSL https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install-segurepas2.sh | sudo bash
```

### Opción 2: Instalación directa con wget

```bash
wget -O - https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install-segurepas2.sh | sudo bash
```

### Opción 3: Descarga y ejecución manual

```bash
# Descargar script
wget https://raw.githubusercontent.com/rvelez140/segurepas-prueba/main/scripts/vps-install-segurepas2.sh

# Hacer ejecutable
chmod +x vps-install-segurepas2.sh

# Ejecutar
sudo ./vps-install-segurepas2.sh
```

## 📝 ¿Qué hace el script de instalación?

El script `vps-install-segurepas2.sh` realiza las siguientes tareas automáticamente:

1. ✅ Actualiza el sistema operativo
2. ✅ Instala Git (si no está instalado)
3. ✅ Instala Docker y Docker Compose (si no están instalados)
4. ✅ Crea usuario de deployment (`segurepas2`)
5. ✅ Clona el repositorio en `/opt/segurepas2`
6. ✅ Configura el firewall (puertos 22, 80, 443, 8472, 8473)
7. ✅ Crea memoria swap de 2GB (si no existe)
8. ✅ Aplica optimizaciones del sistema
9. ✅ Crea archivo `.env` desde el template
10. ✅ Configura log rotation
11. ⚠️ Opcionalmente instala Certbot para SSL

## ⚙️ Diferencias con la instalación principal

| Configuración | Instalación Principal | Segurepas2 |
|---------------|----------------------|------------|
| **Usuario** | `securepass` | `segurepas2` |
| **Directorio** | `/opt/securepass` | `/opt/segurepas2` |
| **Puerto HTTP** | `8472` (default) | `8474` (recomendado) |
| **Puerto HTTPS** | `8473` (default) | `8475` (recomendado) |
| **Puerto MongoDB** | `37849` (default) | `37850` (recomendado) |
| **Puerto API** | `48721` (default) | `48722` (recomendado) |
| **Puerto Web** | `52341` (default) | `52342` (recomendado) |

## ⚙️ Configuración Post-Instalación

### 1. Configurar Variables de Entorno

Después de la instalación, edita el archivo `.env`:

```bash
sudo nano /opt/segurepas2/.env
```

Configura los siguientes valores importantes con **puertos diferentes**:

```bash
# Puertos personalizados para evitar conflictos
NGINX_HTTP_PORT=8474
NGINX_HTTPS_PORT=8475
MONGODB_PORT=37850
API_PORT=48722
WEB_PORT=52342

# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=tu_contraseña_segura_diferente_aqui
MONGO_DB_NAME=segurepas2

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria_diferente
JWT_EXPIRES_IN=7d

# Dominios (diferentes a la instalación principal)
FRONTEND_URL=https://segurepas2.tudominio.com
REACT_APP_API=https://api-segurepas2.tudominio.com/api

# Cloudinary (puede ser el mismo o diferente)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# GitHub Repository
GITHUB_REPOSITORY=rvelez140/segurepas-prueba
```

### 2. Configurar SSL/HTTPS con Certbot (Opcional)

Si instalaste Certbot durante la instalación:

```bash
# Obtener certificado SSL para los subdominios de segurepas2
sudo certbot certonly --standalone -d segurepas2.tudominio.com -d api-segurepas2.tudominio.com

# Copiar certificados al proyecto
sudo mkdir -p /opt/segurepas2/nginx/ssl
sudo cp /etc/letsencrypt/live/segurepas2.tudominio.com/fullchain.pem /opt/segurepas2/nginx/ssl/
sudo cp /etc/letsencrypt/live/segurepas2.tudominio.com/privkey.pem /opt/segurepas2/nginx/ssl/
sudo chown -R segurepas2:segurepas2 /opt/segurepas2/nginx/ssl
```

### 3. Actualizar configuración de Nginx

Edita el archivo de configuración de Nginx para usar tus subdominios:

```bash
sudo nano /opt/segurepas2/nginx/nginx.conf
```

Reemplaza los dominios con tus subdominios para segurepas2.

### 4. Construir las Imágenes Docker

```bash
cd /opt/segurepas2

# Construir imagen de la API
sudo docker build -t segurepas2-api:latest ./apps/api

# Construir imagen de la Web
sudo docker build -t segurepas2-web:latest ./apps/web
```

### 5. Actualizar docker-compose para usar imágenes locales

Edita el archivo `docker-compose.production.yml`:

```bash
sudo nano /opt/segurepas2/docker-compose.production.yml
```

Cambia las líneas de imagen:

```yaml
# En la sección api:
image: segurepas2-api:latest  # En lugar de ghcr.io/${GITHUB_REPOSITORY}/api:latest

# En la sección web:
image: segurepas2-web:latest  # En lugar de ghcr.io/${GITHUB_REPOSITORY}/web:latest
```

### 6. Iniciar la Aplicación

```bash
cd /opt/segurepas2
sudo docker-compose -f docker-compose.production.yml up -d
```

### 7. Verificar Estado

```bash
# Ver estado de contenedores
sudo docker-compose -f docker-compose.production.yml ps

# Ver logs
sudo docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
sudo docker-compose -f docker-compose.production.yml logs -f api
sudo docker-compose -f docker-compose.production.yml logs -f web
```

## 🛠️ Comandos Útiles

### Gestión de Docker

```bash
# Iniciar servicios
sudo docker-compose -f docker-compose.production.yml up -d

# Detener servicios
sudo docker-compose -f docker-compose.production.yml down

# Reiniciar servicios
sudo docker-compose -f docker-compose.production.yml restart

# Ver logs en tiempo real
sudo docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
sudo docker-compose -f docker-compose.production.yml logs -f api

# Ejecutar comando en contenedor
sudo docker-compose -f docker-compose.production.yml exec api sh

# Reconstruir imágenes
sudo docker-compose -f docker-compose.production.yml build

# Limpiar imágenes no usadas
sudo docker system prune -a
```

### Actualizar Aplicación

```bash
cd /opt/segurepas2

# Obtener últimos cambios
sudo git pull origin main

# Reconstruir imágenes
sudo docker build -t segurepas2-api:latest ./apps/api
sudo docker build -t segurepas2-web:latest ./apps/web

# Reiniciar servicios
sudo docker-compose -f docker-compose.production.yml down
sudo docker-compose -f docker-compose.production.yml up -d
```

## 🔒 Configuración de Firewall

El script configura automáticamente los puertos adicionales:

```bash
# Ver reglas del firewall
sudo ufw status

# Si necesitas abrir puertos personalizados
sudo ufw allow 8474/tcp  # HTTP personalizado
sudo ufw allow 8475/tcp  # HTTPS personalizado
```

## 🔄 Gestionar ambas instalaciones simultáneamente

### Instalación Principal (securepass)

```bash
cd /opt/securepass
sudo docker-compose -f docker-compose.production.yml ps
```

### Instalación Segurepas2

```bash
cd /opt/segurepas2
sudo docker-compose -f docker-compose.production.yml ps
```

## 🐛 Solución de Problemas

### Conflicto de puertos

Si tienes conflictos de puertos, verifica qué está usando cada puerto:

```bash
# Ver qué está usando un puerto
sudo lsof -i :8472
sudo lsof -i :8473
sudo lsof -i :8474
sudo lsof -i :8475

# Ver todos los puertos en uso
sudo netstat -tulpn | grep LISTEN
```

### Contenedores no inician

```bash
# Ver logs detallados
cd /opt/segurepas2
sudo docker-compose -f docker-compose.production.yml logs

# Verificar recursos del sistema
free -h
df -h
```

### Error de permisos

```bash
# Asegúrate que el usuario tenga permisos correctos
sudo chown -R segurepas2:segurepas2 /opt/segurepas2
```

## 📊 Acceso a las aplicaciones

Después de la instalación, tus aplicaciones estarán disponibles en:

- **Web Principal**: http://tu-vps-ip:8472 (o https://tudominio.com:8473)
- **Web Segurepas2**: http://tu-vps-ip:8474 (o https://segurepas2.tudominio.com:8475)

## 📚 Recursos Adicionales

- [Documentación del Proyecto Principal](./README.md)
- [Guía de Instalación VPS Principal](./VPS_INSTALLATION.md)
- [Documentación de Docker](https://docs.docker.com/)

## 🆘 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los logs: `sudo docker-compose logs -f`
2. Verifica la configuración del `.env`
3. Asegúrate que todos los puertos estén disponibles y no conflictúen
4. Verifica que los certificados SSL estén correctamente configurados
5. Consulta la documentación completa

## 📝 Licencia

Este proyecto está bajo la licencia especificada en [LICENSE.txt](./LICENSE.txt)
