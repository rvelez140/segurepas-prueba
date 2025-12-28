import { twoFactorController } from '../../../src/controllers/twoFactorController';
import { TwoFactorService } from '../../../src/services/TwoFactorService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/TwoFactorService');

describe('twoFactorController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSecret', () => {
    it('debería generar secreto 2FA exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      const secretData = {
        secret: 'test-secret-base32',
        otpauthUrl: 'otpauth://totp/TestApp:test@example.com?secret=test-secret-base32',
        qrCode: 'data:image/png;base64,test-qr-code',
      };

      (TwoFactorService.generateSecret as jest.Mock).mockResolvedValue(secretData);

      await twoFactorController.generateSecret(req as any, res as any);

      expect(TwoFactorService.generateSecret).toHaveBeenCalledWith(mockUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        secret: secretData.secret,
        otpauthUrl: secretData.otpauthUrl,
        qrCode: secretData.qrCode,
        message: 'Escanea el código QR con Google Authenticator',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await twoFactorController.generateSecret(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al generar secreto', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      (TwoFactorService.generateSecret as jest.Mock).mockRejectedValue(
        new Error('Error generando secreto')
      );

      await twoFactorController.generateSecret(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error generando secreto' });
    });
  });

  describe('enable2FA', () => {
    it('debería habilitar 2FA exitosamente', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          secret: 'test-secret-base32',
          token: '123456',
        },
      });
      const res = mockResponse();

      const updatedUser = {
        ...mockUser,
        auth: {
          ...mockUser.auth,
          twoFactorEnabled: true,
        },
        backupCodes: ['code1', 'code2', 'code3'],
      };

      (TwoFactorService.enable2FA as jest.Mock).mockResolvedValue(updatedUser);

      await twoFactorController.enable2FA(req as any, res as any);

      expect(TwoFactorService.enable2FA).toHaveBeenCalledWith(
        mockUser._id.toString(),
        'test-secret-base32',
        '123456'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Autenticación de dos factores habilitada exitosamente',
        backupCodes: ['code1', 'code2', 'code3'],
        warning: 'Guarda estos códigos de respaldo en un lugar seguro',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        body: {
          secret: 'test-secret',
          token: '123456',
        },
      });
      const res = mockResponse();

      await twoFactorController.enable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si falta el secreto o token', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          secret: 'test-secret',
        },
      });
      const res = mockResponse();

      await twoFactorController.enable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Secreto y token son requeridos' });
    });

    it('debería manejar token inválido', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {
          secret: 'test-secret-base32',
          token: '000000',
        },
      });
      const res = mockResponse();

      (TwoFactorService.enable2FA as jest.Mock).mockRejectedValue(
        new Error('Token inválido')
      );

      await twoFactorController.enable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    });
  });

  describe('disable2FA', () => {
    it('debería deshabilitar 2FA exitosamente', async () => {
      const userWithPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const req = mockRequest({
        user: userWithPassword,
        body: {
          password: 'correctpassword',
        },
      });
      const res = mockResponse();

      (TwoFactorService.disable2FA as jest.Mock).mockResolvedValue(undefined);

      await twoFactorController.disable2FA(req as any, res as any);

      expect(userWithPassword.comparePassword).toHaveBeenCalledWith('correctpassword');
      expect(TwoFactorService.disable2FA).toHaveBeenCalledWith(mockUser._id.toString());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Autenticación de dos factores deshabilitada',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest({
        body: {
          password: 'password',
        },
      });
      const res = mockResponse();

      await twoFactorController.disable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si no se proporciona contraseña', async () => {
      const req = mockRequest({
        user: mockUser,
        body: {},
      });
      const res = mockResponse();

      await twoFactorController.disable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contraseña requerida para deshabilitar 2FA',
      });
    });

    it('debería retornar 401 si la contraseña es incorrecta', async () => {
      const userWithPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      const req = mockRequest({
        user: userWithPassword,
        body: {
          password: 'wrongpassword',
        },
      });
      const res = mockResponse();

      await twoFactorController.disable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contraseña incorrecta' });
    });

    it('debería manejar errores al deshabilitar 2FA', async () => {
      const userWithPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const req = mockRequest({
        user: userWithPassword,
        body: {
          password: 'correctpassword',
        },
      });
      const res = mockResponse();

      (TwoFactorService.disable2FA as jest.Mock).mockRejectedValue(
        new Error('Error deshabilitando 2FA')
      );

      await twoFactorController.disable2FA(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deshabilitando 2FA' });
    });
  });

  describe('regenerateBackupCodes', () => {
    it('debería regenerar códigos de respaldo exitosamente', async () => {
      const userWith2FA = {
        ...mockUser,
        auth: {
          ...mockUser.auth,
          twoFactorEnabled: true,
        },
      };

      const req = mockRequest({
        user: userWith2FA,
      });
      const res = mockResponse();

      const newBackupCodes = ['newcode1', 'newcode2', 'newcode3'];

      (TwoFactorService.regenerateBackupCodes as jest.Mock).mockResolvedValue(newBackupCodes);

      await twoFactorController.regenerateBackupCodes(req as any, res as any);

      expect(TwoFactorService.regenerateBackupCodes).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        backupCodes: newBackupCodes,
        message: 'Códigos de respaldo regenerados',
        warning: 'Los códigos anteriores ya no son válidos',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await twoFactorController.regenerateBackupCodes(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería retornar 400 si 2FA no está habilitado', async () => {
      const userWithout2FA = {
        ...mockUser,
        auth: {
          ...mockUser.auth,
          twoFactorEnabled: false,
        },
      };

      const req = mockRequest({
        user: userWithout2FA,
      });
      const res = mockResponse();

      await twoFactorController.regenerateBackupCodes(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: '2FA no está habilitado' });
    });

    it('debería manejar errores al regenerar códigos', async () => {
      const userWith2FA = {
        ...mockUser,
        auth: {
          ...mockUser.auth,
          twoFactorEnabled: true,
        },
      };

      const req = mockRequest({
        user: userWith2FA,
      });
      const res = mockResponse();

      (TwoFactorService.regenerateBackupCodes as jest.Mock).mockRejectedValue(
        new Error('Error regenerando códigos')
      );

      await twoFactorController.regenerateBackupCodes(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error regenerando códigos' });
    });
  });

  describe('check2FAStatus', () => {
    it('debería retornar estado de 2FA habilitado', async () => {
      const userWith2FA = {
        ...mockUser,
        auth: {
          ...mockUser.auth,
          twoFactorEnabled: true,
        },
      };

      const req = mockRequest({
        user: userWith2FA,
      });
      const res = mockResponse();

      await twoFactorController.check2FAStatus(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        twoFactorEnabled: true,
      });
    });

    it('debería retornar estado de 2FA deshabilitado', async () => {
      const userWithout2FA = {
        ...mockUser,
        auth: {
          ...mockUser.auth,
          twoFactorEnabled: false,
        },
      };

      const req = mockRequest({
        user: userWithout2FA,
      });
      const res = mockResponse();

      await twoFactorController.check2FAStatus(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        twoFactorEnabled: false,
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await twoFactorController.check2FAStatus(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al verificar estado', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      // Forzar un error simulando que user.auth es undefined
      const userWithError = {
        ...mockUser,
        auth: undefined,
      };

      const reqWithError = mockRequest({
        user: userWithError,
      });

      await twoFactorController.check2FAStatus(reqWithError as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
