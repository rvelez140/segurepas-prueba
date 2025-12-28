import { Request, Response } from 'express';
import { TwoFactorService } from '../services/TwoFactorService';
import { IUser } from '../interfaces/IUser';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const twoFactorController = {
  /**
   * Genera un secreto y código QR para configurar Google Authenticator
   */
  async generateSecret(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { secret, otpauthUrl, qrCode } = await TwoFactorService.generateSecret(req.user);

      res.status(200).json({
        secret,
        otpauthUrl,
        qrCode,
        message: 'Escanea el código QR con Google Authenticator',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al generar el secreto 2FA' });
    }
  },

  /**
   * Habilita 2FA para el usuario actual
   */
  async enable2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { secret, token } = req.body;

      if (!secret || !token) {
        res.status(400).json({ error: 'Secreto y token son requeridos' });
        return;
      }

      const user = await TwoFactorService.enable2FA(
        req.user._id.toString(),
        secret,
        token
      );

      const backupCodes = (user as any).backupCodes || [];

      res.status(200).json({
        message: 'Autenticación de dos factores habilitada exitosamente',
        backupCodes,
        warning: 'Guarda estos códigos de respaldo en un lugar seguro',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al habilitar 2FA' });
    }
  },

  /**
   * Deshabilita 2FA para el usuario actual
   */
  async disable2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: 'Contraseña requerida para deshabilitar 2FA' });
        return;
      }

      // Verificar contraseña
      const isPasswordValid = await req.user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Contraseña incorrecta' });
        return;
      }

      await TwoFactorService.disable2FA(req.user._id.toString());

      res.status(200).json({
        message: 'Autenticación de dos factores deshabilitada',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al deshabilitar 2FA' });
    }
  },

  /**
   * Regenera los códigos de respaldo
   */
  async regenerateBackupCodes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!req.user.auth.twoFactorEnabled) {
        res.status(400).json({ error: '2FA no está habilitado' });
        return;
      }

      const backupCodes = await TwoFactorService.regenerateBackupCodes(
        req.user._id.toString()
      );

      res.status(200).json({
        backupCodes,
        message: 'Códigos de respaldo regenerados',
        warning: 'Los códigos anteriores ya no son válidos',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al regenerar códigos' });
    }
  },

  /**
   * Verifica si el usuario tiene 2FA habilitado
   */
  async check2FAStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      res.status(200).json({
        twoFactorEnabled: req.user.auth.twoFactorEnabled,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar estado 2FA' });
    }
  },
};
