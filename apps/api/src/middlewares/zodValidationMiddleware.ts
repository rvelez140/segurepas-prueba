import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logWarn } from '../config/logger';

/**
 * Middleware para validar request body con Zod
 *
 * @param schema - Esquema de Zod para validar
 * @returns Middleware de Express
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validar y transformar el body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logWarn('Validación fallida en request body', { errors, path: req.path });

        res.status(400).json({
          error: 'Errores de validación',
          details: errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error de validación'
      });
    }
  };
};

/**
 * Middleware para validar query params con Zod
 *
 * @param schema - Esquema de Zod para validar
 * @returns Middleware de Express
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        logWarn('Validación fallida en query params', { errors, path: req.path });

        res.status(400).json({
          error: 'Parámetros de consulta inválidos',
          details: errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error de validación'
      });
    }
  };
};

/**
 * Middleware para validar params con Zod
 *
 * @param schema - Esquema de Zod para validar
 * @returns Middleware de Express
 */
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        logWarn('Validación fallida en params', { errors, path: req.path });

        res.status(400).json({
          error: 'Parámetros de ruta inválidos',
          details: errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error de validación'
      });
    }
  };
};

/**
 * Validar múltiples partes del request
 *
 * @param schemas - Objeto con esquemas para body, query y params
 * @returns Middleware de Express
 */
export const validateRequest = (schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          location: err.path[0] === 'body' ? 'body' : err.path[0] === 'query' ? 'query' : 'params'
        }));

        logWarn('Validación fallida en request', { errors, path: req.path });

        res.status(400).json({
          error: 'Errores de validación',
          details: errors
        });
        return;
      }

      res.status(500).json({
        error: 'Error de validación'
      });
    }
  };
};
