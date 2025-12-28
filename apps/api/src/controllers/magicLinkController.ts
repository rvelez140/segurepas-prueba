import { Request, Response } from 'express';
import { MagicLinkService } from '../services/MagicLinkService';
import { DeviceService } from '../services/DeviceService';
import { IUser } from '../interfaces/IUser';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const magicLinkController = {
  /**
   * Crea y envía un magic link al email del usuario
   */
  async createMagicLink(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email requerido' });
        return;
      }

      await MagicLinkService.createMagicLink(email, req);

      // Por seguridad, siempre mostrar el mismo mensaje
      res.status(200).json({
        message: 'Si el email existe, se ha enviado un enlace de acceso seguro',
      });
    } catch (error: any) {
      // No revelar si el usuario existe o no
      res.status(200).json({
        message: 'Si el email existe, se ha enviado un enlace de acceso seguro',
      });
    }
  },

  /**
   * Verifica y consume un magic link
   */
  async verifyMagicLink(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Token requerido' });
        return;
      }

      const { user, jwtToken } = await MagicLinkService.verifyMagicLink(token);

      // Registrar dispositivo
      const device = await DeviceService.registerDevice(
        user._id.toString(),
        req,
        jwtToken
      );

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.auth.email,
        role: user.role,
        twoFactorEnabled: user.auth.twoFactorEnabled,
        ...(user.role === 'residente' && {
          apartment: user.apartment,
          tel: user.tel,
        }),
        ...(user.role === 'guardia' && {
          shift: user.shift,
        }),
        registerDate: user.registerDate,
      };

      res.status(200).json({
        token: jwtToken,
        user: userResponse,
        deviceId: device._id,
        expiresIn: 7 * 24 * 3600, // 7 días
        message: 'Autenticación exitosa',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Enlace inválido o expirado' });
    }
  },

  /**
   * Revoca todos los magic links del usuario actual
   */
  async revokeUserLinks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      await MagicLinkService.revokeUserLinks(req.user._id.toString());

      res.status(200).json({
        message: 'Todos los enlaces de acceso han sido revocados',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al revocar enlaces' });
    }
  },
};
