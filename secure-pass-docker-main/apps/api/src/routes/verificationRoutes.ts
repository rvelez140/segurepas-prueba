import { Router } from "express";
import { verificationController } from "../controllers/verificationController";

const router = Router();

// # Rutas de verificación de email

// Verificar código de verificación
router.post('/verification/verify-code', verificationController.verifyCode);

// Verificar token de verificación
router.get('/verification/verify-token/:token', verificationController.verifyToken);

// Reenviar email de verificación
router.post('/verification/resend', verificationController.resendVerification);

export default router;
