import { authController } from '../../../src/controllers/authController';
import { UserService } from '../../../src/services/UserService';
import { AuditLogService } from '../../../src/services/AuditLogService';
import { DeviceService } from '../../../src/services/DeviceService';
import { TwoFactorService } from '../../../src/services/TwoFactorService';
import User from '../../../src/models/User';
import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/UserService');
jest.mock('../../../src/services/AuditLogService');
jest.mock('../../../src/services/DeviceService');
jest.mock('../../../src/services/TwoFactorService');
jest.mock('../../../src/models/User');
jest.mock('jsonwebtoken');

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('debería registrar un usuario residente exitosamente', async () => {
      const req = mockRequest({
        body: {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'password123',
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
        },
      });
      const res = mockResponse();

      const newUser = {
        ...mockUser,
        name: 'Juan Pérez',
        auth: { email: 'juan@example.com' },
        role: 'residente',
      };

      (UserService.createUser as jest.Mock).mockResolvedValue(newUser);

      await authController.registerUser(req as any, res as any);

      expect(UserService.createUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario registrado exitosamente',
        })
      );
    });

    it('debería rechazar registro de residente sin apartamento', async () => {
      const req = mockRequest({
        body: {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'password123',
          role: 'residente',
          tel: '555-1234',
        },
      });
      const res = mockResponse();

      await authController.registerUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Apartamento y teléfono son requeridos para residentes',
      });
    });

    it('debería rechazar registro de guardia sin turno', async () => {
      const req = mockRequest({
        body: {
          name: 'Pedro García',
          email: 'pedro@example.com',
          password: 'password123',
          role: 'guardia',
        },
      });
      const res = mockResponse();

      await authController.registerUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Turno es requerido para guardias',
      });
    });

    it('debería manejar errores de usuario duplicado', async () => {
      const req = mockRequest({
        body: {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'password123',
          role: 'residente',
          apartment: 'A101',
          tel: '555-1234',
        },
      });
      const res = mockResponse();

      (UserService.createUser as jest.Mock).mockRejectedValue(
        new Error('E11000 duplicate key error')
      );

      await authController.registerUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El email ya está registrado',
      });
    });
  });

  describe('loginUser', () => {
    it('debería hacer login exitosamente sin 2FA', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();

      const comparePasswordMock = jest.fn().mockResolvedValue(true);
      const user = {
        ...mockUser,
        _id: mockObjectId(),
        auth: {
          email: 'test@example.com',
          password: 'hashed_password',
          twoFactorEnabled: false,
        },
        comparePassword: comparePasswordMock,
      };

      const mockDevice = {
        _id: mockObjectId(),
        userId: user._id,
        token: 'test-token',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });
      (jwt.sign as jest.Mock).mockReturnValue('test-token');
      (DeviceService.registerDevice as jest.Mock).mockResolvedValue(mockDevice);
      (AuditLogService.logLoginSuccess as jest.Mock).mockResolvedValue(undefined);

      await authController.loginUser(req as any, res as any);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ 'auth.email': 'test@example.com' }, { 'auth.username': 'test@example.com' }],
      });
      expect(comparePasswordMock).toHaveBeenCalledWith('password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'test-token',
          user: expect.any(Object),
          deviceId: expect.any(Object),
          expiresIn: expect.any(Number),
        })
      );
    });

    it('debería rechazar login con credenciales inválidas', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });
      const res = mockResponse();

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      (AuditLogService.logLoginFailure as jest.Mock).mockResolvedValue(undefined);

      await authController.loginUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciales inválidas',
      });
    });

    it('debería requerir 2FA cuando está habilitado', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();

      const comparePasswordMock = jest.fn().mockResolvedValue(true);
      const user = {
        ...mockUser,
        _id: mockObjectId(),
        auth: {
          email: 'test@example.com',
          password: 'hashed_password',
          twoFactorEnabled: true,
          twoFactorSecret: 'secret123',
        },
        comparePassword: comparePasswordMock,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await authController.loginUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        requiresTwoFactor: true,
        message: 'Se requiere código de autenticación de dos factores',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('debería retornar el usuario actual', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      await authController.getCurrentUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.auth.email,
        })
      );
    });

    it('debería manejar usuario no encontrado', async () => {
      const req = mockRequest({
        user: undefined,
      });
      const res = mockResponse();

      await authController.getCurrentUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuario no encontrado',
      });
    });
  });
});
