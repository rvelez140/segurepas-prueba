import express from 'express';
import { magicLinkController } from '../controllers/magicLinkController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/magic-link/create:
 *   post:
 *     summary: Crea y envía un magic link al email del usuario
 *     tags: [Magic Link]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Enlace enviado (o mensaje genérico por seguridad)
 */
router.post('/create', magicLinkController.createMagicLink);

/**
 * @swagger
 * /api/magic-link/verify:
 *   post:
 *     summary: Verifica y consume un magic link
 *     tags: [Magic Link]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/verify', magicLinkController.verifyMagicLink);

/**
 * @swagger
 * /api/magic-link/revoke:
 *   post:
 *     summary: Revoca todos los magic links del usuario actual
 *     tags: [Magic Link]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enlaces revocados
 */
router.post('/revoke', authMiddleware, magicLinkController.revokeUserLinks);

export default router;
