import { Request, Response, NextFunction } from 'express';
import { NotificationHistoryService } from '../services/NotificationHistoryService';
import { Types } from 'mongoose';
import { NotificationType } from '../interfaces/INotification';

export const notificationController = {
  /**
   * Obtener notificaciones de un usuario
   */
  async getNotificationsByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const notifications = await NotificationHistoryService.getNotificationsByUser(
        new Types.ObjectId(userId),
        limit,
        skip
      );

      res.status(200).json({
        message: 'Notificaciones obtenidas exitosamente',
        data: notifications,
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      next(error);
    }
  },

  /**
   * Obtener notificaciones no leídas de un usuario
   */
  async getUnreadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const notifications = await NotificationHistoryService.getUnreadNotifications(
        new Types.ObjectId(userId)
      );

      res.status(200).json({
        message: 'Notificaciones no leídas obtenidas exitosamente',
        data: notifications,
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones no leídas:', error);
      next(error);
    }
  },

  /**
   * Contar notificaciones no leídas
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const count = await NotificationHistoryService.getUnreadCount(new Types.ObjectId(userId));

      res.status(200).json({
        message: 'Conteo obtenido exitosamente',
        data: { count },
      });
    } catch (error) {
      console.error('Error contando notificaciones no leídas:', error);
      next(error);
    }
  },

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;

      const notification = await NotificationHistoryService.markAsRead(
        new Types.ObjectId(notificationId)
      );

      if (!notification) {
        res.status(404).json({ message: 'Notificación no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Notificación marcada como leída',
        data: notification,
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      next(error);
    }
  },

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const count = await NotificationHistoryService.markAllAsRead(new Types.ObjectId(userId));

      res.status(200).json({
        message: 'Todas las notificaciones marcadas como leídas',
        data: { modifiedCount: count },
      });
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      next(error);
    }
  },

  /**
   * Obtener notificaciones por tipo
   */
  async getNotificationsByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { type } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!type || !Object.values(NotificationType).includes(type as NotificationType)) {
        res.status(400).json({ message: 'Tipo de notificación inválido' });
        return;
      }

      const notifications = await NotificationHistoryService.getNotificationsByType(
        new Types.ObjectId(userId),
        type as NotificationType,
        limit
      );

      res.status(200).json({
        message: 'Notificaciones por tipo obtenidas exitosamente',
        data: notifications,
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones por tipo:', error);
      next(error);
    }
  },

  /**
   * Eliminar una notificación
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;

      await NotificationHistoryService.deleteNotification(new Types.ObjectId(notificationId));

      res.status(200).json({
        message: 'Notificación eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      next(error);
    }
  },

  /**
   * Eliminar todas las notificaciones de un usuario
   */
  async deleteAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const count = await NotificationHistoryService.deleteAllNotifications(
        new Types.ObjectId(userId)
      );

      res.status(200).json({
        message: 'Todas las notificaciones eliminadas exitosamente',
        data: { deletedCount: count },
      });
    } catch (error) {
      console.error('Error eliminando todas las notificaciones:', error);
      next(error);
    }
  },

  /**
   * Obtener todas las notificaciones (admin)
   */
  async getAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;

      const notifications = await NotificationHistoryService.getAllNotifications(limit, skip);

      res.status(200).json({
        message: 'Todas las notificaciones obtenidas exitosamente',
        data: notifications,
      });
    } catch (error) {
      console.error('Error obteniendo todas las notificaciones:', error);
      next(error);
    }
  },

  /**
   * Obtener estadísticas de notificaciones de un usuario
   */
  async getNotificationStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const stats = await NotificationHistoryService.getNotificationStats(
        new Types.ObjectId(userId)
      );

      res.status(200).json({
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      next(error);
    }
  },
};
