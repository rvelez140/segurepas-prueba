import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger, { httpLogger } from './utils/logger';
import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
} from './config/sentry';
import visitRoutes from './routes/visitRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// Inicializar Sentry (debe ser lo primero)
initSentry(app);

// Sentry request handler (debe estar antes de las rutas)
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);

// HTTP request logging
app.use(httpLogger);

// Configuración de seguridad con Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Rate limiting global - 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting estricto para rutas de autenticación - 5 requests por 15 minutos
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de autenticación, por favor intenta de nuevo más tarde.',
  skipSuccessfulRequests: true,
});

// CORS configurado
app.use(cors());

// Body parser con límite de tamaño
app.use(express.json({ limit: '10mb' }));

const MONGODB_URI = process.env.MONGODB_URI || '';
const PORT = process.env.PORT || 8000;

// Opciones de conexión para MongoDB (soporta tanto local como MongoDB Atlas)
const mongooseOptions = {
    retryWrites: true,
    w: 'majority' as const,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
        logger.info('✓ Se ha realizado la conexión con MongoDB');
        const isAtlas = MONGODB_URI.includes('mongodb+srv://');
        logger.info(`  Tipo de conexión: ${isAtlas ? 'MongoDB Atlas (Externa)' : 'MongoDB Local'}`);
    })
    .catch((err: Error) => {
        logger.error('✗ Error al conectar a MongoDB:', { error: err.message });
        logger.error('  Verifica que MONGODB_URI esté correctamente configurado en el archivo .env');
        process.exit(1);
    });

app.use('/api', visitRoutes, userRoutes, authRoutes, subscriptionRoutes, analyticsRoutes, paymentRoutes, notificationRoutes);

// Sentry error handler (debe estar después de las rutas)
app.use(sentryErrorHandler);

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


app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en Puerto: ${PORT}`);
    logger.info(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
});