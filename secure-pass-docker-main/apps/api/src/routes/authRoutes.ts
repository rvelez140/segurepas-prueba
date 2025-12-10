import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import passport from '../config/passport';

const router = Router();

// # Rutas de autenticación

// Ruta para autenticar un usuario
router.post('/auth/login', authController.loginUser);
// Ruta para registrar un usuario
router.post(
  '/auth/register',
  authMiddleware,
  roleMiddleware(['admin']),
  authController.registerUser
);
// Ruta de testeo para forzar el registro de un usuario sin validación de autenticación
router.post('/auth/register/force', authController.registerUser);
// Ruta para consultar el usuario autenticado actual
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

// # Rutas de Google OAuth
// Inicia el proceso de autenticación con Google
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Callback de Google OAuth
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/google/failure',
  }),
  authController.googleCallback
);

// Ruta de error en caso de que falle la autenticación con Google
router.get('/auth/google/failure', authController.googleFailure);

// # Rutas de Microsoft OAuth
// Inicia el proceso de autenticación con Microsoft
router.get(
  '/auth/microsoft',
  passport.authenticate('microsoft', {
    scope: ['user.read'],
    session: false,
  })
);

// Callback de Microsoft OAuth
router.get(
  '/auth/microsoft/callback',
  passport.authenticate('microsoft', {
    session: false,
    failureRedirect: '/auth/microsoft/failure',
  }),
  authController.microsoftCallback
);

// Ruta de error en caso de que falle la autenticación con Microsoft
router.get('/auth/microsoft/failure', authController.microsoftFailure);

export default router;
