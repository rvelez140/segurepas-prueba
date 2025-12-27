import express from 'express';
import { twoFactorController } from '../controllers/twoFactorController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/2fa/generate:
 *   post:
 *     summary: Genera un secreto y QR para configurar Google Authenticator
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Secreto y QR generados exitosamente
 *       401:
 *         description: No autenticado
 */
router.post('/generate', authMiddleware, twoFactorController.generateSecret);

/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Habilita 2FA para el usuario actual
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secret
 *               - token
 *             properties:
 *               secret:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA habilitado exitosamente
 *       400:
 *         description: Token inválido
 */
router.post('/enable', authMiddleware, twoFactorController.enable2FA);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Deshabilita 2FA para el usuario actual
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA deshabilitado exitosamente
 *       401:
 *         description: Contraseña incorrecta
 */
router.post('/disable', authMiddleware, twoFactorController.disable2FA);

/**
 * @swagger
 * /api/2fa/backup-codes/regenerate:
 *   post:
 *     summary: Regenera los códigos de respaldo
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Códigos regenerados exitosamente
 *       400:
 *         description: 2FA no está habilitado
 */
router.post('/backup-codes/regenerate', authMiddleware, twoFactorController.regenerateBackupCodes);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Verifica si el usuario tiene 2FA habilitado
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de 2FA
 */
router.get('/status', authMiddleware, twoFactorController.check2FAStatus);

export default router;
