import { userController } from '../../../src/controllers/userController';
import { UserService } from '../../../src/services/UserService';
import { StorageService } from '../../../src/services/StorageService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/UserService');
jest.mock('../../../src/services/StorageService');

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResidents', () => {
    it('debería obtener todos los residentes exitosamente', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockResidents = [
        {
          ...mockUser,
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
          document: '12345678',
          vehiclePlate: 'ABC123',
        },
        {
          ...mockUser,
          _id: mockObjectId(),
          name: 'Maria Garcia',
          role: 'residente',
          apartment: 'B202',
          tel: '555-5678',
          document: '87654321',
          vehiclePlate: 'XYZ789',
        },
      ];

      (UserService.getUsersByRole as jest.Mock).mockResolvedValue(mockResidents);

      await userController.getResidents(req as any, res as any, next);

      expect(UserService.getUsersByRole).toHaveBeenCalledWith('residente');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.anything(),
            name: expect.any(String),
            email: expect.any(String),
            apartment: expect.any(String),
            tel: expect.any(String),
          }),
        ])
      );
    });

    it('debería manejar errores al obtener residentes', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (UserService.getUsersByRole as jest.Mock).mockRejectedValue(error);

      await userController.getResidents(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getGuards', () => {
    it('debería obtener todos los guardias exitosamente', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockGuards = [
        {
          ...mockUser,
          role: 'guardia',
          shift: 'mañana',
        },
        {
          ...mockUser,
          _id: mockObjectId(),
          name: 'Carlos Ruiz',
          role: 'guardia',
          shift: 'noche',
        },
      ];

      (UserService.getUsersByRole as jest.Mock).mockResolvedValue(mockGuards);

      await userController.getGuards(req as any, res as any, next);

      expect(UserService.getUsersByRole).toHaveBeenCalledWith('guardia');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.anything(),
            name: expect.any(String),
            email: expect.any(String),
            shift: expect.any(String),
          }),
        ])
      );
    });

    it('debería manejar errores al obtener guardias', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (UserService.getUsersByRole as jest.Mock).mockRejectedValue(error);

      await userController.getGuards(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAdmins', () => {
    it('debería obtener todos los administradores exitosamente', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockAdmins = [
        {
          ...mockUser,
          role: 'admin',
          lastAccess: new Date(),
        },
      ];

      (UserService.getUsersByRole as jest.Mock).mockResolvedValue(mockAdmins);

      await userController.getAdmins(req as any, res as any, next);

      expect(UserService.getUsersByRole).toHaveBeenCalledWith('admin');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.anything(),
            name: expect.any(String),
            email: expect.any(String),
          }),
        ])
      );
    });

    it('debería manejar errores al obtener administradores', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (UserService.getUsersByRole as jest.Mock).mockRejectedValue(error);

      await userController.getAdmins(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUser', () => {
    it('debería obtener un usuario por ID', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();

      (UserService.findById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUser(req as any, res as any, next);

      expect(UserService.findById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('debería manejar errores al obtener usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('User not found');

      (UserService.findById as jest.Mock).mockRejectedValue(error);

      await userController.getUser(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllUsers', () => {
    it('debería obtener todos los usuarios con sus propiedades específicas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockUsers = [
        {
          ...mockUser,
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
          document: '12345678',
          vehiclePlate: 'ABC123',
        },
        {
          ...mockUser,
          _id: mockObjectId(),
          role: 'guardia',
          shift: 'mañana',
        },
        {
          ...mockUser,
          _id: mockObjectId(),
          role: 'admin',
          lastAccess: new Date(),
        },
      ];

      (UserService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getAllUsers(req as any, res as any, next);

      expect(UserService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.anything(),
            name: expect.any(String),
            email: expect.any(String),
            role: expect.any(String),
          }),
        ])
      );
    });

    it('debería manejar errores al obtener todos los usuarios', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (UserService.getAllUsers as jest.Mock).mockRejectedValue(error);

      await userController.getAllUsers(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('debería actualizar un usuario residente exitosamente', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          name: 'Juan Updated',
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
          document: '12345678',
          vehiclePlate: 'ABC123',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      const updatedUser = {
        ...mockUser,
        name: 'Juan Updated',
        role: 'residente',
        apartment: 'A101',
        tel: '555-1234',
        document: '12345678',
        vehiclePlate: 'ABC123',
      };

      (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      await userController.updateUser(req as any, res as any, next);

      expect(UserService.updateUser).toHaveBeenCalledWith(userId, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.anything(),
          name: 'Juan Updated',
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
        })
      );
    });

    it('debería rechazar actualización de residente sin apartamento', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          role: 'residente',
          tel: '555-1234',
          document: '12345678',
          vehiclePlate: 'ABC123',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      await userController.updateUser(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Apartamento y teléfono son requeridos para residentes',
      });
    });

    it('debería rechazar actualización de residente sin documento', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
          vehiclePlate: 'ABC123',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      await userController.updateUser(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Documento de identidad es requerido para residentes',
      });
    });

    it('debería rechazar actualización de residente sin placa', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
          document: '12345678',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      await userController.updateUser(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Placa del vehículo es requerida para residentes',
      });
    });

    it('debería rechazar actualización de guardia sin turno', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          role: 'guardia',
          name: 'Guard Updated',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      await userController.updateUser(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Turno es requerido para guardias',
      });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          name: 'Test',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (UserService.updateUser as jest.Mock).mockResolvedValue(null);

      await userController.updateUser(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debería manejar errores al actualizar usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        body: {
          name: 'Test',
        },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (UserService.updateUser as jest.Mock).mockRejectedValue(error);

      await userController.updateUser(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();

      (UserService.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      await userController.deleteUser(req as any, res as any, next);

      expect(UserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario eliminado correctamente',
          user: expect.objectContaining({
            _id: mockUser._id,
            name: mockUser.name,
          }),
        })
      );
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();

      (UserService.deleteUser as jest.Mock).mockResolvedValue(null);

      await userController.deleteUser(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debería manejar errores al eliminar usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (UserService.deleteUser as jest.Mock).mockRejectedValue(error);

      await userController.deleteUser(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadDocumentImage', () => {
    it('debería subir imagen de documento exitosamente', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const updatedUser = {
        ...mockUser,
        role: 'residente',
        documentImage: 'https://storage.com/document.jpg',
      };

      (StorageService.uploadUserDocumentImage as jest.Mock).mockResolvedValue(updatedUser);

      await userController.uploadDocumentImage(req as any, res as any, next);

      expect(StorageService.uploadUserDocumentImage).toHaveBeenCalledWith(
        userId,
        expect.any(Buffer)
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen de documento subida correctamente',
        documentImage: 'https://storage.com/document.jpg',
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      await userController.uploadDocumentImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se recibió ninguna imagen' });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      (StorageService.uploadUserDocumentImage as jest.Mock).mockResolvedValue(null);

      await userController.uploadDocumentImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debería manejar errores al subir imagen', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Storage error');

      (StorageService.uploadUserDocumentImage as jest.Mock).mockRejectedValue(error);

      await userController.uploadDocumentImage(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadVehiclePlateImage', () => {
    it('debería subir imagen de placa exitosamente', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const updatedUser = {
        ...mockUser,
        role: 'residente',
        vehiclePlateImage: 'https://storage.com/plate.jpg',
      };

      (StorageService.uploadUserVehiclePlateImage as jest.Mock).mockResolvedValue(updatedUser);

      await userController.uploadVehiclePlateImage(req as any, res as any, next);

      expect(StorageService.uploadUserVehiclePlateImage).toHaveBeenCalledWith(
        userId,
        expect.any(Buffer)
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen de placa subida correctamente',
        vehiclePlateImage: 'https://storage.com/plate.jpg',
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
      });
      const res = mockResponse();
      const next = jest.fn();

      await userController.uploadVehiclePlateImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se recibió ninguna imagen' });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      (StorageService.uploadUserVehiclePlateImage as jest.Mock).mockResolvedValue(null);

      await userController.uploadVehiclePlateImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debería manejar errores al subir imagen', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { id: userId },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Storage error');

      (StorageService.uploadUserVehiclePlateImage as jest.Mock).mockRejectedValue(error);

      await userController.uploadVehiclePlateImage(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUserImages', () => {
    it('debería eliminar imágenes de usuario exitosamente', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();

      const result = { success: true, message: 'Imágenes eliminadas' };

      (StorageService.deleteUserImages as jest.Mock).mockResolvedValue(result);

      await userController.deleteUserImages(req as any, res as any, next);

      expect(StorageService.deleteUserImages).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería manejar errores al eliminar imágenes', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({ params: { id: userId } });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Storage error');

      (StorageService.deleteUserImages as jest.Mock).mockRejectedValue(error);

      await userController.deleteUserImages(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
