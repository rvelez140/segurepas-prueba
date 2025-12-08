import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import { Express } from "express";

/**
 * Configuración de seguridad centralizada para la aplicación
 */
export const configureSecurity = (app: Express) => {
  // Helmet - Protección de headers HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // CORS - Configuración de origen cruzado
  const corsOptions = {
    origin: function (origin: string | undefined, callback: Function) {
      // Lista de orígenes permitidos
      const whitelist = [
        process.env.WEB_URL || "http://localhost:3000",
        process.env.MOBILE_URL || "http://localhost:19000",
        "http://localhost:3000",
        "http://localhost:19000",
      ];

      // Permitir requests sin origen (como aplicaciones móviles o Postman)
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));

  // Sanitización de datos de MongoDB
  // Previene inyección NoSQL
  app.use(
    mongoSanitize({
      replaceWith: "_",
      onSanitize: ({ req, key }) => {
        console.warn(`Intento de inyección NoSQL detectado en: ${key}`);
      },
    })
  );

  // Protección contra HTTP Parameter Pollution
  app.use(hpp());

  // Headers de seguridad adicionales
  app.use((req, res, next) => {
    // Prevenir clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // Prevenir MIME-sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Habilitar protección XSS en navegadores antiguos
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Política de referrer
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permisos de funcionalidades del navegador
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(self), microphone=(), camera=(self)"
    );

    next();
  });
};

/**
 * Middleware para validar que el request tenga un token válido
 */
export const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "No autorizado. Token requerido.",
    });
  }

  // El middleware de autenticación existente se encargará de validar el token
  next();
};

/**
 * Middleware para validar que el usuario tenga roles específicos
 */
export const requireRoles = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tiene permisos para realizar esta acción.",
      });
    }

    next();
  };
};
