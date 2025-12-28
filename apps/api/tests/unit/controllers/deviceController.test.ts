import { deviceController } from '../../../src/controllers/deviceController';
import { DeviceService } from '../../../src/services/DeviceService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockDevice, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/DeviceService');

describe('deviceController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDevices', () => {
    it('debería obtener todos los dispositivos del usuario', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      const mockDevices = [
        mockDevice,
        { ...mockDevice, _id: mockObjectId(), deviceName: 'iPhone 12' },
      ];

      (DeviceService.getUserDevices as jest.Mock).mockResolvedValue(mockDevices);

      await deviceController.getUserDevices(req as any, res as any);

      expect(DeviceService.getUserDevices).toHaveBeenCalledWith(mockUser._id.toString());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        devices: mockDevices,
        total: 2,
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await deviceController.getUserDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al obtener dispositivos', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      (DeviceService.getUserDevices as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await deviceController.getUserDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateDeviceName', () => {
    it('debería actualizar el nombre del dispositivo exitosamente', async () => {
      const deviceId = mockObjectId().toString();
      const req = mockRequest({
        user: mockUser,
        params: { deviceId },
        body: { deviceName: 'Mi iPhone Personal' },
      });
      const res = mockResponse();

      const updatedDevice = {
        ...mockDevice,
        deviceName: 'Mi iPhone Personal',
      };

      (DeviceService.updateDeviceName as jest.Mock).mockResolvedValue(updatedDevice);

      await deviceController.updateDeviceName(req as any, res as any);

      expect(DeviceService.updateDeviceName).toHaveBeenCalledWith(
        deviceId,
        mockUser._id.toString(),
        'Mi iPhone Personal'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nombre de dispositivo actualizado',
        device: updatedDevice,
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        params: { deviceId: mockObjectId().toString() },
        body: { deviceName: 'Test Device' },
      });
      const res = mockResponse();

      await deviceController.updateDeviceName(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si no se proporciona nombre', async () => {
      const req = mockRequest({
        user: mockUser,
        params: { deviceId: mockObjectId().toString() },
        body: {},
      });
      const res = mockResponse();

      await deviceController.updateDeviceName(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nombre de dispositivo requerido' });
    });

    it('debería manejar errores al actualizar nombre', async () => {
      const deviceId = mockObjectId().toString();
      const req = mockRequest({
        user: mockUser,
        params: { deviceId },
        body: { deviceName: 'Test Device' },
      });
      const res = mockResponse();

      (DeviceService.updateDeviceName as jest.Mock).mockRejectedValue(
        new Error('Dispositivo no encontrado')
      );

      await deviceController.updateDeviceName(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Dispositivo no encontrado' });
    });
  });

  describe('deactivateDevice', () => {
    it('debería desactivar un dispositivo exitosamente', async () => {
      const deviceId = mockObjectId().toString();
      const req = mockRequest({
        user: mockUser,
        params: { deviceId },
      });
      const res = mockResponse();

      (DeviceService.deactivateDevice as jest.Mock).mockResolvedValue(undefined);

      await deviceController.deactivateDevice(req as any, res as any);

      expect(DeviceService.deactivateDevice).toHaveBeenCalledWith(
        deviceId,
        mockUser._id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dispositivo desactivado exitosamente',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        params: { deviceId: mockObjectId().toString() },
      });
      const res = mockResponse();

      await deviceController.deactivateDevice(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al desactivar dispositivo', async () => {
      const deviceId = mockObjectId().toString();
      const req = mockRequest({
        user: mockUser,
        params: { deviceId },
      });
      const res = mockResponse();

      (DeviceService.deactivateDevice as jest.Mock).mockRejectedValue(
        new Error('Dispositivo no encontrado')
      );

      await deviceController.deactivateDevice(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Dispositivo no encontrado' });
    });
  });

  describe('deactivateOtherDevices', () => {
    it('debería desactivar todos los demás dispositivos', async () => {
      const currentDeviceId = mockObjectId().toString();
      const req = mockRequest({
        user: mockUser,
        deviceId: currentDeviceId,
      });
      const res = mockResponse();

      (DeviceService.deactivateOtherDevices as jest.Mock).mockResolvedValue(undefined);

      await deviceController.deactivateOtherDevices(req as any, res as any);

      expect(DeviceService.deactivateOtherDevices).toHaveBeenCalledWith(
        mockUser._id.toString(),
        currentDeviceId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos los demás dispositivos han sido desactivados',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        deviceId: mockObjectId().toString(),
      });
      const res = mockResponse();

      await deviceController.deactivateOtherDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al desactivar dispositivos', async () => {
      const req = mockRequest({
        user: mockUser,
        deviceId: mockObjectId().toString(),
      });
      const res = mockResponse();

      (DeviceService.deactivateOtherDevices as jest.Mock).mockRejectedValue(
        new Error('Error al desactivar')
      );

      await deviceController.deactivateOtherDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al desactivar' });
    });
  });

  describe('getDeviceStats', () => {
    it('debería obtener estadísticas de dispositivos', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      const mockStats = {
        total: 5,
        active: 3,
        inactive: 2,
        byType: {
          web: 2,
          mobile: 2,
          desktop: 1,
        },
      };

      (DeviceService.getDeviceStats as jest.Mock).mockResolvedValue(mockStats);

      await deviceController.getDeviceStats(req as any, res as any);

      expect(DeviceService.getDeviceStats).toHaveBeenCalledWith(mockUser._id.toString());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await deviceController.getDeviceStats(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al obtener estadísticas', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      (DeviceService.getDeviceStats as jest.Mock).mockRejectedValue(
        new Error('Error al obtener estadísticas')
      );

      await deviceController.getDeviceStats(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener estadísticas' });
    });
  });

  describe('cleanupInactiveDevices', () => {
    it('debería limpiar dispositivos inactivos (admin)', async () => {
      const adminUser = {
        ...mockUser,
        role: 'admin',
      };

      const req = mockRequest({
        user: adminUser,
      });
      const res = mockResponse();

      (DeviceService.cleanupInactiveDevices as jest.Mock).mockResolvedValue(10);

      await deviceController.cleanupInactiveDevices(req as any, res as any);

      expect(DeviceService.cleanupInactiveDevices).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dispositivos inactivos eliminados',
        deletedCount: 10,
      });
    });

    it('debería retornar 403 si el usuario no es admin', async () => {
      const req = mockRequest({
        user: mockUser, // role: 'residente'
      });
      const res = mockResponse();

      await deviceController.cleanupInactiveDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado' });
    });

    it('debería retornar 403 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await deviceController.cleanupInactiveDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado' });
    });

    it('debería manejar errores al limpiar dispositivos', async () => {
      const adminUser = {
        ...mockUser,
        role: 'admin',
      };

      const req = mockRequest({
        user: adminUser,
      });
      const res = mockResponse();

      (DeviceService.cleanupInactiveDevices as jest.Mock).mockRejectedValue(
        new Error('Error al limpiar')
      );

      await deviceController.cleanupInactiveDevices(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al limpiar' });
    });
  });
});
