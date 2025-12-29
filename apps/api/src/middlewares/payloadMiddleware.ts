import { Request, Response, NextFunction } from 'express';
import express from 'express';

/**
 * Middleware para aumentar el límite de payload en rutas específicas
 *
 * Uso:
 * app.use('/api/upload', largerPayloadLimit, uploadRoutes);
 */
export const largerPayloadLimit = express.json({ limit: '10mb' });

/**
 * Middleware para rutas de upload de imágenes (hasta 20mb)
 */
export const imageUploadPayloadLimit = express.json({ limit: '20mb' });

/**
 * Middleware personalizado para límites de payload dinámicos
 *
 * @param limit - Tamaño máximo del payload (ej: '5mb', '100kb')
 * @returns Middleware de Express
 */
export const customPayloadLimit = (limit: string) => {
  return express.json({ limit });
};

/**
 * Middleware para validar tamaño de archivos antes de procesarlos
 */
export const validateFileSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSize) {
      res.status(413).json({
        error: 'Archivo demasiado grande',
        maxSize: `${maxSize / (1024 * 1024)}MB`,
        receivedSize: `${parseInt(contentLength) / (1024 * 1024)}MB`
      });
      return;
    }

    next();
  };
};
