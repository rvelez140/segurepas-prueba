import { Notification } from '../models/Notification';
import { INotification, NotificationType } from '../interfaces/INotification';
import { Types } from 'mongoose';

export class NotificationHistoryService {
  /**
   * Obtener notificaciones de un usuario específico
   */
  static async getNotificationsByUser(
    userId: Types.ObjectId | string,
    limit: number = 50,
    skip: number = 0
  ): Promise<INotification[]> {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('relatedVisit')
      .populate('relatedUser', 'name');
  }

  /**
   * Obtener notificaciones no leídas de un usuario
   */
  static async getUnreadNotifications(userId: Types.ObjectId | string): Promise<INotification[]> {
    return await Notification.find({ recipient: userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('relatedVisit')
      .populate('relatedUser', 'name');
  }

  /**
   * Contar notificaciones no leídas de un usuario
   */
  static async getUnreadCount(userId: Types.ObjectId | string): Promise<number> {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  }

  /**
   * Marcar una notificación como leída
   */
  static async markAsRead(notificationId: Types.ObjectId | string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true }
    );
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  static async markAllAsRead(userId: Types.ObjectId | string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  /**
   * Obtener notificaciones por tipo
   */
  static async getNotificationsByType(
    userId: Types.ObjectId | string,
    type: NotificationType,
    limit: number = 50
  ): Promise<INotification[]> {
    return await Notification.find({ recipient: userId, type })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedVisit')
      .populate('relatedUser', 'name');
  }

  /**
   * Eliminar una notificación
   */
  static async deleteNotification(notificationId: Types.ObjectId | string): Promise<void> {
    await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Eliminar todas las notificaciones de un usuario
   */
  static async deleteAllNotifications(userId: Types.ObjectId | string): Promise<number> {
    const result = await Notification.deleteMany({ recipient: userId });
    return result.deletedCount;
  }

  /**
   * Obtener todas las notificaciones (admin)
   */
  static async getAllNotifications(
    limit: number = 100,
    skip: number = 0
  ): Promise<INotification[]> {
    return await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('recipient', 'name auth.email')
      .populate('relatedVisit')
      .populate('relatedUser', 'name');
  }

  /**
   * Obtener estadísticas de notificaciones de un usuario
   */
  static async getNotificationStats(userId: Types.ObjectId | string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    const total = await Notification.countDocuments({ recipient: userId });
    const unread = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    const byTypeResult = await Notification.aggregate([
      { $match: { recipient: new Types.ObjectId(userId as string) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const byType: Record<string, number> = {};
    byTypeResult.forEach((item) => {
      byType[item._id] = item.count;
    });

    return { total, unread, byType };
  }
}
