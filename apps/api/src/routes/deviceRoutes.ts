import express from 'express';
import { deviceController } from '../controllers/deviceController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Obtiene todos los dispositivos activos del usuario
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 */
router.get('/', authMiddleware, deviceController.getUserDevices);

/**
 * @swagger
 * /api/devices/stats:
 *   get:
 *     summary: Obtiene estadísticas de dispositivos
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de dispositivos
 */
router.get('/stats', authMiddleware, deviceController.getDeviceStats);

/**
 * @swagger
 * /api/devices/{deviceId}:
 *   patch:
 *     summary: Actualiza el nombre de un dispositivo
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceName
 *             properties:
 *               deviceName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nombre actualizado
 */
router.patch('/:deviceId', authMiddleware, deviceController.updateDeviceName);

/**
 * @swagger
 * /api/devices/{deviceId}:
 *   delete:
 *     summary: Desactiva un dispositivo específico
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispositivo desactivado
 */
router.delete('/:deviceId', authMiddleware, deviceController.deactivateDevice);

/**
 * @swagger
 * /api/devices/deactivate-others:
 *   post:
 *     summary: Desactiva todos los dispositivos excepto el actual
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dispositivos desactivados
 */
router.post('/deactivate-others', authMiddleware, deviceController.deactivateOtherDevices);

/**
 * @swagger
 * /api/devices/cleanup:
 *   post:
 *     summary: Limpia dispositivos inactivos (solo admin)
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dispositivos eliminados
 *       403:
 *         description: Acceso denegado
 */
router.post('/cleanup', authMiddleware, deviceController.cleanupInactiveDevices);

export default router;
