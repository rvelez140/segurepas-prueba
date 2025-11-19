import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AccountStatus } from '../interfaces/IUser';

/**
 * Middleware para verificar que la cuenta del usuario esté activa
 */
export const checkAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener userId del request (puede venir de auth middleware o del body/params)
    const userId = (req as any).user?.userId || req.body.userId || req.params.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Verificar estado de la cuenta
    if (user.accountStatus === AccountStatus.SUSPENDED) {
      res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido suspendida por falta de pago',
        accountStatus: user.accountStatus,
        suspendedAt: user.suspendedAt,
        suspensionReason: user.suspensionReason,
        pendingBalance: user.pendingBalance,
        paymentDueDate: user.paymentDueDate,
      });
      return;
    }

    if (user.accountStatus === AccountStatus.BLOCKED) {
      res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido bloqueada. Contacta con soporte.',
        accountStatus: user.accountStatus,
        suspendedAt: user.suspendedAt,
        suspensionReason: user.suspensionReason,
        pendingBalance: user.pendingBalance,
      });
      return;
    }

    if (user.accountStatus === AccountStatus.PENDING_PAYMENT) {
      // Permitir acceso pero enviar advertencia
      (req as any).accountWarning = {
        message: 'Tienes un pago pendiente',
        pendingBalance: user.pendingBalance,
        paymentDueDate: user.paymentDueDate,
      };
    }

    // Guardar info del usuario en el request
    (req as any).userInfo = user;

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado de cuenta',
      error: error.message,
    });
  }
};

/**
 * Middleware para verificar que la cuenta esté activa (bloquea si no lo está)
 */
export const requireActiveAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId || req.body.userId || req.params.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      res.status(403).json({
        success: false,
        message: 'Se requiere una cuenta activa para esta operación',
        accountStatus: user.accountStatus,
        pendingBalance: user.pendingBalance,
      });
      return;
    }

    (req as any).userInfo = user;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado de cuenta',
      error: error.message,
    });
  }
};
