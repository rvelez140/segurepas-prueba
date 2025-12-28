import { qrLoginController } from '../../../src/controllers/qrLoginController';
import { QRLoginService } from '../../../src/services/QRLoginService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockQRSession } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/QRLoginService');

describe('qrLoginController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQRSession', () => {
    it('debería crear una sesión QR exitosamente', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const sessionData = {
        sessionId: 'test-session-123',
        qrCode: 'data:image/png;base64,test-qr-code',
        expiresAt: new Date(Date.now() + 300000),
      };

      (QRLoginService.createQRSession as jest.Mock).mockResolvedValue(sessionData);

      await qrLoginController.createQRSession(req as any, res as any);

      expect(QRLoginService.createQRSession).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sessionId: sessionData.sessionId,
        qrCode: sessionData.qrCode,
        expiresAt: sessionData.expiresAt,
        message: 'Escanea el código QR con la app móvil para iniciar sesión',
      });
    });

    it('debería manejar errores al crear sesión QR', async () => {
      const req = mockRequest();
      const res = mockResponse();

      (QRLoginService.createQRSession as jest.Mock).mockRejectedValue(
        new Error('Error creando sesión')
      );

      await qrLoginController.createQRSession(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creando sesión' });
    });
  });

  describe('scanQRSession', () => {
    it('debería marcar sesión como escaneada exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.markAsScanned as jest.Mock).mockResolvedValue(undefined);

      await qrLoginController.scanQRSession(req as any, res as any);

      expect(QRLoginService.markAsScanned).toHaveBeenCalledWith(
        'test-session-123',
        mockUser._id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'QR escaneado exitosamente',
        status: 'scanned',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      await qrLoginController.scanQRSession(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si no se proporciona sessionId', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {},
      });
      const res = mockResponse();

      await qrLoginController.scanQRSession(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Session ID requerido' });
    });

    it('debería manejar errores al escanear QR', async () => {
      const req = mockRequest({
        user: mockUser,
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.markAsScanned as jest.Mock).mockRejectedValue(
        new Error('Sesión no encontrada')
      );

      await qrLoginController.scanQRSession(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sesión no encontrada' });
    });
  });

  describe('approveQRLogin', () => {
    it('debería aprobar login QR exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.approveLogin as jest.Mock).mockResolvedValue('test-jwt-token');

      await qrLoginController.approveQRLogin(req as any, res as any);

      expect(QRLoginService.approveLogin).toHaveBeenCalledWith('test-session-123', mockUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login aprobado exitosamente',
        status: 'approved',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      await qrLoginController.approveQRLogin(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si no se proporciona sessionId', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {},
      });
      const res = mockResponse();

      await qrLoginController.approveQRLogin(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Session ID requerido' });
    });

    it('debería manejar errores al aprobar login', async () => {
      const req = mockRequest({
        user: mockUser,
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.approveLogin as jest.Mock).mockRejectedValue(
        new Error('Sesión expirada')
      );

      await qrLoginController.approveQRLogin(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sesión expirada' });
    });
  });

  describe('rejectQRLogin', () => {
    it('debería rechazar login QR exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.rejectLogin as jest.Mock).mockResolvedValue(undefined);

      await qrLoginController.rejectQRLogin(req as any, res as any);

      expect(QRLoginService.rejectLogin).toHaveBeenCalledWith('test-session-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login rechazado',
        status: 'rejected',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      await qrLoginController.rejectQRLogin(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si no se proporciona sessionId', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {},
      });
      const res = mockResponse();

      await qrLoginController.rejectQRLogin(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Session ID requerido' });
    });

    it('debería manejar errores al rechazar login', async () => {
      const req = mockRequest({
        user: mockUser,
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.rejectLogin as jest.Mock).mockRejectedValue(
        new Error('Sesión no encontrada')
      );

      await qrLoginController.rejectQRLogin(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sesión no encontrada' });
    });
  });

  describe('checkSessionStatus', () => {
    it('debería verificar estado de sesión exitosamente', async () => {
      const sessionId = 'test-session-123';
      const req = mockRequest({
        params: { sessionId },
      });
      const res = mockResponse();

      const statusData = {
        status: 'pending',
        expiresAt: new Date(),
      };

      (QRLoginService.checkSessionStatus as jest.Mock).mockResolvedValue(statusData);

      await qrLoginController.checkSessionStatus(req as any, res as any);

      expect(QRLoginService.checkSessionStatus).toHaveBeenCalledWith(sessionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(statusData);
    });

    it('debería retornar 400 si no se proporciona sessionId', async () => {
      const req = mockRequest({
        params: {},
      });
      const res = mockResponse();

      await qrLoginController.checkSessionStatus(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Session ID requerido' });
    });

    it('debería manejar errores al verificar estado', async () => {
      const sessionId = 'test-session-123';
      const req = mockRequest({
        params: { sessionId },
      });
      const res = mockResponse();

      (QRLoginService.checkSessionStatus as jest.Mock).mockRejectedValue(
        new Error('Sesión no encontrada')
      );

      await qrLoginController.checkSessionStatus(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sesión no encontrada' });
    });
  });

  describe('cancelSession', () => {
    it('debería cancelar sesión exitosamente', async () => {
      const req = mockRequest({
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.cancelSession as jest.Mock).mockResolvedValue(undefined);

      await qrLoginController.cancelSession(req as any, res as any);

      expect(QRLoginService.cancelSession).toHaveBeenCalledWith('test-session-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Sesión cancelada',
      });
    });

    it('debería retornar 400 si no se proporciona sessionId', async () => {
      const req = mockRequest({
        body: {},
      });
      const res = mockResponse();

      await qrLoginController.cancelSession(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Session ID requerido' });
    });

    it('debería manejar errores al cancelar sesión', async () => {
      const req = mockRequest({
        body: { sessionId: 'test-session-123' },
      });
      const res = mockResponse();

      (QRLoginService.cancelSession as jest.Mock).mockRejectedValue(
        new Error('Sesión no encontrada')
      );

      await qrLoginController.cancelSession(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sesión no encontrada' });
    });
  });
});
