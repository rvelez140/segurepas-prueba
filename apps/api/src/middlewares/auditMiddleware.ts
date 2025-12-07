import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "../services/AuditLogService";
import { AuditAction, AuditSeverity } from "../interfaces/IAuditLog";

/**
 * Middleware para auditar requests automáticamente
 */
export const auditMiddleware = (action: AuditAction, resource?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Guardar el método send original
    const originalSend = res.send;

    // Sobrescribir el método send para capturar la respuesta
    res.send = function (data: any): Response {
      // Determinar si fue exitoso basado en el código de estado
      const success = res.statusCode >= 200 && res.statusCode < 400;

      // Obtener resourceId si está disponible
      const resourceId =
        req.params.id ||
        req.params.document ||
        req.params.qrId ||
        req.params.residentId ||
        req.params.guardId;

      // Registrar en auditoría de forma asíncrona (no bloquear la respuesta)
      setImmediate(async () => {
        try {
          await AuditLogService.logFromRequest(req, action, {
            resource: resource || req.path,
            resourceId,
            success,
            severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
            details: {
              method: req.method,
              body: sanitizeBody(req.body),
              query: req.query,
            },
            errorMessage: !success && data ? extractErrorMessage(data) : undefined,
          });
        } catch (error) {
          console.error("Error en auditoría:", error);
        }
      });

      // Llamar al método send original
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Sanitizar el body del request antes de guardarlo
 * Remover campos sensibles como passwords
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== "object") return body;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "secret", "apiKey"];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
}

/**
 * Extraer mensaje de error de la respuesta
 */
function extractErrorMessage(data: any): string | undefined {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return parsed.error || parsed.message;
    } catch {
      return data;
    }
  }

  if (data && typeof data === "object") {
    return data.error || data.message;
  }

  return undefined;
}
