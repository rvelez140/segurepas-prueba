import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import QRLoginSession, { IQRLoginSession } from '../models/QRLoginSession';
import { DeviceService } from './DeviceService';
import { IUser } from '../interfaces/IUser';

export class QRLoginService {
  /**
   * Crea una nueva sesión de login con QR
   * @param req Request de Express
   * @returns Sesión creada con código QR
   */
  static async createQRSession(req: Request): Promise<{
    sessionId: string;
    qrCode: string;
    expiresAt: Date;
  }> {
    const sessionId = uuidv4();
    const deviceInfo = DeviceService.extractDeviceInfo(req);

    // La sesión expira en 2 minutos
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Generar código QR con el sessionId
    const qrCodeData = JSON.stringify({
      sessionId,
      type: 'qr-login',
      timestamp: Date.now(),
    });

    const qrCode = await QRCode.toDataURL(qrCodeData);

    // Crear sesión en la base de datos
    const session = new QRLoginSession({
      sessionId,
      qrCode,
      deviceInfo: {
        type: deviceInfo.deviceType === 'mobile' ? 'web' : deviceInfo.deviceType,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        platform: deviceInfo.deviceOS,
      },
      status: 'pending',
      expiresAt,
    });

    await session.save();

    return {
      sessionId,
      qrCode,
      expiresAt,
    };
  }

  /**
   * Marca una sesión como escaneada
   * @param sessionId ID de la sesión
   * @param userId ID del usuario que escaneó
   * @returns Sesión actualizada
   */
  static async markAsScanned(sessionId: string, userId: string): Promise<IQRLoginSession> {
    const session = await QRLoginSession.findOne({ sessionId });

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    if (!session.isValid()) {
      throw new Error('Sesión expirada o ya utilizada');
    }

    const mongoose = require('mongoose');
    await session.markAsScanned(new mongoose.Types.ObjectId(userId));
    return session;
  }

  /**
   * Aprueba un login desde QR
   * @param sessionId ID de la sesión
   * @param user Usuario que aprueba
   * @returns Token JWT generado
   */
  static async approveLogin(sessionId: string, user: IUser): Promise<string> {
    const session = await QRLoginSession.findOne({ sessionId });

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    if (session.status !== 'scanned') {
      throw new Error('La sesión no ha sido escaneada');
    }

    if (!session.isValid()) {
      throw new Error('Sesión expirada');
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.auth.email,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } // Token válido por 7 días para QR login
    );

    await session.approve(token);
    return token;
  }

  /**
   * Rechaza un login desde QR
   * @param sessionId ID de la sesión
   */
  static async rejectLogin(sessionId: string): Promise<void> {
    const session = await QRLoginSession.findOne({ sessionId });

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    await session.reject();
  }

  /**
   * Verifica el estado de una sesión
   * @param sessionId ID de la sesión
   * @returns Estado de la sesión
   */
  static async checkSessionStatus(sessionId: string): Promise<{
    status: string;
    token?: string;
    scannedBy?: string;
  }> {
    const session = await QRLoginSession.findOne({ sessionId })
      .select('+token')
      .populate('scannedBy', 'name auth.email');

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    // Verificar si expiró
    if (session.status === 'pending' && session.expiresAt < new Date()) {
      session.status = 'expired';
      await session.save();
    }

    return {
      status: session.status,
      token: session.status === 'approved' ? session.token : undefined,
      scannedBy: session.scannedBy
        ? (session.scannedBy as any).name || (session.scannedBy as any).auth?.email
        : undefined,
    };
  }

  /**
   * Limpia sesiones expiradas (más de 10 minutos)
   * Se ejecuta automáticamente por el TTL index, pero se puede llamar manualmente
   * @returns Número de sesiones eliminadas
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const result = await QRLoginSession.deleteMany({
      expiresAt: { $lt: tenMinutesAgo },
    });

    return result.deletedCount || 0;
  }

  /**
   * Cancela una sesión pendiente
   * @param sessionId ID de la sesión
   */
  static async cancelSession(sessionId: string): Promise<void> {
    await QRLoginSession.findOneAndUpdate(
      { sessionId, status: 'pending' },
      { status: 'expired' }
    );
  }
}
