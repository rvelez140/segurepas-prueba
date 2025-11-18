import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// # Rutas de autenticación

// Ruta para autenticar un usuario
router.post('/auth/login', authController.loginUser);
// Ruta para registrar un usuario
router.post('/auth/register', authMiddleware, roleMiddleware(['admin']), authController.registerUser);
// Ruta de testeo para forzar el registro de un usuario sin validación de autenticación
router.post('/auth/register/force', authController.registerUser);
// Ruta para consultar el usuario autenticado actual
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

export default router;