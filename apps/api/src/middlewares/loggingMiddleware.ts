/**
 * HTTP Logging Middleware
 * Uses Morgan for HTTP request logging with Winston backend
 */

import morgan from 'morgan';
import logger, { stream } from '../config/logger.js';
import { Request, Response } from 'express';

// Custom Morgan token for user ID
morgan.token('user-id', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

// Custom Morgan token for request body (be careful with sensitive data)
morgan.token('body', (req: Request) => {
  // Filter out sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'refreshToken'];
  const body = { ...req.body };

  sensitiveFields.forEach(field => {
    if (body[field]) {
      body[field] = '[REDACTED]';
    }
  });

  return JSON.stringify(body);
});

// Custom Morgan token for response time in seconds
morgan.token('response-time-sec', (req: Request, res: Response) => {
  const responseTime = parseFloat(morgan['response-time'](req, res) || '0');
  return (responseTime / 1000).toFixed(3);
});

// Development format - detailed logging
const developmentFormat = ':method :url :status :response-time ms - :res[content-length] - User: :user-id';

// Production format - structured logging
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  contentLength: ':res[content-length]',
  responseTime: ':response-time',
  userId: ':user-id',
  ip: ':remote-addr',
  userAgent: ':user-agent',
});

// Combined format with additional metadata
const combinedFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Skip logging for health check endpoints
const skip = (req: Request, res: Response) => {
  const skipPaths = ['/health', '/api/health', '/healthz', '/ping'];
  return skipPaths.includes(req.path);
};

// Create Morgan middleware instances
export const morganDevelopment = morgan(developmentFormat, {
  stream,
  skip,
});

export const morganProduction = morgan(combinedFormat, {
  stream,
  skip,
});

// Auto-select based on environment
export const morganMiddleware = process.env.NODE_ENV === 'production'
  ? morganProduction
  : morganDevelopment;

// Request logging middleware with custom metadata
export const requestLogger = (req: Request, res: Response, next: any) => {
  const startTime = Date.now();

  // Log request
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    logger.http('Response sent', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.id,
    });

    return originalSend.call(this, data);
  };

  next();
};

export default morganMiddleware;
