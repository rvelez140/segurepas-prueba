import { Request, Response } from 'express';
import { QRLoginService } from '../services/QRLoginService';
import { DeviceService } from '../services/DeviceService';
import { IUser } from '../interfaces/IUser';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const qrLoginController = {
  /**
   * Crea una nueva sesión de login con QR
   */
  async createQRSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, qrCode, expiresAt } = await QRLoginService.createQRSession(req);

      res.status(200).json({
        sessionId,
        qrCode,
        expiresAt,
        message: 'Escanea el código QR con la app móvil para iniciar sesión',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al crear sesión QR' });
    }
  },

  /**
   * Marca una sesión como escaneada (llamado desde la app móvil)
   */
  async scanQRSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID requerido' });
        return;
      }

      await QRLoginService.markAsScanned(sessionId, req.user._id.toString());

      res.status(200).json({
        message: 'QR escaneado exitosamente',
        status: 'scanned',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al escanear QR' });
    }
  },

  /**
   * Aprueba un login desde QR (llamado desde la app móvil)
   */
  async approveQRLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID requerido' });
        return;
      }

      const token = await QRLoginService.approveLogin(sessionId, req.user);

      // Registrar el dispositivo que se está autenticando
      // Nota: El dispositivo se registrará cuando el cliente use el token

      res.status(200).json({
        message: 'Login aprobado exitosamente',
        status: 'approved',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al aprobar login' });
    }
  },

  /**
   * Rechaza un login desde QR (llamado desde la app móvil)
   */
  async rejectQRLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID requerido' });
        return;
      }

      await QRLoginService.rejectLogin(sessionId);

      res.status(200).json({
        message: 'Login rechazado',
        status: 'rejected',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al rechazar login' });
    }
  },

  /**
   * Verifica el estado de una sesión (polling desde web/desktop)
   */
  async checkSessionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID requerido' });
        return;
      }

      const status = await QRLoginService.checkSessionStatus(sessionId);

      res.status(200).json(status);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al verificar estado' });
    }
  },

  /**
   * Cancela una sesión pendiente
   */
  async cancelSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID requerido' });
        return;
      }

      await QRLoginService.cancelSession(sessionId);

      res.status(200).json({
        message: 'Sesión cancelada',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al cancelar sesión' });
    }
  },
};
