# 🚀 SecurePass - Funcionalidades Completas

## 📋 Tabla de Contenidos
- [Seguridad y Auditoría](#seguridad-y-auditoría)
- [Gestión de Visitas](#gestión-de-visitas)
- [Control de Acceso](#control-de-acceso)
- [Sistema de Parqueaderos](#sistema-de-parqueaderos)
- [Notificaciones](#notificaciones)
- [Performance y Escalabilidad](#performance-y-escalabilidad)
- [Testing y CI/CD](#testing-y-cicd)

---

## 🔒 Seguridad y Auditoría

### Rate Limiting
- **5 niveles de protección** contra ataques de fuerza bruta
- authLimiter: 5 intentos de login en 15 minutos
- generalLimiter: 100 requests en 15 minutos
- createLimiter: 20 creaciones por hora
- uploadLimiter: 30 uploads en 15 minutos
- readLimiter: 60 lecturas por minuto

### Protección de Seguridad
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado con whitelist
- ✅ Sanitización NoSQL (express-mongo-sanitize)
- ✅ Protección HPP (HTTP Parameter Pollution)
- ✅ Headers personalizados (XSS, clickjacking, MIME-sniffing)

### Sistema de Auditoría
- 📊 **15+ tipos de acciones auditadas**
  - LOGIN, LOGOUT, LOGIN_FAILED
  - USER_CREATE, USER_UPDATE, USER_DELETE
  - VISIT_AUTHORIZE, VISIT_ENTRY, VISIT_EXIT
  - PAYMENT_CREATE, PAYMENT_SUCCESS, PAYMENT_FAILED
  - UNAUTHORIZED_ACCESS, RATE_LIMIT_EXCEEDED

- **Características**:
  - Tracking completo de IP, user agent, timestamps
  - Índices optimizados para consultas rápidas
  - TTL automático (90 días)
  - Estadísticas y filtros avanzados
  - Exportación de reportes

---

## 👥 Gestión de Visitas

### Auto-Rellenado con OCR
- 📸 **Tesseract.js** para reconocimiento de texto
- Detección automática de:
  - Cédulas colombianas (8-11 dígitos)
  - Placas de vehículos (ABC123)
- Validación y formateo automático
- Feedback visual del progreso
- Endpoints:
  - `POST /api/visits/ocr/process` - Procesar imagen
  - `POST /api/visits/ocr/upload-visit/:document` - Subir con OCR
  - `POST /api/visits/ocr/upload-vehicle/:document` - Subir placa con OCR

### Visitas Recurrentes
- 📅 **Patrones de recurrencia**:
  - DAILY (diario)
  - WEEKLY (semanal)
  - BIWEEKLY (quincenal)
  - MONTHLY (mensual)
  - CUSTOM (fechas personalizadas)

- **Configuración avanzada**:
  - Días de la semana específicos
  - Día del mes
  - Ventanas de tiempo (horario)
  - Fecha de inicio y fin
  - Generación automática de visitas

- **Endpoints**:
  - `POST /api/recurring-visits` - Crear
  - `GET /api/recurring-visits/my` - Mis visitas
  - `POST /api/recurring-visits/generate` - Generar ahora
  - `GET /api/recurring-visits/stats` - Estadísticas

---

## 🚫 Control de Acceso

### Lista Negra / Whitelist
- **Blacklist**: Bloquear documentos problemáticos
- **Whitelist**: Acceso rápido para visitantes frecuentes
- Expiración automática por fecha
- Soft delete (desactivar en lugar de eliminar)
- Integración automática con autorizaciones

**Endpoints**:
- `POST /api/access-list/blacklist` - Agregar a lista negra
- `POST /api/access-list/whitelist` - Agregar a lista blanca
- `GET /api/access-list/blacklist/check/:document` - Verificar bloqueo
- `GET /api/access-list/stats` - Estadísticas

---

## 🚗 Sistema de Parqueaderos

### Gestión de Espacios
- **Tipos**:
  - RESIDENT (residentes)
  - VISITOR (visitantes)

- **Estados**:
  - AVAILABLE (disponible)
  - OCCUPIED (ocupado)
  - RESERVED (reservado)
  - MAINTENANCE (mantenimiento)

### Características
- ✅ Asignación automática de espacios
- ✅ Tracking de tiempo de estacionamiento
- ✅ Cálculo automático de duración
- ✅ Historial completo de asignaciones
- ✅ Estadísticas por tipo y estado
- ✅ Integración con sistema de visitas

**Endpoints**:
- `POST /api/parking/spaces` - Crear espacio
- `GET /api/parking/spaces/available` - Espacios disponibles
- `POST /api/parking/assign` - Asignar espacio
- `PUT /api/parking/exit/:assignmentId` - Registrar salida
- `GET /api/parking/stats` - Estadísticas

---

## 🔔 Notificaciones

### Push Notifications (Firebase)
- 📱 **Firebase Cloud Messaging**
- Notificaciones predefinidas:
  - Visita autorizada
  - Visitante en recepción
  - Entrada/salida registrada
  - Espacio de parqueo asignado
  - Parqueadero lleno

### WebSockets (Socket.IO)
- ⚡ **Tiempo Real**
- Eventos:
  - `new_visit` - Nueva visita (guardias)
  - `visitor_arrived` - Visitante llegó (residente)
  - `visit_entry` - Entrada registrada
  - `visit_exit` - Salida registrada
  - `parking_update` - Cambio en parqueo
  - `blacklist_alert` - Alerta de lista negra

- **Autenticación JWT** en handshake
- Salas por rol (residente, guardia, admin)
- Tracking de clientes conectados

---

## ⚡ Performance y Escalabilidad

### Caché con Redis
- 🚀 **ioredis** para alto rendimiento
- Claves predefinidas:
  - `visits:active` - Visitas activas
  - `visit:qr:{qrId}` - Visita por QR
  - `stats:visits` - Estadísticas
  - `parking:available:{type}` - Parqueo disponible

- **TTL configurables**:
  - short: 1 minuto
  - medium: 5 minutos
  - long: 15 minutos
  - veryLong: 1 hora
  - day: 24 horas

### Paginación
- Utility helper para paginar queries
- Límite máximo: 100 items por página
- Ordenamiento configurable
- Metadatos de paginación (hasNext, hasPrev, pages)

---

## 🧪 Testing y CI/CD

### Tests Automatizados (Jest)
- ✅ Unit tests
- ✅ Integration tests
- ✅ Supertest para tests de API
- Configuración de base de datos de prueba

### CI/CD (GitHub Actions)
- **Pipeline completo**:
  1. Lint y Type Check
  2. Run Tests (MongoDB + Redis)
  3. Build Applications
  4. Security Audit
  5. Code Quality (SonarCloud)
  6. Deploy to Production

- **Servicios**:
  - MongoDB 7
  - Redis 7-alpine
  - Node.js 18

---

## 📊 Estadísticas y Analytics

### Dashboard Mejorado
- Métricas en tiempo real
- Gráficos y visualizaciones
- Reportes programados
- Exportación a PDF/Excel

### Métricas Disponibles
- Total de visitas (activas, pendientes, completadas)
- Tasa de aprobación/rechazo
- Tiempo promedio de estadía
- Ocupación de parqueaderos
- Actividad por usuario
- Logs de auditoría
- Performance del sistema

---

## 🛠️ Variables de Entorno Requeridas

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/securepass

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase (JSON string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# URLs
WEB_URL=http://localhost:3000
MOBILE_URL=http://localhost:19000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## 🎯 Próximas Funcionalidades Recomendadas

### Fase 1 (Corto plazo)
- [ ] Autenticación 2FA (SMS o authenticator app)
- [ ] Reconocimiento facial
- [ ] Tema claro/oscuro
- [ ] Modo offline en mobile

### Fase 2 (Mediano plazo)
- [ ] App móvil para residentes
- [ ] Reconocimiento de placas (ANPR)
- [ ] Predicción de tráfico con ML
- [ ] Integración con cámaras de seguridad

### Fase 3 (Largo plazo)
- [ ] Multi-tenant (múltiples residenciales)
- [ ] Integraciones con hardware (torniquetes, barreras)
- [ ] Delivery automation (Uber Eats, Rappi)
- [ ] Microservicios architecture

---

## 📚 Documentación API

Documentación completa disponible en:
- Swagger/OpenAPI: `http://localhost:8000/api-docs`
- Postman Collection: `/docs/postman/SecurePass.postman_collection.json`

---

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.txt](LICENSE.txt) para más detalles.
