import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { IUser, GuardShift } from '../interfaces/IUser';
import { emailVerificationService } from '../services/EmailVerificationService';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authController = {
  async registerUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, email, password, role, apartment, tel, shift } = req.body;

    try {
      // Validaciones específicas por rol
      if (role === 'residente' && (!apartment || !tel)) {
        res.status(400).json({
          error: 'Apartamento y teléfono son requeridos para residentes',
        });
        return;
      }

      if (role === 'guardia' && !shift) {
        res.status(400).json({
          error: 'Turno es requerido para guardias',
        });
        return;
      }

      const userData = {
        auth: { email, password },
        name,
        role,
        ...(role === 'residente' && { apartment, tel }),
        ...(role === 'guardia' && { shift }),
        ...(role === 'admin' && { lastAccess: new Date() }),
      };

      const user = await UserService.createUser(userData as IUser);

      // Enviar email de verificación
      try {
        await emailVerificationService.sendVerificationEmail(user);
      } catch (emailError) {
        console.error('Error al enviar email de verificación:', emailError);
        // Continuar aunque falle el email
      }

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.auth.email,
        role: user.role,
        emailVerified: user.emailVerified,
        ...(user.role === 'residente' && {
          apartment: user.apartment,
          tel: user.tel,
        }),
        ...(user.role === 'guardia' && {
          shift: user.shift,
        }),
        registerDate: user.registerDate,
      };

      res.status(201).json({
        message:
          'Usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta.',
        user: userResponse,
        requiresVerification: true,
      });
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        res.status(400).json({ error: 'El email ya está registrado' });
      } else {
        res.status(500).json({ error: error.message || 'Error al registrar el usuario' });
      }
    }
  },

  async loginUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const user = await UserService.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Verificar si el email está verificado (solo para usuarios con password, no OAuth)
      if (!user.googleId && !user.microsoftId && !user.emailVerified) {
        res.status(403).json({
          error: 'Por favor verifica tu email antes de iniciar sesión',
          emailVerified: false,
          requiresVerification: true,
        });
        return;
      }

      const isPasswordValid = await UserService.comparePasswords(user._id, password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.auth.email,
        },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1h' }
      );

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.auth.email,
        role: user.role,
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
        token,
        user: userResponse,
        expiresIn: 3600,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al iniciar sesión' });
    }
  },

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const userResponse = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.auth.email,
        role: req.user.role,
        ...(req.user.role === 'residente' && {
          apartment: req.user.apartment,
          tel: req.user.tel,
        }),
        ...(req.user.role === 'guardia' && {
          shift: req.user.shift,
        }),
        registerDate: req.user.registerDate,
        updateDate: req.user.updateDate,
      };

      res.status(200).json(userResponse);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener el usuario' });
    }
  },

  async googleCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Error en la autenticación con Google' });
        return;
      }

      const token = jwt.sign(
        {
          id: req.user._id,
          role: req.user.role,
          email: req.user.auth.email,
        },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1h' }
      );

      const userResponse = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.auth.email,
        role: req.user.role,
        ...(req.user.role === 'residente' && {
          apartment: req.user.apartment,
          tel: req.user.tel,
        }),
        ...(req.user.role === 'guardia' && {
          shift: req.user.shift,
        }),
        registerDate: req.user.registerDate,
      };

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error en el callback de Google' });
    }
  },

  async googleFailure(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(401).json({
      error: 'Autenticación con Google fallida. Por favor, intenta nuevamente.',
    });
  },

  async microsoftCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Error en la autenticación con Microsoft' });
        return;
      }

      const token = jwt.sign(
        {
          id: req.user._id,
          role: req.user.role,
          email: req.user.auth.email,
        },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1h' }
      );

      const userResponse = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.auth.email,
        role: req.user.role,
        ...(req.user.role === 'residente' && {
          apartment: req.user.apartment,
          tel: req.user.tel,
        }),
        ...(req.user.role === 'guardia' && {
          shift: req.user.shift,
        }),
        registerDate: req.user.registerDate,
      };

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/auth/microsoft/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error en el callback de Microsoft' });
    }
  },

  async microsoftFailure(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(401).json({
      error: 'Autenticación con Microsoft fallida. Por favor, intenta nuevamente.',
    });
  },
};
