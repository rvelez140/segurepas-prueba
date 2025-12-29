import winston from 'winston';
import path from 'path';

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Aplicar colores a winston
winston.addColors(colors);

// Formato para logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Determinar nivel de log según el entorno
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development' || env === 'test';
  return isDevelopment ? 'debug' : 'info';
};

// Definir transportes (dónde se guardan los logs)
const transports: winston.transport[] = [
  // Consola
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// En producción, agregar archivos de log
if (process.env.NODE_ENV === 'production') {
  // Logs de errores
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Todos los logs
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // No salir en error (continuar la aplicación)
  exitOnError: false,
});

// Función helper para logear requests HTTP
export const logHTTP = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Función helper para logear información
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

// Función helper para logear advertencias
export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

// Función helper para logear errores
export const logError = (message: string, error?: Error | any, meta?: any) => {
  if (error instanceof Error) {
    logger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
        ...meta,
      },
    });
  } else {
    logger.error(message, { error, ...meta });
  }
};

// Función helper para logear debug
export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Stream para Morgan (middleware de logging HTTP)
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
