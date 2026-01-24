import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { authLimiter, createLimiter } from '../middlewares/rateLimitMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { AuditAction } from '../interfaces/IAuditLog';

const router = Router();

// # Rutas de autenticación

// Ruta para autenticar un usuario (con rate limiting estricto)
router.post('/auth/login', authLimiter, authController.loginUser);

// Ruta para registrar un usuario (solo admin, con rate limiting)
router.post(
  '/auth/register',
  authMiddleware,
  roleMiddleware(['admin']),
  createLimiter,
  auditMiddleware(AuditAction.USER_CREATE, 'user'),
  authController.registerUser
);

// Ruta de testeo para forzar el registro de un usuario sin validación de autenticación
router.post('/auth/register/force', createLimiter, authController.registerUser);

// Ruta para consultar el usuario autenticado actual
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

export default router;
