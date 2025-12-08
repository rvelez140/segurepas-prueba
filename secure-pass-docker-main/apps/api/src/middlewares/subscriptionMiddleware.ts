import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { User } from '../models/User';
import { Admin } from '../interfaces/IUser';

/**
 * Middleware para verificar que la suscripción esté activa
 */
export const checkSubscriptionActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Obtener el usuario y verificar si es admin
    const user = await User.findById(userId).exec();
    if (!user || user.role !== 'admin') {
      // Si no es admin, no necesita verificación de suscripción
      return next();
    }

    const admin = user as Admin;
    const subscriptionId = admin.subscription;

    if (!subscriptionId) {
      return res.status(403).json({
        error: 'No hay suscripción asociada a este residencial',
      });
    }

    const subscription = await SubscriptionService.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        error: 'Suscripción no encontrada',
      });
    }

    if (!subscription.isActive()) {
      return res.status(403).json({
        error: 'La suscripción no está activa',
        status: subscription.status,
      });
    }

    // Agregar la suscripción al request para uso posterior
    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar límites de viviendas
 */
export const checkUnitsLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = req.subscription;

    if (!subscription) {
      return res.status(403).json({
        error: 'No hay suscripción disponible',
      });
    }

    if (subscription.isOverLimit()) {
      return res.status(403).json({
        error: 'Se ha excedido el límite de viviendas del plan',
        currentUnits: subscription.currentUsage.unitsCount,
        maxUnits: subscription.limits.maxUnits,
        planType: subscription.planType,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar acceso a características específicas
 */
export const checkFeatureAccess = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = req.subscription;

      if (!subscription) {
        return res.status(403).json({
          error: 'No hay suscripción disponible',
        });
      }

      const hasAccess = subscription.hasFeature(feature as keyof typeof subscription.limits);

      if (!hasAccess) {
        return res.status(403).json({
          error: `Esta característica no está disponible en tu plan actual`,
          feature,
          planType: subscription.planType,
          upgradeRequired: true,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar acceso a reportes avanzados
 */
export const checkAdvancedReports = checkFeatureAccess('advancedReports');

/**
 * Middleware para verificar acceso a múltiples entradas
 */
export const checkMultipleEntries = checkFeatureAccess('multipleEntries');

/**
 * Middleware para verificar acceso a API
 */
export const checkApiAccess = checkFeatureAccess('apiAccess');

/**
 * Middleware para verificar acceso a marca blanca
 */
export const checkWhiteLabel = checkFeatureAccess('whiteLabel');
