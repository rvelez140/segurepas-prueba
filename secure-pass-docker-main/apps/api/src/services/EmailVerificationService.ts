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
}

export const emailVerificationService = new EmailVerificationService();
