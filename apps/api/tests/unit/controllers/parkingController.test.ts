import { parkingController } from '../../../src/controllers/parkingController';
import { ParkingService } from '../../../src/services/ParkingService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/ParkingService');
jest.mock('../../../src/utils/pagination');

describe('parkingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSpace', () => {
    it('debería crear espacio de parqueo exitosamente', async () => {
      const req = mockRequest({
        body: {
          number: 'A-101',
          type: 'resident',
          floor: 1,
          section: 'A',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockSpace = {
        _id: mockObjectId(),
        number: 'A-101',
        type: 'resident',
        status: 'available',
      };

      (ParkingService.createSpace as jest.Mock).mockResolvedValue(mockSpace);

      await parkingController.createSpace(req as any, res as any, next);

      expect(ParkingService.createSpace).toHaveBeenCalledWith({
        number: 'A-101',
        type: 'resident',
        floor: 1,
        section: 'A',
        resident: undefined,
        notes: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Espacio de parqueo creado exitosamente',
        data: mockSpace,
      });
    });

    it('debería retornar 400 si el número ya existe', async () => {
      const req = mockRequest({
        body: {
          number: 'A-101',
          type: 'resident',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error: any = new Error('Duplicate key');
      error.code = 11000;

      (ParkingService.createSpace as jest.Mock).mockRejectedValue(error);

      await parkingController.createSpace(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El número de espacio ya existe' });
    });

    it('debería manejar otros errores', async () => {
      const req = mockRequest({
        body: {
          number: 'A-101',
          type: 'resident',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (ParkingService.createSpace as jest.Mock).mockRejectedValue(error);

      await parkingController.createSpace(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllSpaces', () => {
    it('debería obtener todos los espacios de parqueo', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockSpaces = [
        { _id: mockObjectId(), number: 'A-101', status: 'available' },
        { _id: mockObjectId(), number: 'A-102', status: 'occupied' },
      ];

      (ParkingService.getAllSpaces as jest.Mock).mockResolvedValue(mockSpaces);

      await parkingController.getAllSpaces(req as any, res as any, next);

      expect(ParkingService.getAllSpaces).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSpaces);
    });

    it('debería filtrar por tipo y estado', async () => {
      const req = mockRequest({
        query: {
          type: 'visitor',
          status: 'available',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (ParkingService.getAllSpaces as jest.Mock).mockResolvedValue([]);

      await parkingController.getAllSpaces(req as any, res as any, next);

      expect(ParkingService.getAllSpaces).toHaveBeenCalledWith({
        type: 'visitor',
        status: 'available',
      });
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (ParkingService.getAllSpaces as jest.Mock).mockRejectedValue(error);

      await parkingController.getAllSpaces(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAvailableSpaces', () => {
    it('debería obtener espacios disponibles', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockSpaces = [
        { _id: mockObjectId(), number: 'A-101', status: 'available' },
        { _id: mockObjectId(), number: 'B-202', status: 'available' },
      ];

      (ParkingService.getAvailableSpaces as jest.Mock).mockResolvedValue(mockSpaces);

      await parkingController.getAvailableSpaces(req as any, res as any, next);

      expect(ParkingService.getAvailableSpaces).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        total: 2,
        data: mockSpaces,
      });
    });

    it('debería filtrar por tipo', async () => {
      const req = mockRequest({
        query: { type: 'visitor' },
      });
      const res = mockResponse();
      const next = jest.fn();

      (ParkingService.getAvailableSpaces as jest.Mock).mockResolvedValue([]);

      await parkingController.getAvailableSpaces(req as any, res as any, next);

      expect(ParkingService.getAvailableSpaces).toHaveBeenCalledWith('visitor');
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (ParkingService.getAvailableSpaces as jest.Mock).mockRejectedValue(error);

      await parkingController.getAvailableSpaces(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('assignSpace', () => {
    it('debería asignar espacio de parqueo exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          parkingSpaceId: mockObjectId(),
          visitId: mockObjectId(),
          vehiclePlate: 'ABC123',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockAssignment = {
        _id: mockObjectId(),
        parkingSpace: req.body.parkingSpaceId,
        visit: req.body.visitId,
        vehiclePlate: 'ABC123',
      };

      (ParkingService.assignSpace as jest.Mock).mockResolvedValue(mockAssignment);

      await parkingController.assignSpace(req as any, res as any, next);

      expect(ParkingService.assignSpace).toHaveBeenCalledWith({
        parkingSpace: req.body.parkingSpaceId,
        visit: req.body.visitId,
        vehiclePlate: 'ABC123',
        assignedBy: mockUser._id,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Espacio de parqueo asignado exitosamente',
        data: mockAssignment,
      });
    });

    it('debería retornar 400 si el espacio no está disponible', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          parkingSpaceId: mockObjectId(),
          visitId: mockObjectId(),
          vehiclePlate: 'ABC123',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('El espacio no está disponible');
      (ParkingService.assignSpace as jest.Mock).mockRejectedValue(error);

      await parkingController.assignSpace(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El espacio no está disponible' });
    });

    it('debería manejar otros errores', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          parkingSpaceId: mockObjectId(),
          visitId: mockObjectId(),
          vehiclePlate: 'ABC123',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (ParkingService.assignSpace as jest.Mock).mockRejectedValue(error);

      await parkingController.assignSpace(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('recordExit', () => {
    it('debería registrar salida del parqueadero', async () => {
      const assignmentId = mockObjectId().toString();
      const req = mockRequest({
        params: { assignmentId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockAssignment = {
        _id: assignmentId,
        exitTime: new Date(),
      };

      (ParkingService.recordExit as jest.Mock).mockResolvedValue(mockAssignment);

      await parkingController.recordExit(req as any, res as any, next);

      expect(ParkingService.recordExit).toHaveBeenCalledWith(assignmentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Salida registrada exitosamente',
        data: mockAssignment,
      });
    });

    it('debería retornar 404 si la asignación no existe', async () => {
      const assignmentId = mockObjectId().toString();
      const req = mockRequest({
        params: { assignmentId },
      });
      const res = mockResponse();
      const next = jest.fn();

      (ParkingService.recordExit as jest.Mock).mockResolvedValue(null);

      await parkingController.recordExit(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Asignación no encontrada' });
    });

    it('debería manejar errores', async () => {
      const assignmentId = mockObjectId().toString();
      const req = mockRequest({
        params: { assignmentId },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (ParkingService.recordExit as jest.Mock).mockRejectedValue(error);

      await parkingController.recordExit(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getActiveAssignments', () => {
    it('debería obtener asignaciones activas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockAssignments = [
        { _id: mockObjectId(), vehiclePlate: 'ABC123' },
        { _id: mockObjectId(), vehiclePlate: 'XYZ789' },
      ];

      (ParkingService.getActiveAssignments as jest.Mock).mockResolvedValue(mockAssignments);

      await parkingController.getActiveAssignments(req as any, res as any, next);

      expect(ParkingService.getActiveAssignments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        total: 2,
        data: mockAssignments,
      });
    });

    it('debería manejar errores', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (ParkingService.getActiveAssignments as jest.Mock).mockRejectedValue(error);

      await parkingController.getActiveAssignments(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getStats', () => {
    it('debería obtener estadísticas de parqueadero', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockStats = {
        totalSpaces: 100,
        available: 45,
        occupied: 55,
        byType: {
          resident: 80,
          visitor: 20,
        },
      };

      (ParkingService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await parkingController.getStats(req as any, res as any, next);

      expect(ParkingService.getStats).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('debería manejar errores al obtener estadísticas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Stats error');
      (ParkingService.getStats as jest.Mock).mockRejectedValue(error);

      await parkingController.getStats(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
