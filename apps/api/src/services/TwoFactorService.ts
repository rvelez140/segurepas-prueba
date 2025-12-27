import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import User from '../models/User';
import { IUser } from '../interfaces/IUser';

export class TwoFactorService {
  /**
   * Genera un secreto para Google Authenticator
   * @param user Usuario para el cual generar el secreto
   * @returns Secreto, URL OTPAuth y código QR en base64
   */
  static async generateSecret(user: IUser): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCode: string;
  }> {
    const secret = speakeasy.generateSecret({
      name: `SecurePass (${user.auth.email})`,
      issuer: 'SecurePass',
      length: 32,
    });

    if (!secret.otpauth_url) {
      throw new Error('No se pudo generar la URL OTPAuth');
    }

    // Generar código QR
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode,
    };
  }

  /**
   * Habilita 2FA para un usuario
   * @param userId ID del usuario
   * @param secret Secreto generado
   * @param token Token de verificación
   * @returns Usuario actualizado
   */
  static async enable2FA(
    userId: string,
    secret: string,
    token: string
  ): Promise<IUser> {
    // Verificar que el token sea válido
    const isValid = this.verifyToken(secret, token);
    if (!isValid) {
      throw new Error('Código de verificación inválido');
    }

    // Generar códigos de respaldo
    const backupCodes = this.generateBackupCodes();

    // Actualizar usuario
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'auth.twoFactorSecret': secret,
        'auth.twoFactorEnabled': true,
        'auth.twoFactorBackupCodes': backupCodes.map((code) =>
          crypto.createHash('sha256').update(code).digest('hex')
        ),
      },
      { new: true }
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Retornar códigos de respaldo para que el usuario los guarde
    (user as any).backupCodes = backupCodes;

    return user;
  }

  /**
   * Deshabilita 2FA para un usuario
   * @param userId ID del usuario
   * @returns Usuario actualizado
   */
  static async disable2FA(userId: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'auth.twoFactorSecret': null,
        'auth.twoFactorEnabled': false,
        'auth.twoFactorBackupCodes': [],
      },
      { new: true }
    );

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Verifica un token TOTP
   * @param secret Secreto del usuario
   * @param token Token a verificar
   * @returns true si es válido, false si no
   */
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Permite 2 ventanas de tiempo (±60 segundos)
    });
  }

  /**
   * Verifica un código de respaldo
   * @param user Usuario
   * @param code Código de respaldo
   * @returns true si es válido, false si no
   */
  static async verifyBackupCode(user: IUser, code: string): Promise<boolean> {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const backupCodes = user.auth.twoFactorBackupCodes || [];
    const index = backupCodes.indexOf(hashedCode);

    if (index === -1) {
      return false;
    }

    // Eliminar el código usado
    backupCodes.splice(index, 1);
    await User.findByIdAndUpdate(user._id, {
      'auth.twoFactorBackupCodes': backupCodes,
    });

    return true;
  }

  /**
   * Genera códigos de respaldo
   * @returns Array de códigos de respaldo
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Regenera códigos de respaldo
   * @param userId ID del usuario
   * @returns Nuevos códigos de respaldo
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();

    await User.findByIdAndUpdate(userId, {
      'auth.twoFactorBackupCodes': backupCodes.map((code) =>
        crypto.createHash('sha256').update(code).digest('hex')
      ),
    });

    return backupCodes;
  }
}
