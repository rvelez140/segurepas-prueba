import { auditController } from '../../../src/controllers/auditController';
import { AuditLogService } from '../../../src/services/AuditLogService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/AuditLogService');

describe('auditController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLogs', () => {
    it('debería obtener logs de auditoría con filtros', async () => {
      const req = mockRequest({
        query: {
          action: 'login',
          userId: mockObjectId().toString(),
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          severity: 'info',
          success: 'true',
          page: '1',
          limit: '10',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        logs: [
          { _id: mockObjectId(), action: 'login', success: true },
          { _id: mockObjectId(), action: 'login', success: true },
        ],
        total: 50,
        page: 1,
        totalPages: 5,
      };

      (AuditLogService.getLogs as jest.Mock).mockResolvedValue(mockResult);

      await auditController.getLogs(req as any, res as any, next);

      expect(AuditLogService.getLogs).toHaveBeenCalledWith({
        action: 'login',
        userId: expect.anything(),
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        severity: 'info',
        success: true,
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('debería obtener logs sin filtros', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        logs: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      (AuditLogService.getLogs as jest.Mock).mockResolvedValue(mockResult);

      await auditController.getLogs(req as any, res as any, next);

      expect(AuditLogService.getLogs).toHaveBeenCalledWith({
        action: undefined,
        userId: undefined,
        startDate: undefined,
        endDate: undefined,
        severity: undefined,
        success: undefined,
        page: undefined,
        limit: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debería manejar errores al obtener logs', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AuditLogService.getLogs as jest.Mock).mockRejectedValue(error);

      await auditController.getLogs(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getStats', () => {
    it('debería obtener estadísticas de auditoría', async () => {
      const req = mockRequest({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockStats = {
        totalLogs: 1000,
        successfulActions: 950,
        failedActions: 50,
        byAction: {
          login: 500,
          logout: 400,
          create: 100,
        },
        bySeverity: {
          info: 900,
          warning: 80,
          error: 20,
        },
      };

      (AuditLogService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await auditController.getStats(req as any, res as any, next);

      expect(AuditLogService.getStats).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('debería obtener estadísticas sin fechas', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockStats = {
        totalLogs: 5000,
        successfulActions: 4500,
        failedActions: 500,
      };

      (AuditLogService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await auditController.getStats(req as any, res as any, next);

      expect(AuditLogService.getStats).toHaveBeenCalledWith(undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debería manejar errores al obtener estadísticas', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AuditLogService.getStats as jest.Mock).mockRejectedValue(error);

      await auditController.getStats(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserLogs', () => {
    it('debería obtener logs de un usuario específico', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: { page: '1', limit: '20' },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        logs: [
          { _id: mockObjectId(), action: 'login', userId },
          { _id: mockObjectId(), action: 'logout', userId },
        ],
        total: 100,
        page: 1,
        totalPages: 5,
      };

      (AuditLogService.getLogs as jest.Mock).mockResolvedValue(mockResult);

      await auditController.getUserLogs(req as any, res as any, next);

      expect(AuditLogService.getLogs).toHaveBeenCalledWith({
        userId: expect.anything(),
        page: 1,
        limit: 20,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('debería obtener logs de usuario sin paginación', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        logs: [],
        total: 0,
      };

      (AuditLogService.getLogs as jest.Mock).mockResolvedValue(mockResult);

      await auditController.getUserLogs(req as any, res as any, next);

      expect(AuditLogService.getLogs).toHaveBeenCalledWith({
        userId: expect.anything(),
        page: undefined,
        limit: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debería manejar errores al obtener logs de usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('User not found');
      (AuditLogService.getLogs as jest.Mock).mockRejectedValue(error);

      await auditController.getUserLogs(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getFailedActions', () => {
    it('debería obtener acciones fallidas', async () => {
      const req = mockRequest({
        query: {
          page: '1',
          limit: '10',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        logs: [
          { _id: mockObjectId(), action: 'login', success: false },
          { _id: mockObjectId(), action: 'create', success: false },
        ],
        total: 50,
        page: 1,
        totalPages: 5,
      };

      (AuditLogService.getLogs as jest.Mock).mockResolvedValue(mockResult);

      await auditController.getFailedActions(req as any, res as any, next);

      expect(AuditLogService.getLogs).toHaveBeenCalledWith({
        success: false,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('debería obtener acciones fallidas sin filtros de fecha', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        logs: [],
        total: 0,
      };

      (AuditLogService.getLogs as jest.Mock).mockResolvedValue(mockResult);

      await auditController.getFailedActions(req as any, res as any, next);

      expect(AuditLogService.getLogs).toHaveBeenCalledWith({
        success: false,
        startDate: undefined,
        endDate: undefined,
        page: undefined,
        limit: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debería manejar errores al obtener acciones fallidas', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AuditLogService.getLogs as jest.Mock).mockRejectedValue(error);

      await auditController.getFailedActions(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('cleanOldLogs', () => {
    it('debería limpiar logs antiguos con días especificados', async () => {
      const req = mockRequest({
        query: { days: '30' },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AuditLogService.cleanOldLogs as jest.Mock).mockResolvedValue(150);

      await auditController.cleanOldLogs(req as any, res as any, next);

      expect(AuditLogService.cleanOldLogs).toHaveBeenCalledWith(30);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se eliminaron 150 logs de auditoría',
        deletedCount: 150,
      });
    });

    it('debería usar 90 días por defecto', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      (AuditLogService.cleanOldLogs as jest.Mock).mockResolvedValue(500);

      await auditController.cleanOldLogs(req as any, res as any, next);

      expect(AuditLogService.cleanOldLogs).toHaveBeenCalledWith(90);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se eliminaron 500 logs de auditoría',
        deletedCount: 500,
      });
    });

    it('debería manejar el caso sin logs para eliminar', async () => {
      const req = mockRequest({
        query: { days: '7' },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AuditLogService.cleanOldLogs as jest.Mock).mockResolvedValue(0);

      await auditController.cleanOldLogs(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se eliminaron 0 logs de auditoría',
        deletedCount: 0,
      });
    });

    it('debería manejar errores al limpiar logs', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AuditLogService.cleanOldLogs as jest.Mock).mockRejectedValue(error);

      await auditController.cleanOldLogs(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
