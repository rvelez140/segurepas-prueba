import { Request, Response } from 'express';
import { DeviceService } from '../services/DeviceService';
import { IUser } from '../interfaces/IUser';

interface AuthenticatedRequest extends Request {
  user?: IUser;
  deviceId?: string;
}

export const deviceController = {
  /**
   * Obtiene todos los dispositivos activos del usuario
   */
  async getUserDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const devices = await DeviceService.getUserDevices(req.user._id.toString());

      res.status(200).json({
        devices,
        total: devices.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener dispositivos' });
    }
  },

  /**
   * Actualiza el nombre de un dispositivo
   */
  async updateDeviceName(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { deviceId } = req.params;
      const { deviceName } = req.body;

      if (!deviceName) {
        res.status(400).json({ error: 'Nombre de dispositivo requerido' });
        return;
      }

      const device = await DeviceService.updateDeviceName(
        deviceId,
        req.user._id.toString(),
        deviceName
      );

      res.status(200).json({
        message: 'Nombre de dispositivo actualizado',
        device,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar dispositivo' });
    }
  },

  /**
   * Desactiva un dispositivo específico
   */
  async deactivateDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { deviceId } = req.params;

      await DeviceService.deactivateDevice(deviceId, req.user._id.toString());

      res.status(200).json({
        message: 'Dispositivo desactivado exitosamente',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al desactivar dispositivo' });
    }
  },

  /**
   * Desactiva todos los dispositivos excepto el actual
   */
  async deactivateOtherDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const currentDeviceId = req.deviceId;

      await DeviceService.deactivateOtherDevices(
        req.user._id.toString(),
        currentDeviceId
      );

      res.status(200).json({
        message: 'Todos los demás dispositivos han sido desactivados',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al desactivar dispositivos' });
    }
  },

  /**
   * Obtiene estadísticas de dispositivos
   */
  async getDeviceStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const stats = await DeviceService.getDeviceStats(req.user._id.toString());

      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener estadísticas' });
    }
  },

  /**
   * Limpia dispositivos inactivos (solo para administradores)
   */
  async cleanupInactiveDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Acceso denegado' });
        return;
      }

      const deletedCount = await DeviceService.cleanupInactiveDevices();

      res.status(200).json({
        message: 'Dispositivos inactivos eliminados',
        deletedCount,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al limpiar dispositivos' });
    }
  },
};
