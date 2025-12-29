import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../types/auth.types';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        error: 'Autenticación requerida',
        code: 'NO_TOKEN'
      });
      return;
    }

    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as { id: string };
    const user = await UserService.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    // Distinguir entre diferentes tipos de errores de JWT
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
        message: error.message
      });
      return;
    }

    if (error instanceof jwt.NotBeforeError) {
      res.status(401).json({
        error: 'Token aún no es válido',
        code: 'TOKEN_NOT_ACTIVE',
        date: error.date
      });
      return;
    }

    // Error genérico
    res.status(500).json({
      error: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

export const roleMiddleware = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !requiredRoles.includes(user.role)) {
      res.status(403).json({ error: 'Acceso no autorizado' });
      return;
    }

    next();
  };
};
