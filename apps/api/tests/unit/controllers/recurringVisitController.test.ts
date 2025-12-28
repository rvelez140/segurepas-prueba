import { recurringVisitController } from '../../../src/controllers/recurringVisitController';
import { RecurringVisitService } from '../../../src/services/RecurringVisitService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/RecurringVisitService');

describe('recurringVisitController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear visita recurrente como residente', async () => {
      const residentUser = {
        ...mockUser,
        role: 'residente',
      };

      const req = mockRequest({
        user: residentUser,
        body: {
          visitorName: 'Juan Pérez',
          visitorDocument: '12345678',
          visitReason: 'Trabajo',
          pattern: 'daily',
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockRecurringVisit = {
        _id: mockObjectId(),
        resident: residentUser._id,
        visitorName: 'Juan Pérez',
        pattern: 'daily',
      };

      (RecurringVisitService.create as jest.Mock).mockResolvedValue(mockRecurringVisit);

      await recurringVisitController.create(req as any, res as any, next);

      expect(RecurringVisitService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resident: residentUser._id,
          visitorName: 'Juan Pérez',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Visita recurrente creada exitosamente',
        data: mockRecurringVisit,
      });
    });

    it('debería crear visita recurrente como admin especificando residente', async () => {
      const adminUser = {
        ...mockUser,
        role: 'admin',
      };

      const residentId = mockObjectId();

      const req = mockRequest({
        user: adminUser,
        body: {
          resident: residentId,
          visitorName: 'María García',
          visitorDocument: '87654321',
          pattern: 'weekly',
          daysOfWeek: [1, 3, 5],
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockRecurringVisit = {
        _id: mockObjectId(),
        resident: residentId,
      };

      (RecurringVisitService.create as jest.Mock).mockResolvedValue(mockRecurringVisit);

      await recurringVisitController.create(req as any, res as any, next);

      expect(RecurringVisitService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resident: residentId,
        })
      );
    });

    it('debería manejar errores al crear visita recurrente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          visitorName: 'Test',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Validation error');
      (RecurringVisitService.create as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.create(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMyRecurring', () => {
    it('debería obtener visitas recurrentes del usuario autenticado', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockVisits = [
        { _id: mockObjectId(), visitorName: 'Juan', pattern: 'daily' },
        { _id: mockObjectId(), visitorName: 'María', pattern: 'weekly' },
      ];

      (RecurringVisitService.getByResident as jest.Mock).mockResolvedValue(mockVisits);

      await recurringVisitController.getMyRecurring(req as any, res as any, next);

      expect(RecurringVisitService.getByResident).toHaveBeenCalledWith(mockUser._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisits);
    });

    it('debería manejar errores al obtener visitas', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (RecurringVisitService.getByResident as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.getMyRecurring(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getByResident', () => {
    it('debería obtener visitas de un residente específico', async () => {
      const residentId = mockObjectId().toString();
      const req = mockRequest({
        params: { residentId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockVisits = [
        { _id: mockObjectId(), visitorName: 'Test 1' },
      ];

      (RecurringVisitService.getByResident as jest.Mock).mockResolvedValue(mockVisits);

      await recurringVisitController.getByResident(req as any, res as any, next);

      expect(RecurringVisitService.getByResident).toHaveBeenCalledWith(residentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisits);
    });

    it('debería manejar errores', async () => {
      const residentId = mockObjectId().toString();
      const req = mockRequest({
        params: { residentId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Resident not found');
      (RecurringVisitService.getByResident as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.getByResident(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllActive', () => {
    it('debería obtener todas las visitas recurrentes activas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockVisits = [
        { _id: mockObjectId(), isActive: true },
        { _id: mockObjectId(), isActive: true },
      ];

      (RecurringVisitService.getAllActive as jest.Mock).mockResolvedValue(mockVisits);

      await recurringVisitController.getAllActive(req as any, res as any, next);

      expect(RecurringVisitService.getAllActive).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisits);
    });

    it('debería manejar errores', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (RecurringVisitService.getAllActive as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.getAllActive(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('debería actualizar visita recurrente exitosamente', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: visitId },
        body: {
          visitorName: 'Juan Actualizado',
          pattern: 'weekly',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockUpdated = {
        _id: visitId,
        visitorName: 'Juan Actualizado',
        pattern: 'weekly',
      };

      (RecurringVisitService.update as jest.Mock).mockResolvedValue(mockUpdated);

      await recurringVisitController.update(req as any, res as any, next);

      expect(RecurringVisitService.update).toHaveBeenCalledWith(visitId, {
        visitorName: 'Juan Actualizado',
        pattern: 'weekly',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Visita recurrente actualizada',
        data: mockUpdated,
      });
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: visitId },
        body: { visitorName: 'Test' },
      });
      const res = mockResponse();
      const next = jest.fn();

      (RecurringVisitService.update as jest.Mock).mockResolvedValue(null);

      await recurringVisitController.update(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Visita recurrente no encontrada' });
    });

    it('debería manejar errores al actualizar', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: visitId },
        body: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Update error');
      (RecurringVisitService.update as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.update(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deactivate', () => {
    it('debería desactivar visita recurrente exitosamente', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: visitId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockDeactivated = {
        _id: visitId,
        isActive: false,
      };

      (RecurringVisitService.deactivate as jest.Mock).mockResolvedValue(mockDeactivated);

      await recurringVisitController.deactivate(req as any, res as any, next);

      expect(RecurringVisitService.deactivate).toHaveBeenCalledWith(visitId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Visita recurrente desactivada',
        data: mockDeactivated,
      });
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: visitId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (RecurringVisitService.deactivate as jest.Mock).mockResolvedValue(null);

      await recurringVisitController.deactivate(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Visita recurrente no encontrada' });
    });

    it('debería manejar errores al desactivar', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: visitId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Deactivate error');
      (RecurringVisitService.deactivate as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.deactivate(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('generateNow', () => {
    it('debería generar visitas programadas manualmente', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        generated: 5,
        errors: 0,
      };

      (RecurringVisitService.generateScheduledVisits as jest.Mock).mockResolvedValue(mockResult);

      await recurringVisitController.generateNow(req as any, res as any, next);

      expect(RecurringVisitService.generateScheduledVisits).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Generación completada',
        generated: 5,
        errors: 0,
      });
    });

    it('debería manejar errores al generar visitas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Generation error');
      (RecurringVisitService.generateScheduledVisits as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.generateNow(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getStats', () => {
    it('debería obtener estadísticas de visitas recurrentes', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockStats = {
        total: 50,
        active: 45,
        inactive: 5,
        byPattern: {
          daily: 20,
          weekly: 15,
          monthly: 10,
        },
      };

      (RecurringVisitService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await recurringVisitController.getStats(req as any, res as any, next);

      expect(RecurringVisitService.getStats).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('debería manejar errores al obtener estadísticas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Stats error');
      (RecurringVisitService.getStats as jest.Mock).mockRejectedValue(error);

      await recurringVisitController.getStats(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
