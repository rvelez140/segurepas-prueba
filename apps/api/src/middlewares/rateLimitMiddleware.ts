import rateLimit from 'express-rate-limit';

// Rate limiter general para todas las rutas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter estricto para autenticación (login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 intentos de login
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    error:
      'Demasiados intentos de inicio de sesión. Cuenta bloqueada temporalmente por 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para creación de recursos (visitas, usuarios, etc.)
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Máximo 20 creaciones por hora
  message: {
    error: 'Ha alcanzado el límite de creaciones. Intente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para uploads de imágenes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Máximo 30 uploads en 15 minutos
  message: {
    error: 'Demasiadas imágenes subidas. Por favor espere antes de continuar.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para operaciones de lectura intensivas
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // Máximo 60 lecturas por minuto
  message: {
    error: 'Demasiadas consultas. Por favor reduzca la frecuencia.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
