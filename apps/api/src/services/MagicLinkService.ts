import { Request } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import MagicLink, { IMagicLink } from '../models/MagicLink';
import User from '../models/User';
import { IUser } from '../interfaces/IUser';
import { DeviceService } from './DeviceService';

export class MagicLinkService {
  /**
   * Crea un magic link para un usuario
   * @param email Email del usuario
   * @param req Request de Express
   * @returns Magic link creado
   */
  static async createMagicLink(
    email: string,
    req: Request
  ): Promise<{ token: string; expiresAt: Date }> {
    // Buscar usuario por email
    const user = await User.findOne({ 'auth.email': email });

    if (!user) {
      // Por seguridad, no revelar que el usuario no existe
      throw new Error('Si el email existe, se enviará un enlace de acceso');
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const deviceInfo = DeviceService.extractDeviceInfo(req);

    // El magic link expira en 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Crear magic link
    const magicLink = new MagicLink({
      userId: user._id,
      token,
      deviceInfo: {
        type: deviceInfo.deviceType,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
      },
      expiresAt,
      isUsed: false,
    });

    await magicLink.save();

    // Enviar email con el magic link
    await this.sendMagicLinkEmail(user, token, deviceInfo.deviceType);

    return { token, expiresAt };
  }

  /**
   * Verifica y consume un magic link
   * @param token Token del magic link
   * @returns Usuario y JWT token
   */
  static async verifyMagicLink(token: string): Promise<{
    user: IUser;
    jwtToken: string;
  }> {
    // Buscar magic link
    const magicLink = await MagicLink.findOne({ token }).populate('userId');

    if (!magicLink) {
      throw new Error('Enlace inválido o expirado');
    }

    if (!magicLink.isValid()) {
      throw new Error('Enlace inválido o ya utilizado');
    }

    // Marcar como usado
    await magicLink.markAsUsed();

    // Obtener usuario
    const user = await User.findById(magicLink.userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Generar JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.auth.email,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } // Token válido por 7 días para magic links
    );

    return { user, jwtToken };
  }

  /**
   * Envía un email con el magic link
   * @param user Usuario
   * @param token Token del magic link
   * @param deviceType Tipo de dispositivo
   */
  private static async sendMagicLinkEmail(
    user: IUser,
    token: string,
    deviceType: string
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Determinar la URL base según el tipo de dispositivo
    let baseUrl = process.env.WEB_URL || 'http://localhost:3000';
    if (deviceType === 'mobile') {
      baseUrl = process.env.MOBILE_DEEP_LINK || 'securepass://';
    } else if (deviceType === 'desktop') {
      baseUrl = process.env.DESKTOP_URL || 'http://localhost:3000';
    }

    const magicLink = `${baseUrl}/auth/magic-link?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.auth.email,
      subject: 'Enlace de Acceso Seguro - SecurePass',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #2c3e50;
                margin: 0;
              }
              .button {
                display: inline-block;
                background-color: #3498db;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .button:hover {
                background-color: #2980b9;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 SecurePass</h1>
                <p>Enlace de Acceso Seguro</p>
              </div>

              <p>Hola <strong>${user.name}</strong>,</p>

              <p>Has solicitado un enlace de acceso seguro para iniciar sesión en SecurePass.</p>

              <div style="text-align: center;">
                <a href="${magicLink}" class="button">Iniciar Sesión</a>
              </div>

              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${magicLink}
              </p>

              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este enlace expira en <strong>15 minutos</strong></li>
                  <li>Solo se puede usar <strong>una vez</strong></li>
                  <li>Si no solicitaste este enlace, ignora este email</li>
                </ul>
              </div>

              <p>Tipo de dispositivo detectado: <strong>${deviceType === 'mobile' ? 'Móvil' : deviceType === 'desktop' ? 'Desktop' : 'Web'}</strong></p>

              <div class="footer">
                <p>Este es un mensaje automático, por favor no respondas a este email.</p>
                <p>&copy; ${new Date().getFullYear()} SecurePass. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

  /**
   * Limpia magic links expirados
   * Se ejecuta automáticamente por el TTL index, pero se puede llamar manualmente
   * @returns Número de links eliminados
   */
  static async cleanupExpiredLinks(): Promise<number> {
    const now = new Date();

    const result = await MagicLink.deleteMany({
      expiresAt: { $lt: now },
    });

    return result.deletedCount || 0;
  }

  /**
   * Revoca todos los magic links de un usuario
   * @param userId ID del usuario
   */
  static async revokeUserLinks(userId: string): Promise<void> {
    await MagicLink.updateMany(
      { userId, isUsed: false },
      { isUsed: true }
    );
  }
}
