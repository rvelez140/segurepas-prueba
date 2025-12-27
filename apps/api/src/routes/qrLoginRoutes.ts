import express from 'express';
import { qrLoginController } from '../controllers/qrLoginController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/qr-login/create:
 *   post:
 *     summary: Crea una nueva sesión de login con QR
 *     tags: [QR Login]
 *     responses:
 *       200:
 *         description: Sesión QR creada exitosamente
 */
router.post('/create', qrLoginController.createQRSession);

/**
 * @swagger
 * /api/qr-login/scan:
 *   post:
 *     summary: Marca una sesión como escaneada (desde app móvil)
 *     tags: [QR Login]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: QR escaneado exitosamente
 */
router.post('/scan', authMiddleware, qrLoginController.scanQRSession);

/**
 * @swagger
 * /api/qr-login/approve:
 *   post:
 *     summary: Aprueba un login desde QR (desde app móvil)
 *     tags: [QR Login]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login aprobado
 */
router.post('/approve', authMiddleware, qrLoginController.approveQRLogin);

/**
 * @swagger
 * /api/qr-login/reject:
 *   post:
 *     summary: Rechaza un login desde QR (desde app móvil)
 *     tags: [QR Login]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login rechazado
 */
router.post('/reject', authMiddleware, qrLoginController.rejectQRLogin);

/**
 * @swagger
 * /api/qr-login/status/{sessionId}:
 *   get:
 *     summary: Verifica el estado de una sesión (polling desde web/desktop)
 *     tags: [QR Login]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de la sesión
 */
router.get('/status/:sessionId', qrLoginController.checkSessionStatus);

/**
 * @swagger
 * /api/qr-login/cancel:
 *   post:
 *     summary: Cancela una sesión pendiente
 *     tags: [QR Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cancelada
 */
router.post('/cancel', qrLoginController.cancelSession);

export default router;
