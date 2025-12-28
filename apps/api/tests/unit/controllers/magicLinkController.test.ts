import { magicLinkController } from '../../../src/controllers/magicLinkController';
import { MagicLinkService } from '../../../src/services/MagicLinkService';
import { DeviceService } from '../../../src/services/DeviceService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockDevice } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/MagicLinkService');
jest.mock('../../../src/services/DeviceService');

describe('magicLinkController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMagicLink', () => {
    it('debería crear magic link exitosamente', async () => {
      const req = mockRequest({
        body: { email: 'test@example.com' },
      });
      const res = mockResponse();

      (MagicLinkService.createMagicLink as jest.Mock).mockResolvedValue(undefined);

      await magicLinkController.createMagicLink(req as any, res as any);

      expect(MagicLinkService.createMagicLink).toHaveBeenCalledWith(
        'test@example.com',
        req
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Si el email existe, se ha enviado un enlace de acceso seguro',
      });
    });

    it('debería retornar 400 si no se proporciona email', async () => {
      const req = mockRequest({
        body: {},
      });
      const res = mockResponse();

      await magicLinkController.createMagicLink(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email requerido' });
    });

    it('debería retornar mensaje genérico incluso si hay error', async () => {
      const req = mockRequest({
        body: { email: 'nonexistent@example.com' },
      });
      const res = mockResponse();

      (MagicLinkService.createMagicLink as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      await magicLinkController.createMagicLink(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Si el email existe, se ha enviado un enlace de acceso seguro',
      });
    });
  });

  describe('verifyMagicLink', () => {
    it('debería verificar magic link exitosamente', async () => {
      const req = mockRequest({
        body: { token: 'valid-magic-token' },
      });
      const res = mockResponse();

      const mockJwtToken = 'jwt-token-123';

      (MagicLinkService.verifyMagicLink as jest.Mock).mockResolvedValue({
        user: mockUser,
        jwtToken: mockJwtToken,
      });

      (DeviceService.registerDevice as jest.Mock).mockResolvedValue(mockDevice);

      await magicLinkController.verifyMagicLink(req as any, res as any);

      expect(MagicLinkService.verifyMagicLink).toHaveBeenCalledWith('valid-magic-token');
      expect(DeviceService.registerDevice).toHaveBeenCalledWith(
        mockUser._id.toString(),
        req,
        mockJwtToken
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: mockJwtToken,
          user: expect.objectContaining({
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.auth.email,
          }),
          deviceId: mockDevice._id,
          expiresIn: 7 * 24 * 3600,
          message: 'Autenticación exitosa',
        })
      );
    });

    it('debería incluir información de residente si aplica', async () => {
      const residentUser = {
        ...mockUser,
        role: 'residente',
        apartment: 'A101',
        tel: '555-1234',
      };

      const req = mockRequest({
        body: { token: 'valid-magic-token' },
      });
      const res = mockResponse();

      const mockJwtToken = 'jwt-token-123';

      (MagicLinkService.verifyMagicLink as jest.Mock).mockResolvedValue({
        user: residentUser,
        jwtToken: mockJwtToken,
      });

      (DeviceService.registerDevice as jest.Mock).mockResolvedValue(mockDevice);

      await magicLinkController.verifyMagicLink(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            apartment: 'A101',
            tel: '555-1234',
          }),
        })
      );
    });

    it('debería retornar 400 si no se proporciona token', async () => {
      const req = mockRequest({
        body: {},
      });
      const res = mockResponse();

      await magicLinkController.verifyMagicLink(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
    });

    it('debería retornar 400 si el token es inválido', async () => {
      const req = mockRequest({
        body: { token: 'invalid-token' },
      });
      const res = mockResponse();

      (MagicLinkService.verifyMagicLink as jest.Mock).mockRejectedValue(
        new Error('Token inválido')
      );

      await magicLinkController.verifyMagicLink(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    });

    it('debería manejar errores de token expirado', async () => {
      const req = mockRequest({
        body: { token: 'expired-token' },
      });
      const res = mockResponse();

      (MagicLinkService.verifyMagicLink as jest.Mock).mockRejectedValue(
        new Error('Enlace expirado')
      );

      await magicLinkController.verifyMagicLink(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Enlace expirado' });
    });
  });

  describe('revokeUserLinks', () => {
    it('debería revocar todos los enlaces del usuario', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      (MagicLinkService.revokeUserLinks as jest.Mock).mockResolvedValue(undefined);

      await magicLinkController.revokeUserLinks(req as any, res as any);

      expect(MagicLinkService.revokeUserLinks).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos los enlaces de acceso han sido revocados',
      });
    });

    it('debería retornar 401 si el usuario no está autenticado', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await magicLinkController.revokeUserLinks(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('debería manejar errores al revocar enlaces', async () => {
      const req = mockRequest({
        user: mockUser,
      });
      const res = mockResponse();

      (MagicLinkService.revokeUserLinks as jest.Mock).mockRejectedValue(
        new Error('Error al revocar enlaces')
      );

      await magicLinkController.revokeUserLinks(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al revocar enlaces' });
    });
  });
});
