import nodemailer from "nodemailer";
import crypto from "crypto";
import { env } from "../config/env";
import { User } from "../models/User";
import { IUser } from "../interfaces/IUser";

class EmailVerificationService {
  public transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Genera un código de verificación de 6 dígitos
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Genera un token único de verificación
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Envía el email de verificación con código y enlace
   */
  async sendVerificationEmail(user: IUser): Promise<void> {
    const verificationCode = this.generateVerificationCode();
    const verificationToken = this.generateVerificationToken();
    const expiresIn = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar el código y token en el usuario
    await User.findByIdAndUpdate(user._id, {
      $set: {
        verificationCode,
        verificationToken,
        verificationTokenExpires: expiresIn,
        emailVerified: false
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || env.EMAIL_USER,
      to: user.auth.email,
      subject: 'Verifica tu cuenta de SecurePass',
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
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              color: #0077b6;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 36px;
              margin-bottom: 10px;
            }
            .verification-code {
              background-color: #0077b6;
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #0077b6;
              color: white !important;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .button:hover {
              background-color: #005f87;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐</div>
              <h1>Bienvenido a SecurePass</h1>
            </div>

            <p>Hola <strong>${user.name}</strong>,</p>

            <p>Gracias por registrarte en SecurePass. Para completar tu registro y activar tu cuenta, necesitas verificar tu correo electrónico.</p>

            <h2>Opción 1: Código de Verificación</h2>
            <p>Ingresa este código de 6 dígitos en la página de verificación:</p>

            <div class="verification-code">${verificationCode}</div>

            <h2>Opción 2: Enlace de Activación</h2>
            <p>También puedes hacer clic en el siguiente enlace para verificar tu cuenta automáticamente:</p>

            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verificar mi cuenta</a>
            </div>

            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px;">
              ${verificationLink}
            </p>

            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este código y enlace son válidos por 24 horas</li>
                <li>No podrás acceder a tu cuenta hasta que la verifiques</li>
                <li>Si no solicitaste este registro, puedes ignorar este email</li>
              </ul>
            </div>

            <div class="footer">
              <p>Este es un mensaje automático, por favor no responder.</p>
              <p>Si tienes problemas para verificar tu cuenta, contacta a soporte.</p>
              <p>&copy; ${new Date().getFullYear()} SecurePass - Sistema de Control de Acceso</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Verifica el código de verificación
   */
  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string; user?: IUser }> {
    const user = await User.findOne({ 'auth.email': email })
      .select('+verificationCode +verificationTokenExpires')
      .exec();

    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'El email ya está verificado' };
    }

    if (!user.verificationCode) {
      return { success: false, message: 'No hay código de verificación activo' };
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return { success: false, message: 'El código de verificación ha expirado' };
    }

    if (user.verificationCode !== code) {
      return { success: false, message: 'Código de verificación incorrecto' };
    }

    // Marcar como verificado
    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerified: true
      },
      $unset: {
        verificationCode: '',
        verificationToken: '',
        verificationTokenExpires: ''
      }
    });

    const updatedUser = await User.findById(user._id).exec();
    return { success: true, message: 'Email verificado correctamente', user: updatedUser as IUser };
  }

  /**
   * Verifica el token de verificación
   */
  async verifyToken(token: string): Promise<{ success: boolean; message: string; user?: IUser }> {
    const user = await User.findOne({ verificationToken: token })
      .select('+verificationToken +verificationTokenExpires')
      .exec();

    if (!user) {
      return { success: false, message: 'Token de verificación inválido' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'El email ya está verificado' };
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return { success: false, message: 'El token de verificación ha expirado' };
    }

    // Marcar como verificado
    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerified: true
      },
      $unset: {
        verificationCode: '',
        verificationToken: '',
        verificationTokenExpires: ''
      }
    });

    const updatedUser = await User.findById(user._id).exec();
    return { success: true, message: 'Email verificado correctamente', user: updatedUser as IUser };
  }

  /**
   * Reenvía el email de verificación
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const user = await User.findOne({ 'auth.email': email }).exec();

    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'El email ya está verificado' };
    }

    await this.sendVerificationEmail(user);
    return { success: true, message: 'Email de verificación reenviado' };
  }

  /**
   * Envía el email de bienvenida después de verificar la cuenta
   */
  async sendWelcomeEmail(user: IUser): Promise<void> {
    const mailOptions = {
      from: `"SecurePass" <${process.env.EMAIL_FROM || env.EMAIL_USER}>`,
      to: user.auth.email,
      subject: '¡Bienvenido a SecurePass! 🎉',
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
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              color: #0077b6;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .welcome-box {
              background: linear-gradient(135deg, #0077b6 0%, #005f87 100%);
              color: white;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .welcome-box h2 {
              margin: 0;
              font-size: 28px;
            }
            .info-box {
              background-color: white;
              border-left: 4px solid #0077b6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              color: #0077b6;
            }
            .button {
              display: inline-block;
              background-color: #0077b6;
              color: white !important;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .button:hover {
              background-color: #005f87;
            }
            .features {
              margin: 30px 0;
            }
            .feature-item {
              padding: 15px;
              margin: 10px 0;
              background-color: white;
              border-radius: 6px;
              border-left: 3px solid #0077b6;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 10px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐</div>
              <h1>¡Bienvenido a SecurePass!</h1>
            </div>

            <div class="welcome-box">
              <h2>¡Tu cuenta está activada!</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Estamos emocionados de tenerte con nosotros</p>
            </div>

            <p>Hola <strong>${user.name}</strong>,</p>

            <p>¡Felicidades! Tu cuenta ha sido verificada exitosamente y ya puedes comenzar a usar SecurePass, el sistema de gestión de visitantes más completo para residencias.</p>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #0077b6;">📋 Información de tu cuenta</h3>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${user.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${user.auth.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Rol:</span>
                <span class="info-value">${user.role === 'residente' ? 'Residente' : user.role === 'guardia' ? 'Guardia' : 'Administrador'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha de registro:</span>
                <span class="info-value">${new Date(user.registerDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Ir a SecurePass
              </a>
            </div>

            <div class="features">
              <h3 style="color: #0077b6;">✨ ¿Qué puedes hacer con SecurePass?</h3>

              <div class="feature-item">
                <span class="feature-icon">👥</span>
                <strong>Gestionar Visitantes:</strong> Autoriza visitas de manera fácil y segura
              </div>

              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <strong>Códigos QR:</strong> Genera códigos QR únicos para cada visitante
              </div>

              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <strong>Historial:</strong> Consulta el historial completo de todas tus visitas
              </div>

              <div class="feature-item">
                <span class="feature-icon">🔔</span>
                <strong>Notificaciones:</strong> Recibe alertas por email de tus autorizaciones
              </div>

              <div class="feature-item">
                <span class="feature-icon">🛡️</span>
                <strong>Seguridad:</strong> Control de acceso completo y trazabilidad
              </div>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>💡 Consejo:</strong> Asegúrate de completar tu perfil con toda la información necesaria para aprovechar al máximo todas las funcionalidades de SecurePass.
            </div>

            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Nuestro equipo está aquí para ayudarte.</p>

            <p>¡Gracias por unirte a SecurePass!</p>

            <p style="margin-top: 30px;">
              Saludos cordiales,<br>
              <strong>El equipo de SecurePass</strong>
            </p>

            <div class="footer">
              <p>Este es un mensaje automático, por favor no responder.</p>
              <p>&copy; ${new Date().getFullYear()} SecurePass - Sistema de Control de Acceso</p>
              <p>Tu seguridad es nuestra prioridad</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailVerificationService = new EmailVerificationService();
