import { VisitService } from '../../../src/services/VisitService';
import { Visit } from '../../../src/models/Visit';
import { UserService } from '../../../src/services/UserService';
import { IVisitInput, VisitState } from '../../../src/interfaces/IVisit';
import { Types } from 'mongoose';

// Mock de modelos y servicios
jest.mock('../../../src/models/Visit');
jest.mock('../../../src/services/UserService');
jest.mock('../../../src/services/NotificationService');

describe('VisitService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVisit', () => {
    it('debería crear una visita exitosamente', async () => {
      const mockResident = {
        _id: new Types.ObjectId(),
        name: 'Juan Pérez',
        role: 'residente',
        apartment: '101',
      };

      const mockVisitData: IVisitInput = {
        authorization: {
          resident: mockResident._id,
          state: VisitState.PENDING,
          date: new Date(),
        },
        visit: {
          name: 'Visitante Prueba',
          document: '12345678',
          licensePlate: 'ABC123',
        },
      };

      (UserService.findById as jest.Mock) = jest.fn().mockResolvedValue(mockResident);

      (Visit.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      const mockCreatedVisit = {
        ...mockVisitData,
        qrId: 'QR123456',
        populate: jest.fn().mockResolvedValue({
          ...mockVisitData,
          qrId: 'QR123456',
          authorization: {
            ...mockVisitData.authorization,
            resident: mockResident,
          },
        }),
      };

      (Visit.create as jest.Mock) = jest.fn().mockResolvedValue(mockCreatedVisit);

      const result = await VisitService.createVisit(mockVisitData);

      expect(UserService.findById).toHaveBeenCalledWith(mockResident._id);
      expect(Visit.findOne).toHaveBeenCalled();
      expect(Visit.create).toHaveBeenCalled();
    });

    it('debería lanzar error si el residente no existe', async () => {
      const mockVisitData: IVisitInput = {
        authorization: {
          resident: new Types.ObjectId(),
          state: VisitState.PENDING,
          date: new Date(),
        },
        visit: {
          name: 'Visitante Prueba',
          document: '12345678',
          licensePlate: 'ABC123',
        },
      };

      (UserService.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(VisitService.createVisit(mockVisitData)).rejects.toThrow(
        'Usuario no válido'
      );
    });

    it('debería lanzar error si ya existe una visita activa con el mismo documento', async () => {
      const mockResident = {
        _id: new Types.ObjectId(),
        name: 'Juan Pérez',
        role: 'residente',
      };

      const mockVisitData: IVisitInput = {
        authorization: {
          resident: mockResident._id,
          state: VisitState.PENDING,
          date: new Date(),
        },
        visit: {
          name: 'Visitante Prueba',
          document: '12345678',
          licensePlate: 'ABC123',
        },
      };

      const existingVisit = {
        _id: new Types.ObjectId(),
        ...mockVisitData,
      };

      (UserService.findById as jest.Mock) = jest.fn().mockResolvedValue(mockResident);
      (Visit.findOne as jest.Mock) = jest.fn().mockResolvedValue(existingVisit);

      await expect(VisitService.createVisit(mockVisitData)).rejects.toThrow(
        `Ya existe una visita activa con el documento ${mockVisitData.visit.document}`
      );
    });
  });

  describe('generateQRId', () => {
    it('debería generar un ID de QR válido', () => {
      const qrId = VisitService.generateQRId();

      expect(qrId).toBeDefined();
      expect(typeof qrId).toBe('string');
      expect(qrId.length).toBeGreaterThan(0);
    });
  });
});
