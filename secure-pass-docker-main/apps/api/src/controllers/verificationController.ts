import { Request, Response } from 'express';
import { emailVerificationService } from '../services/EmailVerificationService';

export const verificationController = {
  /**
   * Verifica un código de verificación
   */
  async verifyCode(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email y código son requeridos' });
      return;
    }

    try {
      const result = await emailVerificationService.verifyCode(email, code);

      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }

      // Enviar email de bienvenida después de verificar exitosamente
      if (result.user) {
        try {
          await emailVerificationService.sendWelcomeEmail(result.user);
        } catch (emailError) {
          console.error('Error al enviar email de bienvenida:', emailError);
          // Continuar aunque falle el email de bienvenida
        }
      }

      res.status(200).json({
        message: result.message,
        emailVerified: true,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar el código' });
    }
  },

  /**
   * Verifica un token de verificación
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ error: 'Token es requerido' });
      return;
    }

    try {
      const result = await emailVerificationService.verifyToken(token);

      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }

      // Enviar email de bienvenida después de verificar exitosamente
      if (result.user) {
        try {
          await emailVerificationService.sendWelcomeEmail(result.user);
        } catch (emailError) {
          console.error('Error al enviar email de bienvenida:', emailError);
          // Continuar aunque falle el email de bienvenida
        }
      }

      res.status(200).json({
        message: result.message,
        emailVerified: true,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar el token' });
    }
  },

  /**
   * Reenvía el email de verificación
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email es requerido' });
      return;
    }

    try {
      const result = await emailVerificationService.resendVerificationEmail(email);

      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }

      res.status(200).json({
        message: result.message,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || 'Error al reenviar el email de verificación' });
    }
  },
};
