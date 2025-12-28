import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import Device, { IDevice } from '../models/Device';
import mongoose from 'mongoose';

export class DeviceService {
  /**
   * Extrae información del dispositivo desde el request
   * @param req Request de Express
   * @returns Información del dispositivo
   */
  static extractDeviceInfo(req: Request): {
    deviceType: 'web' | 'mobile' | 'desktop';
    deviceOS?: string;
    deviceBrowser?: string;
    deviceModel?: string;
    userAgent?: string;
    ipAddress?: string;
  } {
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Detectar el tipo de dispositivo
    let deviceType: 'web' | 'mobile' | 'desktop' = 'web';

    // Detectar si es la app móvil
    if (userAgent.includes('SecurePass-Mobile') || userAgent.includes('Expo')) {
      deviceType = 'mobile';
    }
    // Detectar si es la app desktop
    else if (userAgent.includes('Electron') || userAgent.includes('SecurePass-Desktop')) {
      deviceType = 'desktop';
    }
    // Detectar si es móvil por user agent
    else if (result.device.type === 'mobile' || result.device.type === 'tablet') {
      deviceType = 'mobile';
    }

    return {
      deviceType,
      deviceOS: result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : undefined,
      deviceBrowser: result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : undefined,
      deviceModel: result.device.model || undefined,
      userAgent,
      ipAddress: (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string,
    };
  }

  /**
   * Registra un nuevo dispositivo para un usuario
   * @param userId ID del usuario
   * @param req Request de Express
   * @param token Token JWT
   * @param deviceName Nombre personalizado del dispositivo (opcional)
   * @returns Dispositivo creado
   */
  static async registerDevice(
    userId: string,
    req: Request,
    token?: string,
    deviceName?: string
  ): Promise<IDevice> {
    const deviceInfo = this.extractDeviceInfo(req);

    const device = new Device({
      userId,
      ...deviceInfo,
      deviceName: deviceName || undefined,
      token,
      lastActive: new Date(),
      isActive: true,
    });

    await device.save();
    return device;
  }

  /**
   * Obtiene todos los dispositivos activos de un usuario
   * @param userId ID del usuario
   * @returns Lista de dispositivos
   */
  static async getUserDevices(userId: string): Promise<IDevice[]> {
    return Device.find({ userId, isActive: true })
      .sort({ lastActive: -1 })
      .select('-token -refreshToken');
  }

  /**
   * Actualiza la última actividad de un dispositivo
   * @param deviceId ID del dispositivo
   */
  static async updateDeviceActivity(deviceId: string): Promise<void> {
    await Device.findByIdAndUpdate(deviceId, {
      lastActive: new Date(),
    });
  }

  /**
   * Desactiva un dispositivo específico
   * @param deviceId ID del dispositivo
   * @param userId ID del usuario (para validación)
   */
  static async deactivateDevice(deviceId: string, userId: string): Promise<void> {
    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
      throw new Error('Dispositivo no encontrado');
    }

    await device.deactivate();
  }

  /**
   * Desactiva todos los dispositivos excepto el actual
   * @param userId ID del usuario
   * @param currentDeviceId ID del dispositivo actual
   */
  static async deactivateOtherDevices(userId: string, currentDeviceId?: string): Promise<void> {
    const query: any = { userId, isActive: true };

    if (currentDeviceId) {
      query._id = { $ne: currentDeviceId };
    }

    await Device.updateMany(query, {
      isActive: false,
      token: null,
      refreshToken: null,
    });
  }

  /**
   * Actualiza el nombre de un dispositivo
   * @param deviceId ID del dispositivo
   * @param userId ID del usuario (para validación)
   * @param newName Nuevo nombre
   * @returns Dispositivo actualizado
   */
  static async updateDeviceName(
    deviceId: string,
    userId: string,
    newName: string
  ): Promise<IDevice> {
    const device = await Device.findOneAndUpdate(
      { _id: deviceId, userId },
      { deviceName: newName },
      { new: true }
    ).select('-token -refreshToken');

    if (!device) {
      throw new Error('Dispositivo no encontrado');
    }

    return device;
  }

  /**
   * Busca un dispositivo por su token
   * @param token Token JWT
   * @returns Dispositivo o null
   */
  static async findDeviceByToken(token: string): Promise<IDevice | null> {
    return Device.findOne({ token, isActive: true }).select('+token');
  }

  /**
   * Limpia dispositivos inactivos (más de 30 días sin actividad)
   * @returns Número de dispositivos eliminados
   */
  static async cleanupInactiveDevices(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Device.deleteMany({
      lastActive: { $lt: thirtyDaysAgo },
      isActive: false,
    });

    return result.deletedCount || 0;
  }

  /**
   * Obtiene estadísticas de dispositivos de un usuario
   * @param userId ID del usuario
   * @returns Estadísticas
   */
  static async getDeviceStats(userId: string): Promise<{
    total: number;
    active: number;
    byType: { web: number; mobile: number; desktop: number };
  }> {
    const devices = await Device.find({ userId, isActive: true });

    return {
      total: devices.length,
      active: devices.length,
      byType: {
        web: devices.filter((d) => d.deviceType === 'web').length,
        mobile: devices.filter((d) => d.deviceType === 'mobile').length,
        desktop: devices.filter((d) => d.deviceType === 'desktop').length,
      },
    };
  }
}
