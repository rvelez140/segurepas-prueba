# Sistema de Gestión de Roles y Permisos - SecurePass

## 📋 Descripción

Este documento describe el sistema completo de gestión de roles y permisos implementado en SecurePass, que permite crear roles personalizados, asignar permisos granulares y gestionar el acceso de usuarios al sistema.

## 🎯 Características Principales

- ✅ **Roles Personalizables**: Crea, edita y elimina roles según las necesidades de tu organización
- ✅ **Permisos Granulares**: Control fino sobre qué acciones puede realizar cada rol
- ✅ **Roles del Sistema**: 4 roles predefinidos (Admin, Técnico, Residente, Guardia)
- ✅ **Asignación Dinámica**: Asigna roles a usuarios de forma fácil y rápida
- ✅ **Interfaz Intuitiva**: Panel de administración completo con UI moderna
- ✅ **Compatibilidad**: Mantiene compatibilidad con el sistema de roles anterior

---

## 🏗️ Arquitectura del Sistema

### Backend (API)

#### Modelos de Datos

**Permission (Permiso)**
```typescript
{
  resource: PermissionResource,  // Recurso (users, roles, visits, etc.)
  action: PermissionAction,      // Acción (create, read, update, delete, manage)
  description: string,           // Descripción del permiso
  isSystem: boolean             // Si es un permiso del sistema
}
```

**Role (Rol)**
```typescript
{
  name: string,                 // Nombre del rol
  slug: string,                 // Identificador único
  description: string,          // Descripción del rol
  permissions: ObjectId[],      // Permisos asignados
  isSystem: boolean,           // Si es un rol del sistema
  isActive: boolean,           // Si está activo
  color: string                // Color para la UI (#hexadecimal)
}
```

**User (Actualizado)**
```typescript
{
  // Campos existentes...
  role: string,                 // Rol legacy (residente, guardia, admin)
  roleId: ObjectId,            // Referencia al nuevo sistema de roles
  // ...
}
```

#### Servicios

**PermissionService**
- `findAll()`: Obtiene todos los permisos
- `findById(id)`: Obtiene un permiso por ID
- `findByResource(resource)`: Obtiene permisos por recurso
- `create()`: Crea un nuevo permiso
- `update()`: Actualiza un permiso
- `delete()`: Elimina un permiso
- `initializeSystemPermissions()`: Inicializa permisos del sistema

**RoleService**
- `findAll(includeInactive)`: Obtiene todos los roles
- `findById(id)`: Obtiene un rol por ID
- `findBySlug(slug)`: Obtiene un rol por slug
- `create(data)`: Crea un nuevo rol
- `update(id, data)`: Actualiza un rol
- `delete(id)`: Elimina un rol
- `hasPermission(roleId, resource, action)`: Verifica si un rol tiene un permiso
- `initializeSystemRoles()`: Inicializa roles del sistema

**UserService (Actualizado)**
- `assignRole(userId, roleId)`: Asigna un rol a un usuario
- `getAllUsersWithRoles()`: Obtiene usuarios con roles poblados
- `findByIdWithRole(id)`: Obtiene usuario con rol poblado

#### API Endpoints

**Roles**
```
GET    /api/roles              - Obtiene todos los roles
GET    /api/roles/:id          - Obtiene un rol por ID
POST   /api/roles              - Crea un nuevo rol (admin)
PUT    /api/roles/:id          - Actualiza un rol (admin)
DELETE /api/roles/:id          - Elimina un rol (admin)
```

**Permisos**
```
GET    /api/permissions        - Obtiene todos los permisos
```

**Sistema**
```
POST   /api/initialize         - Inicializa roles y permisos (admin)
```

**Usuarios**
```
GET    /api/users-with-roles           - Obtiene usuarios con roles
PUT    /api/users/:id/assign-role      - Asigna rol a usuario (admin)
```

#### Middlewares

**permissionMiddleware(resource, action)**
- Verifica si un usuario tiene un permiso específico
- Soporta tanto roles nuevos (roleId) como legacy (role)

**anyPermissionMiddleware(permissions[])**
- Verifica si un usuario tiene al menos uno de varios permisos

---

### Frontend (React)

#### Componentes

**RoleManagement**
- Componente principal de gestión de roles
- Pestañas para Roles y Asignación de Usuarios

**RoleList**
- Muestra todos los roles en tarjetas
- Acciones: Crear, Editar, Eliminar
- Indicadores visuales para roles del sistema

**RoleForm**
- Formulario para crear/editar roles
- Selector de permisos por recurso
- Selector de color para el rol
- Validaciones y manejo de errores

**UserRoleAssignment**
- Tabla de usuarios con asignación de roles
- Selector de rol por usuario
- Vista del rol actual

**RoleManagementPage**
- Página completa con Header y Sidebar
- Protegida para solo admin

#### API Client

**role.api.ts**
- `getAllRoles(includeInactive)`: Obtiene roles
- `getRoleById(id)`: Obtiene rol por ID
- `createRole(data)`: Crea rol
- `updateRole(id, data)`: Actualiza rol
- `deleteRole(id)`: Elimina rol
- `getAllPermissions()`: Obtiene permisos
- `assignRoleToUser(userId, roleId)`: Asigna rol a usuario
- `getUsersWithRoles()`: Obtiene usuarios con roles
- `initializeSystem()`: Inicializa sistema

#### Tipos TypeScript

**role.types.ts**
- Enums: `PermissionResource`, `PermissionAction`
- Interfaces: `Permission`, `Role`, `CreateRoleDTO`, `UpdateRoleDTO`
- Labels en español para UI

---

## 🚀 Roles Predefinidos

### 1. Administrador (admin)
- **Color**: Rojo (#DC2626)
- **Permisos**: Acceso completo a todo el sistema
- **No editable**: El rol admin no puede ser editado ni eliminado
- **Características**:
  - Gestión completa de usuarios
  - Gestión completa de roles
  - Gestión completa de visitas
  - Generación de reportes
  - Configuración del sistema

### 2. Técnico (tecnico)
- **Color**: Azul (#2563EB)
- **Permisos**:
  - Crear, leer y actualizar usuarios
  - Gestión completa de visitas
  - Leer y actualizar autorizaciones
  - Leer y generar reportes
  - Ver dashboard
  - Leer configuración
  - Leer roles
- **Características**:
  - No puede gestionar roles
  - No puede eliminar usuarios
  - Acceso a reportes

### 3. Residente (residente)
- **Color**: Verde (#059669)
- **Permisos**:
  - Crear, leer y actualizar autorizaciones
  - Ver visitas
  - Ver dashboard
  - Leer configuración
- **Características**:
  - Solo gestiona sus propias autorizaciones
  - No puede ver otros usuarios
  - No puede generar reportes

### 4. Guardia (guardia)
- **Color**: Púrpura (#7C3AED)
- **Permisos**:
  - Leer y actualizar visitas
  - Leer autorizaciones
  - Leer usuarios
  - Ver dashboard
- **Características**:
  - Valida visitas con QR
  - Registra entradas/salidas
  - No puede crear autorizaciones

---

## 📦 Recursos y Acciones Disponibles

### Recursos (PermissionResource)
1. **users** - Usuarios
2. **roles** - Roles
3. **visits** - Visitas
4. **reports** - Reportes
5. **settings** - Configuración
6. **authorizations** - Autorizaciones
7. **dashboard** - Dashboard

### Acciones (PermissionAction)
1. **create** - Crear
2. **read** - Ver/Leer
3. **update** - Actualizar
4. **delete** - Eliminar
5. **manage** - Gestión completa (incluye todas las acciones anteriores)
6. **execute** - Ejecutar (para acciones especiales como generar reportes)

---

## 🔧 Instalación y Configuración

### 1. Ejecutar Migraciones de Base de Datos

El sistema necesita inicializar los permisos y roles en la base de datos.

#### Opción A: Usando el script de seed
```bash
cd apps/api
npx ts-node src/scripts/seedRoles.ts
```

#### Opción B: Usando el endpoint de API
```bash
curl -X POST http://localhost:8000/api/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Verificar la Instalación

Después de ejecutar el seed, deberías tener:
- ✅ 35+ permisos del sistema
- ✅ 4 roles predefinidos (Admin, Técnico, Residente, Guardia)

---

## 💻 Uso del Sistema

### Para Administradores

#### 1. Acceder al Panel de Roles
- Navega a `/admin/roles` en la aplicación web
- O haz clic en "Roles" en el sidebar (solo visible para admin)

#### 2. Crear un Nuevo Rol
1. Haz clic en "Crear Rol"
2. Completa el formulario:
   - **Nombre**: Ej. "Supervisor", "Conserje"
   - **Descripción**: Describe las responsabilidades
   - **Color**: Elige un color para identificar el rol
   - **Permisos**: Selecciona los permisos necesarios
3. Haz clic en "Guardar Rol"

#### 3. Editar un Rol Existente
1. Haz clic en "Editar" en la tarjeta del rol
2. Modifica los campos necesarios
3. Guarda los cambios

**Nota**: Los roles del sistema solo permiten editar descripción y estado activo.

#### 4. Asignar Roles a Usuarios
1. Ve a la pestaña "Asignar Roles a Usuarios"
2. Selecciona el rol deseado en el dropdown
3. Haz clic en "Asignar"

#### 5. Eliminar un Rol
1. Haz clic en "Eliminar" en la tarjeta del rol
2. Confirma la acción

**Nota**: No se pueden eliminar roles del sistema.

---

## 🔐 Seguridad

### Protección de Rutas
- Todas las rutas de roles requieren autenticación
- Solo usuarios con rol `admin` pueden gestionar roles
- Los roles del sistema no pueden ser eliminados
- Validación de permisos en cada endpoint

### Middlewares de Seguridad
```typescript
// Ejemplo de uso
router.post('/roles',
  authMiddleware,                    // Requiere autenticación
  roleMiddleware(['admin']),         // Requiere rol admin
  createRole
);

// Middleware de permisos granulares
router.get('/visits',
  authMiddleware,
  permissionMiddleware(PermissionResource.VISITS, PermissionAction.READ),
  getVisits
);
```

---

## 🎨 Personalización

### Agregar Nuevos Recursos

1. **Backend**: Actualiza el enum en `IPermission.ts`
```typescript
export enum PermissionResource {
  // ... recursos existentes
  NEW_RESOURCE = 'new_resource'
}
```

2. **Frontend**: Actualiza el enum y labels en `role.types.ts`
```typescript
export const RESOURCE_LABELS: Record<PermissionResource, string> = {
  // ... labels existentes
  [PermissionResource.NEW_RESOURCE]: 'Nuevo Recurso'
};
```

3. **Permisos**: Crea los permisos en `PermissionService.ts`
```typescript
{ resource: PermissionResource.NEW_RESOURCE, action: PermissionAction.READ, description: 'Ver nuevo recurso' }
```

### Agregar Nuevas Acciones

Similar al proceso anterior, actualiza los enums y crea los permisos correspondientes.

---

## 🐛 Troubleshooting

### Los roles no aparecen en la base de datos
**Solución**: Ejecuta el script de seed o el endpoint de inicialización.

### Error "No tienes permisos suficientes"
**Solución**: Verifica que tu usuario tenga el rol con los permisos necesarios.

### Los usuarios no pueden asignar roles
**Solución**: Solo usuarios con rol `admin` pueden asignar roles.

### Error al crear rol personalizado
**Solución**: Verifica que el nombre no esté duplicado y que hayas seleccionado al menos un permiso.

---

## 📝 Notas Adicionales

### Compatibilidad con Roles Legacy

El sistema mantiene compatibilidad con el sistema anterior:
- Los usuarios pueden tener tanto `role` (legacy) como `roleId` (nuevo sistema)
- Si un usuario tiene `roleId`, se usa el nuevo sistema
- Si solo tiene `role`, se usa el mapeo legacy en el middleware de permisos

### Migración de Usuarios Existentes

Para migrar usuarios del sistema antiguo al nuevo:

1. **Crea los roles correspondientes** (si no existen)
2. **Asigna roles a usuarios** usando la interfaz o API:
```typescript
await assignRoleToUser(userId, roleId);
```

### Performance

- Los permisos se cachean en memoria durante la validación
- Se recomienda usar populate solo cuando sea necesario
- Los índices en MongoDB optimizan las búsquedas

---

## 🔄 Flujo de Validación de Permisos

```
1. Usuario hace request a un endpoint protegido
   ↓
2. authMiddleware valida el token JWT
   ↓
3. permissionMiddleware verifica:
   - ¿Tiene roleId?
     → Sí: Verifica permisos del nuevo sistema
     → No: Usa mapeo legacy basado en role
   ↓
4. Si tiene el permiso requerido:
   → Continúa al controlador
   Sino:
   → Retorna 403 Forbidden
```

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Crear un rol de "Supervisor"

```typescript
const supervisorRole = {
  name: "Supervisor",
  description: "Supervisa guardias y revisa reportes",
  permissions: [
    // IDs de permisos para:
    // - Leer usuarios
    // - Leer visitas
    // - Actualizar visitas
    // - Leer reportes
    // - Generar reportes
  ],
  color: "#F59E0B"
};

const createdRole = await createRole(supervisorRole);
```

### Ejemplo 2: Verificar permisos en código

```typescript
// En un controlador
export const deleteVisit = async (req: Request, res: Response) => {
  // El middleware ya validó que el usuario tiene permiso
  // Aquí va la lógica de eliminación
};

// Ruta protegida
router.delete('/visits/:id',
  authMiddleware,
  permissionMiddleware(PermissionResource.VISITS, PermissionAction.DELETE),
  deleteVisit
);
```

---

## 🎯 Mejoras Futuras

- [ ] Auditoría de cambios en roles
- [ ] Historial de asignación de roles
- [ ] Roles temporales con expiración
- [ ] Permisos contextuales (ej: "solo sus propios datos")
- [ ] Importación/Exportación de roles
- [ ] Templates de roles predefinidos
- [ ] Notificaciones de cambios de rol

---

## 📞 Soporte

Para preguntas o problemas con el sistema de roles:
1. Revisa esta documentación
2. Verifica los logs del servidor
3. Consulta el código en `apps/api/src/services/RoleService.ts`
4. Contacta al equipo de desarrollo

---

## 📄 Licencia

Este sistema es parte de SecurePass y está sujeto a la misma licencia del proyecto principal.

---

**Última actualización**: 2025-11-16
**Versión**: 1.0.0
