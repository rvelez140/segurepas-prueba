# Guía de Construcción de Imágenes Docker

Esta guía explica cómo construir las imágenes Docker de SecurePass de forma automática.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Uso Rápido](#uso-rápido)
- [Script de Construcción](#script-de-construcción)
- [Uso con Makefile](#uso-con-makefile)
- [Ejemplos Comunes](#ejemplos-comunes)
- [Solución de Problemas](#solución-de-problemas)

## ⚙️ Requisitos Previos

- Docker instalado y en ejecución
- Permisos para ejecutar comandos Docker
- (Opcional) Autenticación con GitHub Container Registry para push

## 🚀 Uso Rápido

### Opción 1: Usando el script directamente

```bash
# Construcción local básica
./scripts/build-images.sh

# Con opciones específicas
./scripts/build-images.sh --production --tag v1.0.0
```

### Opción 2: Usando Makefile (recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Construir imágenes locales
make build

# Construir para producción
make build-prod
```

## 📝 Script de Construcción

### Ubicación
`scripts/build-images.sh`

### Opciones Disponibles

| Opción | Descripción |
|--------|-------------|
| `--local` | Construir imágenes locales (por defecto) |
| `--production` | Construir y etiquetar para producción (ghcr.io) |
| `--push` | Subir imágenes al registro (requiere --production) |
| `--no-cache` | Construir sin usar caché |
| `--tag VERSION` | Especificar tag de versión (por defecto: latest) |
| `--help` | Mostrar ayuda |

### Imágenes Generadas

#### Modo Local
- `securepass-api:latest` - API backend
- `securepass-web:latest` - Frontend web

#### Modo Producción
- `ghcr.io/USUARIO/REPOSITORIO/api:latest` - API backend
- `ghcr.io/USUARIO/REPOSITORIO/web:latest` - Frontend web

## 🛠️ Uso con Makefile

El Makefile proporciona comandos simplificados para trabajar con Docker.

### Comandos de Construcción

```bash
# Construcción básica local
make build

# Construcción para producción
make build-prod

# Construcción y push al registro
make build-push

# Construcción sin caché
make build-no-cache

# Construcción con tag específico
make build-tag TAG=v1.0.0
```

### Comandos Docker Compose

```bash
# Iniciar servicios localmente
make up

# Iniciar servicios en producción
make up-prod

# Detener servicios
make down

# Ver logs en tiempo real
make logs

# Ver estado de servicios
make ps

# Reiniciar servicios
make restart
```

### Comandos de Utilidades

```bash
# Listar imágenes de SecurePass
make images

# Limpiar imágenes no utilizadas
make clean

# Limpiar todo el sistema Docker
make clean-all

# Acceder a shell de contenedores
make shell-api
make shell-web
make shell-mongodb
```

### Flujos de Trabajo Rápidos

```bash
# Desarrollo rápido: build + up + logs
make dev

# Producción rápida: build-prod + up-prod + logs
make prod

# Reconstruir completamente (sin caché)
make rebuild
```

## 💡 Ejemplos Comunes

### 1. Desarrollo Local

```bash
# Opción A: Script directo
./scripts/build-images.sh
docker-compose -f docker-compose.local.yml up -d

# Opción B: Makefile (más fácil)
make dev
```

### 2. Preparar Release de Producción

```bash
# Opción A: Script directo
./scripts/build-images.sh --production --tag v1.2.0

# Opción B: Makefile
make build-tag TAG=v1.2.0
```

### 3. Desplegar a Producción

```bash
# 1. Construir imágenes con tag de versión
./scripts/build-images.sh --production --tag v1.2.0

# 2. Autenticarse con GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 3. Subir imágenes
./scripts/build-images.sh --production --tag v1.2.0 --push

# O todo en un comando con Makefile:
export GITHUB_TOKEN=tu_token
make build-push
```

### 4. Reconstruir Sin Caché

Útil cuando hay problemas con dependencias o cambios importantes:

```bash
# Opción A: Script directo
./scripts/build-images.sh --no-cache

# Opción B: Makefile
make build-no-cache
```

### 5. Construir y Probar Localmente

```bash
# 1. Construir imágenes
make build

# 2. Iniciar servicios
make up

# 3. Ver logs
make logs

# 4. Verificar que todo funciona
make ps
```

## 🔧 Solución de Problemas

### Error: "Docker no está corriendo"

```bash
# En Linux
sudo systemctl start docker

# En macOS/Windows
# Iniciar Docker Desktop desde la aplicación
```

### Error: "Permission denied"

```bash
# Dar permisos de ejecución al script
chmod +x scripts/build-images.sh

# Si hay problemas con Docker
sudo usermod -aG docker $USER
# Luego cerrar sesión y volver a iniciar
```

### Error al hacer push: "denied: permission denied"

```bash
# Autenticarse primero
echo $GITHUB_TOKEN | docker login ghcr.io -u TU_USUARIO --password-stdin

# Verificar que tienes permisos en el repositorio
```

### Construcción muy lenta

```bash
# Verificar si hay problemas de red
docker pull node:16-alpine

# Limpiar caché de Docker
docker system prune -a

# Construir sin caché si es necesario
make build-no-cache
```

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :8472

# Detener servicios existentes
make down

# O cambiar puertos en .env
```

### Error: "No space left on device"

```bash
# Limpiar imágenes y contenedores no utilizados
make clean

# O limpieza más agresiva (¡cuidado!)
docker system prune -a --volumes
```

## 📊 Variables de Entorno

El script respeta las siguientes variables de entorno:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `GITHUB_REPOSITORY` | Repositorio de GitHub | `rvelez140/segurepas-prueba` |
| `GITHUB_TOKEN` | Token para autenticación | - |
| `GITHUB_USER` | Usuario de GitHub | - |

### Configurar variables

```bash
# En tu shell
export GITHUB_REPOSITORY="usuario/repositorio"
export GITHUB_TOKEN="ghp_tu_token_aqui"

# O en archivo .env
echo 'GITHUB_REPOSITORY=usuario/repositorio' >> .env
```

## 🔍 Verificar Construcción

Después de construir, puedes verificar que las imágenes se crearon correctamente:

```bash
# Listar imágenes
make images

# O con Docker directamente
docker images | grep securepass

# Ver detalles de una imagen
docker inspect securepass-api:latest

# Probar una imagen
docker run --rm securepass-api:latest npm --version
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Guía de Despliegue](./DEPLOYMENT.md)

## 🆘 Obtener Ayuda

```bash
# Ver ayuda del script
./scripts/build-images.sh --help

# Ver comandos disponibles de Make
make help
```

---

**¿Necesitas más ayuda?** Abre un issue en el repositorio o consulta la documentación completa.
