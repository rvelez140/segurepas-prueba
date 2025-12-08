import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware genérico para validación de entrada usando Zod
 * @param schema - Schema de Zod para validar
 * @param target - Parte del request a validar ('body', 'query', 'params')
 */
export const validate = (schema: AnyZodObject, target: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[target];

      // Validar y parsear los datos
      const validatedData = await schema.parseAsync(dataToValidate);

      // Reemplazar los datos originales con los validados y parseados
      req[target] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de Zod para una respuesta amigable
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors,
        });
        return;
      }

      // Error inesperado
      res.status(500).json({
        error: 'Error de validación interno',
      });
    }
  };
};

/**
 * Middleware para validar body del request
 */
export const validateBody = (schema: AnyZodObject) => validate(schema, 'body');

/**
 * Middleware para validar query params del request
 */
export const validateQuery = (schema: AnyZodObject) => validate(schema, 'query');

/**
 * Middleware para validar route params del request
 */
export const validateParams = (schema: AnyZodObject) => validate(schema, 'params');
