# SecurePass - Credenciales de Fabrica

## Informacion de Acceso Inicial

Este documento contiene las credenciales de fabrica para el acceso inicial al sistema SecurePass.

---

## CREDENCIALES DE USUARIO ADMINISTRADOR

```
╔══════════════════════════════════════════════════════════════╗
║                CREDENCIALES DE ACCESO                        ║
╠══════════════════════════════════════════════════════════════╣
║  Email:     factory@securepass.local                         ║
║  Usuario:   factory_admin                                    ║
║  Password:  Factory@SecureP@ss2024!                          ║
╚══════════════════════════════════════════════════════════════╝
```

### Metodos de Login

Puede iniciar sesion usando cualquiera de estas opciones:

1. **Por Email**: `factory@securepass.local`
2. **Por Usuario**: `factory_admin`

---

## CREDENCIALES DE BASE DE DATOS

```
╔══════════════════════════════════════════════════════════════╗
║             MONGODB - ACCESO ADMINISTRATIVO                  ║
╠══════════════════════════════════════════════════════════════╣
║  Usuario:   securepass_admin                                 ║
║  Password:  SecureP@ss2024!Factory#DB                        ║
║  Database:  securepass                                       ║
║  Puerto:    37849                                            ║
╚══════════════════════════════════════════════════════════════╝
```

### Cadena de Conexion

```
mongodb://securepass_admin:SecureP@ss2024!Factory#DB@localhost:37849/securepass?authSource=admin
```

---

## INSTRUCCIONES DE USO

### 1. Iniciar el Sistema con Docker

```bash
# Copiar archivo de configuracion de fabrica
cp .env.factory .env

# Construir e iniciar los contenedores
docker-compose up -d --build

# Verificar estado de los servicios
docker-compose ps

# Ver logs de la API
docker-compose logs -f api
```

### 2. Acceder a la Aplicacion

- **Web Application**: http://localhost:52341
- **API Endpoint**: http://localhost:48721
- **Nginx Proxy HTTP**: http://localhost:8472
- **Nginx Proxy HTTPS**: https://localhost:8473

### 3. Primer Login

1. Acceda a http://localhost:52341
2. Ingrese las credenciales:
   - Usuario: `factory_admin` (o email: `factory@securepass.local`)
   - Password: `Factory@SecureP@ss2024!`
3. Cambie las credenciales inmediatamente despues del primer acceso

---

## ADVERTENCIA DE SEGURIDAD ISO 27001

```
╔══════════════════════════════════════════════════════════════╗
║  ⚠️  IMPORTANTE - CUMPLIMIENTO ISO 27001                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Las credenciales de fabrica DEBEN ser cambiadas             ║
║  inmediatamente despues del primer acceso.                   ║
║                                                              ║
║  Controles aplicables:                                       ║
║  - A.9.2.1: Registro de usuario                              ║
║  - A.9.4.3: Sistema de gestion de contrasenas                ║
║  - A.9.2.3: Gestion de derechos de acceso privilegiados      ║
║                                                              ║
║  Requisitos de nueva contrasena:                             ║
║  - Minimo 12 caracteres                                      ║
║  - Al menos una letra mayuscula                              ║
║  - Al menos una letra minuscula                              ║
║  - Al menos un numero                                        ║
║  - Al menos un simbolo especial (!@#$%^&*)                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## CAMBIAR CREDENCIALES

### Opcion 1: Desde la Interfaz Web

1. Inicie sesion con las credenciales de fabrica
2. Vaya a Configuracion > Mi Perfil
3. Cambie la contrasena y actualice el email

### Opcion 2: Variables de Entorno

Edite el archivo `.env` antes de iniciar:

```env
# Usuario Administrador Personalizado
ADMIN_EMAIL=su-email@empresa.com
ADMIN_USERNAME=su_usuario
ADMIN_PASSWORD=SuContrasenaSegura123!
ADMIN_NAME=Su Nombre

# Base de Datos Personalizada
MONGO_ROOT_USER=su_usuario_db
MONGO_ROOT_PASSWORD=SuContrasenaDB123!
```

Luego reinicie los contenedores:

```bash
docker-compose down -v  # Elimina volumenes (base de datos)
docker-compose up -d --build
```

---

## VERIFICACION DE SERVICIOS

### Health Check de la API

```bash
curl http://localhost:48721/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "api": "running",
    "mongodb": "connected"
  }
}
```

### Estado de los Contenedores

```bash
docker-compose ps
```

Todos los servicios deben mostrar estado "Up" y "healthy".

---

## SOPORTE

Si tiene problemas para acceder al sistema:

1. Verifique que todos los contenedores esten en ejecucion
2. Revise los logs: `docker-compose logs -f`
3. Asegurese de usar las credenciales correctas
4. Verifique que los puertos no esten en uso por otras aplicaciones

---

## RESUMEN DE PUERTOS

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| Web      | 52341  | Aplicacion React |
| API      | 48721  | Backend Node.js |
| MongoDB  | 37849  | Base de datos |
| Nginx HTTP | 8472 | Proxy HTTP |
| Nginx HTTPS | 8473 | Proxy HTTPS |

---

*Documento generado automaticamente por SecurePass*
*ISO 27001 Compliant - Control A.9.4.3*
