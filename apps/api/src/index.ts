import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import morgan from 'morgan';
import visitRoutes from './routes/visitRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import auditRoutes from './routes/auditRoutes';
import accessListRoutes from './routes/accessListRoutes';
import recurringVisitRoutes from './routes/recurringVisitRoutes';
import parkingRoutes from './routes/parkingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import deviceRoutes from './routes/deviceRoutes';
import qrLoginRoutes from './routes/qrLoginRoutes';
import magicLinkRoutes from './routes/magicLinkRoutes';
import { configureSecurity } from './middlewares/securityMiddleware';
import { generalLimiter } from './middlewares/rateLimitMiddleware';
import { webSocketService } from './services/WebSocketService';
import { setupSwagger } from './config/swagger';
import { initSentry, setupSentryErrorHandler } from './config/sentry';
import { initAdminUser } from './utils/initAdminUser';
import logger, { logInfo, logError, morganStream } from './config/logger';

const app = express();

// Inicializar Sentry para monitoreo de errores (debe ser lo primero)
initSentry(app);

// HTTP request logging con Morgan
app.use(morgan('combined', { stream: morganStream }));

// Aplicar configuración de seguridad (Helmet, CORS, Sanitización, etc.)
configureSecurity(app);

// Rate limiting general
app.use(generalLimiter);

// Body parser con límite reducido (se puede aumentar en rutas específicas)
app.use(express.json({ limit: '1mb' }));

// Swagger Documentation
setupSwagger(app);

const MONGODB_URI = process.env.MONGODB_URI || '';
const PORT = process.env.PORT || 48721;

// Opciones de conexión para MongoDB (soporta tanto local como MongoDB Atlas)
const mongooseOptions = {
  retryWrites: true,
  w: 'majority' as const,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(async () => {
    logInfo('✓ Se ha realizado la conexión con MongoDB');
    const isAtlas = MONGODB_URI.includes('mongodb+srv://');
    logInfo(`  Tipo de conexión: ${isAtlas ? 'MongoDB Atlas (Externa)' : 'MongoDB Local'}`);

    // Inicializar usuario administrador por defecto
    await initAdminUser();
  })
  .catch((err: Error) => {
    logError('✗ Error al conectar a MongoDB', err);
    logError('  Verifica que MONGODB_URI esté correctamente configurado en el archivo .env');
    process.exit(1);
  });

app.use(
  '/api',
  visitRoutes,
  userRoutes,
  authRoutes,
  subscriptionRoutes,
  analyticsRoutes,
  paymentRoutes,
  auditRoutes,
  accessListRoutes,
  recurringVisitRoutes,
  parkingRoutes,
  notificationRoutes
);

// Nuevas rutas para autenticación avanzada
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/qr-login', qrLoginRoutes);
app.use('/api/magic-link', magicLinkRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      mongodb: 'unknown',
      api: 'up'
    }
  };

  try {
    // Verificar conexión a MongoDB
    const mongoState = mongoose.connection.readyState;
    healthcheck.services.mongodb = mongoState === 1 ? 'connected' : 'disconnected';

    // Si MongoDB está desconectado, retornar 503
    if (mongoState !== 1) {
      return res.status(503).json(healthcheck);
    }

    // Todo está bien
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = 'ERROR';
    healthcheck.services.api = 'error';
    res.status(503).json(healthcheck);
  }
});

// Configurar error handler de Sentry (debe ser después de las rutas)
setupSentryErrorHandler(app);

app.get('/', (req, res) => {
  res.send(
    `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SecurePass</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .securepass-container {
            border: 2px solid #3498db;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            width: 100%;
        }

        .securepass-title {
            color: #2c3e50;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .securepass-logo {
            color: #3498db;
            font-size: 36px;
            margin-bottom: 15px;
        }

        .securepass-description {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="securepass-container">
        <div class="securepass-logo">🔐</div>
        <div class="securepass-title">SECURE PASS API</div>
        <div class="securepass-description">El servidor está funcionando correctamente</div>
    </div>
</body>
</html>`
  );
});

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar WebSocket
webSocketService.initialize(server);

// Iniciar servidor
server.listen(PORT, () => {
  logInfo(`🚀 Servidor corriendo en Puerto: ${PORT}`);
  logInfo(`📝 Documentación API disponible en: http://localhost:${PORT}/api-docs`);
  logInfo(`🏥 Health check disponible en: http://localhost:${PORT}/health`);
  logInfo(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
