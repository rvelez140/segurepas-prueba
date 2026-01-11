/**
 * SecurePass - Script de Inicialización de MongoDB
 * ================================================
 * ISO 27001 - A.9.2.1: Registro y cancelación del registro de usuario
 * ISO 27001 - A.9.2.3: Gestión de derechos de acceso privilegiados
 *
 * Este script se ejecuta automáticamente al iniciar MongoDB por primera vez
 * y configura la base de datos con las mejores prácticas de seguridad.
 */

// Usar la base de datos de la aplicación
db = db.getSiblingDB('securepass');

// Crear índices optimizados para rendimiento y seguridad
print('=== SecurePass MongoDB Initialization ===');
print('Creando índices optimizados...');

// Índices para usuarios (autenticación rápida)
db.users.createIndex({ 'auth.email': 1 }, {
  unique: true,
  sparse: true,
  name: 'idx_users_email'
});

db.users.createIndex({ 'auth.username': 1 }, {
  unique: true,
  sparse: true,
  name: 'idx_users_username'
});

db.users.createIndex({ 'role': 1 }, {
  name: 'idx_users_role'
});

// Índices para auditoría (ISO 27001 - A.12.4.1)
db.auditlogs.createIndex({ 'timestamp': -1 }, {
  name: 'idx_audit_timestamp'
});

db.auditlogs.createIndex({ 'user': 1, 'timestamp': -1 }, {
  name: 'idx_audit_user_timestamp'
});

db.auditlogs.createIndex({ 'action': 1, 'timestamp': -1 }, {
  name: 'idx_audit_action_timestamp'
});

// TTL Index - Eliminar logs antiguos automáticamente (90 días)
// ISO 27001 - A.18.1.3: Protección de registros
db.auditlogs.createIndex({ 'timestamp': 1 }, {
  expireAfterSeconds: 7776000, // 90 días
  name: 'idx_audit_ttl'
});

// Índices para visitas
db.visits.createIndex({ 'qrId': 1 }, {
  unique: true,
  sparse: true,
  name: 'idx_visits_qrid'
});

db.visits.createIndex({ 'authorization.resident': 1 }, {
  name: 'idx_visits_resident'
});

db.visits.createIndex({ 'authorization.date': -1 }, {
  name: 'idx_visits_date'
});

db.visits.createIndex({ 'visit.document': 1 }, {
  name: 'idx_visits_document'
});

// Índices para dispositivos
db.devices.createIndex({ 'userId': 1 }, {
  name: 'idx_devices_user'
});

db.devices.createIndex({ 'token': 1 }, {
  sparse: true,
  name: 'idx_devices_token'
});

// Índices para sesiones QR
db.qrloginsessions.createIndex({ 'expiresAt': 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_qr_sessions_ttl'
});

// Índices para magic links
db.magiclinks.createIndex({ 'token': 1 }, {
  unique: true,
  name: 'idx_magic_links_token'
});

db.magiclinks.createIndex({ 'expiresAt': 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_magic_links_ttl'
});

// Índices para lista de acceso (blacklist/whitelist)
db.accesslists.createIndex({ 'document': 1, 'type': 1 }, {
  name: 'idx_accesslist_doc_type'
});

// Índices para estacionamiento
db.parkingspaces.createIndex({ 'number': 1 }, {
  unique: true,
  name: 'idx_parking_number'
});

db.parkingspaces.createIndex({ 'status': 1, 'type': 1 }, {
  name: 'idx_parking_status_type'
});

// Índices para notificaciones
db.notifications.createIndex({ 'userId': 1, 'read': 1 }, {
  name: 'idx_notifications_user_read'
});

db.notifications.createIndex({ 'createdAt': -1 }, {
  name: 'idx_notifications_date'
});

// Índices para suscripciones
db.subscriptions.createIndex({ 'userId': 1 }, {
  name: 'idx_subscriptions_user'
});

db.subscriptions.createIndex({ 'status': 1, 'endDate': 1 }, {
  name: 'idx_subscriptions_status'
});

print('Índices creados exitosamente.');
print('');
print('=== Configuración de seguridad ISO 27001 aplicada ===');
print('- Índices optimizados para autenticación');
print('- TTL automático para logs de auditoría (90 días)');
print('- Índices para trazabilidad de acceso');
print('');
print('=== Inicialización completada ===');
