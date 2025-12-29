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
      res.status(401).json({ error: 'Autenticación requerida' });
      return;
    }

    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as { id: string };
    const user = await UserService.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Autenticación fallida' });
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

// Alias para authorize - verifica si el usuario tiene el rol requerido
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Acceso no autorizado para este rol' });
      return;
    }

    next();
  };
};
