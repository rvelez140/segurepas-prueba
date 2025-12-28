import { accessListController } from '../../../src/controllers/accessListController';
import { AccessListService } from '../../../src/services/AccessListService';
import { ListType } from '../../../src/interfaces/IAccessList';
import { getPaginationOptions } from '../../../src/utils/pagination';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/AccessListService');
jest.mock('../../../src/utils/pagination');

describe('accessListController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToBlacklist', () => {
    it('debería agregar documento a lista negra exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          document: '12345678',
          reason: 'Comportamiento sospechoso',
          notes: 'Incidente reportado por seguridad',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockEntry = {
        _id: mockObjectId(),
        document: '12345678',
        type: ListType.BLACKLIST,
        reason: 'Comportamiento sospechoso',
        status: 'active',
      };

      (AccessListService.addToList as jest.Mock).mockResolvedValue(mockEntry);

      await accessListController.addToBlacklist(req as any, res as any, next);

      expect(AccessListService.addToList).toHaveBeenCalledWith({
        document: '12345678',
        type: ListType.BLACKLIST,
        reason: 'Comportamiento sospechoso',
        expiresAt: undefined,
        notes: 'Incidente reportado por seguridad',
        addedBy: mockUser._id,
        status: 'active',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Documento agregado a lista negra',
        data: mockEntry,
      });
    });

    it('debería agregar con fecha de expiración', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          document: '12345678',
          reason: 'Temporal',
          expiresAt: '2024-12-31',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockEntry = {
        _id: mockObjectId(),
        document: '12345678',
        type: ListType.BLACKLIST,
      };

      (AccessListService.addToList as jest.Mock).mockResolvedValue(mockEntry);

      await accessListController.addToBlacklist(req as any, res as any, next);

      expect(AccessListService.addToList).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
        })
      );
    });

    it('debería retornar 400 si el documento ya existe', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          document: '12345678',
          reason: 'Test',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.addToList as jest.Mock).mockRejectedValue(
        new Error('El documento ya está en la lista negra')
      );

      await accessListController.addToBlacklist(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El documento ya está en la lista negra',
      });
    });

    it('debería manejar otros errores', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          document: '12345678',
          reason: 'Test',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AccessListService.addToList as jest.Mock).mockRejectedValue(error);

      await accessListController.addToBlacklist(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addToWhitelist', () => {
    it('debería agregar documento a lista blanca exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          document: '87654321',
          reason: 'Usuario frecuente',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockEntry = {
        _id: mockObjectId(),
        document: '87654321',
        type: ListType.WHITELIST,
        reason: 'Usuario frecuente',
      };

      (AccessListService.addToList as jest.Mock).mockResolvedValue(mockEntry);

      await accessListController.addToWhitelist(req as any, res as any, next);

      expect(AccessListService.addToList).toHaveBeenCalledWith({
        document: '87654321',
        type: ListType.WHITELIST,
        reason: 'Usuario frecuente',
        expiresAt: undefined,
        notes: undefined,
        addedBy: mockUser._id,
        status: 'active',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Documento agregado a lista blanca',
        data: mockEntry,
      });
    });

    it('debería retornar 400 si el documento ya existe', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          document: '87654321',
          reason: 'Test',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.addToList as jest.Mock).mockRejectedValue(
        new Error('El documento ya está en la lista blanca')
      );

      await accessListController.addToWhitelist(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El documento ya está en la lista blanca',
      });
    });
  });

  describe('removeFromBlacklist', () => {
    it('debería remover documento de lista negra', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockEntry = {
        _id: mockObjectId(),
        document,
        status: 'removed',
      };

      (AccessListService.removeFromList as jest.Mock).mockResolvedValue(mockEntry);

      await accessListController.removeFromBlacklist(req as any, res as any, next);

      expect(AccessListService.removeFromList).toHaveBeenCalledWith(
        document,
        ListType.BLACKLIST
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Documento removido de lista negra',
        data: mockEntry,
      });
    });

    it('debería retornar 404 si el documento no existe', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.removeFromList as jest.Mock).mockResolvedValue(null);

      await accessListController.removeFromBlacklist(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Documento no encontrado en lista negra',
      });
    });

    it('debería manejar errores', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AccessListService.removeFromList as jest.Mock).mockRejectedValue(error);

      await accessListController.removeFromBlacklist(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeFromWhitelist', () => {
    it('debería remover documento de lista blanca', async () => {
      const document = '87654321';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockEntry = {
        _id: mockObjectId(),
        document,
        status: 'removed',
      };

      (AccessListService.removeFromList as jest.Mock).mockResolvedValue(mockEntry);

      await accessListController.removeFromWhitelist(req as any, res as any, next);

      expect(AccessListService.removeFromList).toHaveBeenCalledWith(
        document,
        ListType.WHITELIST
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Documento removido de lista blanca',
        data: mockEntry,
      });
    });

    it('debería retornar 404 si el documento no existe', async () => {
      const document = '87654321';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.removeFromList as jest.Mock).mockResolvedValue(null);

      await accessListController.removeFromWhitelist(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Documento no encontrado en lista blanca',
      });
    });
  });

  describe('getBlacklist', () => {
    it('debería obtener lista negra', async () => {
      const req = mockRequest({
        query: { includeInactive: 'false' },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        entries: [
          { document: '12345678', reason: 'Test' },
          { document: '11111111', reason: 'Test 2' },
        ],
        total: 2,
      };

      const mockPaginationOptions = { page: undefined, limit: undefined, sortBy: undefined, sortOrder: 'desc' };
      (getPaginationOptions as jest.Mock).mockReturnValue(mockPaginationOptions);
      (AccessListService.getList as jest.Mock).mockResolvedValue(mockResult);

      await accessListController.getBlacklist(req as any, res as any, next);

      expect(AccessListService.getList).toHaveBeenCalledWith(
        ListType.BLACKLIST,
        false,
        mockPaginationOptions
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('debería incluir inactivos si se especifica', async () => {
      const req = mockRequest({
        query: { includeInactive: 'true' },
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockPaginationOptions = { page: undefined, limit: undefined, sortBy: undefined, sortOrder: 'desc' };
      (getPaginationOptions as jest.Mock).mockReturnValue(mockPaginationOptions);
      (AccessListService.getList as jest.Mock).mockResolvedValue({ entries: [], total: 0 });

      await accessListController.getBlacklist(req as any, res as any, next);

      expect(AccessListService.getList).toHaveBeenCalledWith(
        ListType.BLACKLIST,
        true,
        mockPaginationOptions
      );
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AccessListService.getList as jest.Mock).mockRejectedValue(error);

      await accessListController.getBlacklist(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getWhitelist', () => {
    it('debería obtener lista blanca', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = jest.fn();

      const mockResult = {
        entries: [{ document: '87654321', reason: 'VIP' }],
        total: 1,
      };

      const mockPaginationOptions = { page: undefined, limit: undefined, sortBy: undefined, sortOrder: 'desc' };
      (getPaginationOptions as jest.Mock).mockReturnValue(mockPaginationOptions);
      (AccessListService.getList as jest.Mock).mockResolvedValue(mockResult);

      await accessListController.getWhitelist(req as any, res as any, next);

      expect(AccessListService.getList).toHaveBeenCalledWith(
        ListType.WHITELIST,
        false,
        mockPaginationOptions
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('checkBlacklist', () => {
    it('debería verificar si documento está en lista negra', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.isBlacklisted as jest.Mock).mockResolvedValue(true);

      await accessListController.checkBlacklist(req as any, res as any, next);

      expect(AccessListService.isBlacklisted).toHaveBeenCalledWith(document);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        document,
        isBlacklisted: true,
        message: 'El documento está en lista negra',
      });
    });

    it('debería retornar false si no está en lista negra', async () => {
      const document = '87654321';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.isBlacklisted as jest.Mock).mockResolvedValue(false);

      await accessListController.checkBlacklist(req as any, res as any, next);

      expect(res.json).toHaveBeenCalledWith({
        document,
        isBlacklisted: false,
        message: 'El documento no está en lista negra',
      });
    });

    it('debería manejar errores', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AccessListService.isBlacklisted as jest.Mock).mockRejectedValue(error);

      await accessListController.checkBlacklist(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('checkWhitelist', () => {
    it('debería verificar si documento está en lista blanca', async () => {
      const document = '87654321';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.isWhitelisted as jest.Mock).mockResolvedValue(true);

      await accessListController.checkWhitelist(req as any, res as any, next);

      expect(AccessListService.isWhitelisted).toHaveBeenCalledWith(document);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        document,
        isWhitelisted: true,
        message: 'El documento está en lista blanca',
      });
    });

    it('debería retornar false si no está en lista blanca', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.isWhitelisted as jest.Mock).mockResolvedValue(false);

      await accessListController.checkWhitelist(req as any, res as any, next);

      expect(res.json).toHaveBeenCalledWith({
        document,
        isWhitelisted: false,
        message: 'El documento no está en lista blanca',
      });
    });
  });

  describe('getStats', () => {
    it('debería obtener estadísticas de listas de acceso', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockStats = {
        blacklist: {
          total: 10,
          active: 8,
          expired: 2,
        },
        whitelist: {
          total: 5,
          active: 5,
          expired: 0,
        },
      };

      (AccessListService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await accessListController.getStats(req as any, res as any, next);

      expect(AccessListService.getStats).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('debería manejar errores al obtener estadísticas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AccessListService.getStats as jest.Mock).mockRejectedValue(error);

      await accessListController.getStats(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('cleanExpired', () => {
    it('debería limpiar entradas expiradas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.cleanExpired as jest.Mock).mockResolvedValue(5);

      await accessListController.cleanExpired(req as any, res as any, next);

      expect(AccessListService.cleanExpired).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se limpiaron 5 entradas expiradas',
        count: 5,
      });
    });

    it('debería retornar 0 si no hay entradas para limpiar', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.cleanExpired as jest.Mock).mockResolvedValue(0);

      await accessListController.cleanExpired(req as any, res as any, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Se limpiaron 0 entradas expiradas',
        count: 0,
      });
    });

    it('debería manejar errores al limpiar', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const error = new Error('Database error');
      (AccessListService.cleanExpired as jest.Mock).mockRejectedValue(error);

      await accessListController.cleanExpired(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
