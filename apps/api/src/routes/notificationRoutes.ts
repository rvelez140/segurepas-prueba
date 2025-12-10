import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';

const router = Router();

// Obtener todas las notificaciones (Admin)
router.get('/notifications', notificationController.getAllNotifications);

// Obtener estadísticas de notificaciones de un usuario
router.get('/notifications/stats/:userId', notificationController.getNotificationStats);

// Obtener notificaciones de un usuario
router.get('/notifications/user/:userId', notificationController.getNotificationsByUser);

// Obtener notificaciones no leídas de un usuario
router.get('/notifications/user/:userId/unread', notificationController.getUnreadNotifications);

// Contar notificaciones no leídas de un usuario
router.get('/notifications/user/:userId/unread/count', notificationController.getUnreadCount);

// Obtener notificaciones por tipo de un usuario
router.get('/notifications/user/:userId/type', notificationController.getNotificationsByType);

// Marcar una notificación como leída
router.put('/notifications/:notificationId/read', notificationController.markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.put('/notifications/user/:userId/read-all', notificationController.markAllAsRead);

// Eliminar una notificación
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

// Eliminar todas las notificaciones de un usuario
router.delete('/notifications/user/:userId', notificationController.deleteAllNotifications);

export default router;
