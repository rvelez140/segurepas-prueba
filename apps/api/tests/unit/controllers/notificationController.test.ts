import { notificationController } from '../../../src/controllers/notificationController';
import { NotificationHistoryService } from '../../../src/services/NotificationHistoryService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockObjectId } from '../../helpers/mockModels';
import { Types } from 'mongoose';

// Mock de servicios
jest.mock('../../../src/services/NotificationHistoryService');

describe('notificationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationsByUser', () => {
    it('debería obtener notificaciones de un usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: { limit: '50', skip: '0' },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockNotifications = [
        { _id: mockObjectId(), type: 'visit', title: 'Nueva visita' },
        { _id: mockObjectId(), type: 'payment', title: 'Pago procesado' },
      ];

      (NotificationHistoryService.getNotificationsByUser as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      await notificationController.getNotificationsByUser(req as any, res as any, next);

      expect(NotificationHistoryService.getNotificationsByUser).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        50,
        0
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificaciones obtenidas exitosamente',
        data: mockNotifications,
      });
    });

    it('debería usar valores por defecto para limit y skip', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.getNotificationsByUser as jest.Mock).mockResolvedValue([]);

      await notificationController.getNotificationsByUser(req as any, res as any, next);

      expect(NotificationHistoryService.getNotificationsByUser).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        50,
        0
      );
    });

    it('debería manejar errores al obtener notificaciones', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (NotificationHistoryService.getNotificationsByUser as jest.Mock).mockRejectedValue(error);

      await notificationController.getNotificationsByUser(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUnreadNotifications', () => {
    it('debería obtener notificaciones no leídas', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockNotifications = [
        { _id: mockObjectId(), read: false, title: 'Notificación 1' },
        { _id: mockObjectId(), read: false, title: 'Notificación 2' },
      ];

      (NotificationHistoryService.getUnreadNotifications as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      await notificationController.getUnreadNotifications(req as any, res as any, next);

      expect(NotificationHistoryService.getUnreadNotifications).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificaciones no leídas obtenidas exitosamente',
        data: mockNotifications,
      });
    });

    it('debería manejar errores al obtener notificaciones no leídas', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (NotificationHistoryService.getUnreadNotifications as jest.Mock).mockRejectedValue(error);

      await notificationController.getUnreadNotifications(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUnreadCount', () => {
    it('debería obtener conteo de notificaciones no leídas', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.getUnreadCount as jest.Mock).mockResolvedValue(5);

      await notificationController.getUnreadCount(req as any, res as any, next);

      expect(NotificationHistoryService.getUnreadCount).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conteo obtenido exitosamente',
        data: { count: 5 },
      });
    });

    it('debería retornar 0 si no hay notificaciones no leídas', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.getUnreadCount as jest.Mock).mockResolvedValue(0);

      await notificationController.getUnreadCount(req as any, res as any, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Conteo obtenido exitosamente',
        data: { count: 0 },
      });
    });

    it('debería manejar errores al obtener conteo', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (NotificationHistoryService.getUnreadCount as jest.Mock).mockRejectedValue(error);

      await notificationController.getUnreadCount(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('markAsRead', () => {
    it('debería marcar notificación como leída', async () => {
      const notificationId = mockObjectId().toString();
      const req = mockRequest({
        params: { notificationId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockNotification = {
        _id: notificationId,
        read: true,
        readAt: new Date(),
      };

      (NotificationHistoryService.markAsRead as jest.Mock).mockResolvedValue(mockNotification);

      await notificationController.markAsRead(req as any, res as any, next);

      expect(NotificationHistoryService.markAsRead).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificación marcada como leída',
        data: mockNotification,
      });
    });

    it('debería retornar 404 si la notificación no existe', async () => {
      const notificationId = mockObjectId().toString();
      const req = mockRequest({
        params: { notificationId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.markAsRead as jest.Mock).mockResolvedValue(null);

      await notificationController.markAsRead(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notificación no encontrada' });
    });

    it('debería manejar errores al marcar como leída', async () => {
      const notificationId = mockObjectId().toString();
      const req = mockRequest({
        params: { notificationId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (NotificationHistoryService.markAsRead as jest.Mock).mockRejectedValue(error);

      await notificationController.markAsRead(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('markAllAsRead', () => {
    it('debería marcar todas las notificaciones como leídas', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.markAllAsRead as jest.Mock).mockResolvedValue(10);

      await notificationController.markAllAsRead(req as any, res as any, next);

      expect(NotificationHistoryService.markAllAsRead).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todas las notificaciones marcadas como leídas',
        data: { modifiedCount: 10 },
      });
    });

    it('debería retornar 0 si no hay notificaciones para marcar', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.markAllAsRead as jest.Mock).mockResolvedValue(0);

      await notificationController.markAllAsRead(req as any, res as any, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Todas las notificaciones marcadas como leídas',
        data: { modifiedCount: 0 },
      });
    });

    it('debería manejar errores al marcar todas como leídas', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (NotificationHistoryService.markAllAsRead as jest.Mock).mockRejectedValue(error);

      await notificationController.markAllAsRead(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteNotification', () => {
    it('debería eliminar notificación exitosamente', async () => {
      const notificationId = mockObjectId().toString();
      const req = mockRequest({
        params: { notificationId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (NotificationHistoryService.deleteNotification as jest.Mock).mockResolvedValue(undefined);

      await notificationController.deleteNotification(req as any, res as any, next);

      expect(NotificationHistoryService.deleteNotification).toHaveBeenCalledWith(
        expect.any(Types.ObjectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificación eliminada exitosamente',
      });
    });

    it('debería manejar errores al eliminar notificación', async () => {
      const notificationId = mockObjectId().toString();
      const req = mockRequest({
        params: { notificationId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Notification not found');
      (NotificationHistoryService.deleteNotification as jest.Mock).mockRejectedValue(error);

      await notificationController.deleteNotification(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getNotificationsByType', () => {
    it('debería obtener notificaciones por tipo', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: { type: 'visit', limit: '50' },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockNotifications = [
        { _id: mockObjectId(), type: 'visit', title: 'Visita autorizada' },
      ];

      (NotificationHistoryService.getNotificationsByType as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      await notificationController.getNotificationsByType(req as any, res as any, next);

      expect(NotificationHistoryService.getNotificationsByType).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        'visit',
        50
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificaciones por tipo obtenidas exitosamente',
        data: mockNotifications,
      });
    });

    it('debería retornar 400 si el tipo es inválido', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: { type: 'invalid_type' },
      });
      const res = mockResponse();
      const next = jest.fn();

      await notificationController.getNotificationsByType(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tipo de notificación inválido' });
    });

    it('debería retornar 400 si no se proporciona tipo', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      await notificationController.getNotificationsByType(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tipo de notificación inválido' });
    });
  });
});
