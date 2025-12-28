import { Request, Response } from 'express';

/**
 * Crea un mock de Request para testing
 */
export const mockRequest = (options: {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: any;
  file?: any;
  files?: any;
  [key: string]: any; // Permitir propiedades adicionales
} = {}): Partial<Request> & { [key: string]: any } => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user,
    file: options.file,
    files: options.files,
    ...options, // Incluir todas las propiedades adicionales
  };
};

/**
 * Crea un mock de Response para testing
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Crea un mock de NextFunction
 */
export const mockNext = jest.fn();
