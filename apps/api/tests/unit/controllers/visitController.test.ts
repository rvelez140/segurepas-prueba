import { visitController } from '../../../src/controllers/visitController';
import { VisitService } from '../../../src/services/VisitService';
import { AccessListService } from '../../../src/services/AccessListService';
import { StorageService } from '../../../src/services/StorageService';
import { OCRService } from '../../../src/services/OCRService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockVisit, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/VisitService');
jest.mock('../../../src/services/AccessListService');
jest.mock('../../../src/services/StorageService');
jest.mock('../../../src/services/OCRService');

describe('visitController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authorizeVisit', () => {
    it('debería autorizar una visita exitosamente', async () => {
      const req = mockRequest({
        body: {
          name: 'Juan Pérez',
          email: 'juan@test.com',
          document: '12345678',
          resident: mockObjectId(),
          reason: 'Visita social',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (VisitService.createVisit as jest.Mock).mockResolvedValue(mockVisit);

      await visitController.authorizeVisit(req as any, res as any, next);

      expect(AccessListService.isBlacklisted).toHaveBeenCalledWith('12345678');
      expect(VisitService.createVisit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Visita registrada con éxito',
        data: mockVisit,
      });
    });

    it('debería rechazar visita si el documento está en lista negra', async () => {
      const req = mockRequest({
        body: {
          name: 'Juan Pérez',
          email: 'juan@test.com',
          document: '12345678',
          resident: mockObjectId(),
          reason: 'Visita social',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (AccessListService.isBlacklisted as jest.Mock).mockResolvedValue(true);

      await visitController.authorizeVisit(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El documento está en lista negra. No se puede autorizar la visita.',
        document: '12345678',
      });
    });

    it('debería manejar errores al autorizar visita', async () => {
      const req = mockRequest({
        body: {
          name: 'Juan Pérez',
          document: '12345678',
        },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (AccessListService.isBlacklisted as jest.Mock).mockRejectedValue(error);

      await visitController.authorizeVisit(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('registerEntry', () => {
    it('debería registrar entrada de visita exitosamente', async () => {
      const req = mockRequest({
        body: {
          qrId: 'test-qr-id',
          guardId: mockObjectId(),
          note: 'Entrada sin problemas',
        },
        query: {
          status: 'en_progreso',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.registerEntry as jest.Mock).mockResolvedValue(mockVisit);

      await visitController.registerEntry(req as any, res as any, next);

      expect(VisitService.registerEntry).toHaveBeenCalledWith(
        'test-qr-id',
        expect.anything(),
        'en_progreso',
        'Entrada sin problemas'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Entrada registrada con éxito',
        data: mockVisit,
      });
    });

    it('debería retornar 404 si la visita no se encuentra', async () => {
      const req = mockRequest({
        body: {
          qrId: 'test-qr-id',
          guardId: mockObjectId(),
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.registerEntry as jest.Mock).mockResolvedValue(null);

      await visitController.registerEntry(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });

    it('debería manejar errores al registrar entrada', async () => {
      const req = mockRequest({
        body: {
          qrId: 'test-qr-id',
          guardId: mockObjectId(),
        },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (VisitService.registerEntry as jest.Mock).mockRejectedValue(error);

      await visitController.registerEntry(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('registerExit', () => {
    it('debería registrar salida de visita exitosamente', async () => {
      const req = mockRequest({
        body: {
          qrId: 'test-qr-id',
          guardId: mockObjectId(),
          note: 'Salida normal',
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.registerExit as jest.Mock).mockResolvedValue(mockVisit);

      await visitController.registerExit(req as any, res as any, next);

      expect(VisitService.registerExit).toHaveBeenCalledWith(
        'test-qr-id',
        expect.anything(),
        'Salida normal'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Salida registrada con éxito',
        data: mockVisit,
      });
    });

    it('debería retornar 404 si la visita no se encuentra', async () => {
      const req = mockRequest({
        body: {
          qrId: 'test-qr-id',
          guardId: mockObjectId(),
        },
      });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.registerExit as jest.Mock).mockResolvedValue(null);

      await visitController.registerExit(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });

    it('debería manejar errores al registrar salida', async () => {
      const req = mockRequest({
        body: {
          qrId: 'test-qr-id',
          guardId: mockObjectId(),
        },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (VisitService.registerExit as jest.Mock).mockRejectedValue(error);

      await visitController.registerExit(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllVisits', () => {
    it('debería obtener todas las visitas exitosamente', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const mockVisits = [mockVisit, { ...mockVisit, _id: mockObjectId() }];

      (VisitService.getAllVisits as jest.Mock).mockResolvedValue(mockVisits);

      await visitController.getAllVisits(req as any, res as any, next);

      expect(VisitService.getAllVisits).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisits);
    });

    it('debería manejar errores al obtener visitas', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (VisitService.getAllVisits as jest.Mock).mockRejectedValue(error);

      await visitController.getAllVisits(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getVisitById', () => {
    it('debería obtener una visita por ID', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({ params: { id: visitId } });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.getVisitById as jest.Mock).mockResolvedValue(mockVisit);

      await visitController.getVisitById(req as any, res as any, next);

      expect(VisitService.getVisitById).toHaveBeenCalledWith(visitId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisit);
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({ params: { id: visitId } });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.getVisitById as jest.Mock).mockResolvedValue(null);

      await visitController.getVisitById(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });

    it('debería manejar errores', async () => {
      const visitId = mockObjectId().toString();
      const req = mockRequest({ params: { id: visitId } });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Database error');

      (VisitService.getVisitById as jest.Mock).mockRejectedValue(error);

      await visitController.getVisitById(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getVisitByQR', () => {
    it('debería obtener una visita por código QR', async () => {
      const qrId = 'test-qr-id';
      const req = mockRequest({ params: { qrId } });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.getVisitByQR as jest.Mock).mockResolvedValue(mockVisit);

      await visitController.getVisitByQR(req as any, res as any, next);

      expect(VisitService.getVisitByQR).toHaveBeenCalledWith(qrId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisit);
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const qrId = 'test-qr-id';
      const req = mockRequest({ params: { qrId } });
      const res = mockResponse();
      const next = jest.fn();

      (VisitService.getVisitByQR as jest.Mock).mockResolvedValue(null);

      await visitController.getVisitByQR(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });
  });

  describe('uploadVisitImage', () => {
    it('debería subir imagen de visita exitosamente', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const updatedVisits = [mockVisit];

      (StorageService.uploadVisitImage as jest.Mock).mockResolvedValue(updatedVisits);

      await visitController.uploadVisitImage(req as any, res as any, next);

      expect(StorageService.uploadVisitImage).toHaveBeenCalledWith(document, expect.any(Buffer));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen de visita actualizada con éxito',
        data: updatedVisits,
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      await visitController.uploadVisitImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó ninguna imagen' });
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      (StorageService.uploadVisitImage as jest.Mock).mockResolvedValue([]);

      await visitController.uploadVisitImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });

    it('debería manejar errores al subir imagen', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Storage error');

      (StorageService.uploadVisitImage as jest.Mock).mockRejectedValue(error);

      await visitController.uploadVisitImage(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadVehicleImage', () => {
    it('debería subir imagen de vehículo exitosamente', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const updatedVisits = [mockVisit];

      (StorageService.uploadVehicleImage as jest.Mock).mockResolvedValue(updatedVisits);

      await visitController.uploadVehicleImage(req as any, res as any, next);

      expect(StorageService.uploadVehicleImage).toHaveBeenCalledWith(document, expect.any(Buffer));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen de vehículo actualizada con éxito',
        data: updatedVisits,
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      await visitController.uploadVehicleImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó ninguna imagen' });
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      (StorageService.uploadVehicleImage as jest.Mock).mockResolvedValue(null);

      await visitController.uploadVehicleImage(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });
  });

  describe('processImageOCR', () => {
    it('debería procesar imagen con OCR exitosamente', async () => {
      const req = mockRequest({
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const ocrResult = {
        type: 'cedula',
        extractedValue: '12345678',
        confidence: 0.95,
      };

      (OCRService.processImage as jest.Mock).mockResolvedValue(ocrResult);

      await visitController.processImageOCR(req as any, res as any, next);

      expect(OCRService.processImage).toHaveBeenCalledWith(expect.any(Buffer));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen procesada con éxito',
        data: ocrResult,
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      await visitController.processImageOCR(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó ninguna imagen' });
    });

    it('debería manejar errores de OCR', async () => {
      const req = mockRequest({
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('OCR error');

      (OCRService.processImage as jest.Mock).mockRejectedValue(error);

      await visitController.processImageOCR(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadVisitImageWithOCR', () => {
    it('debería subir imagen y procesar OCR para cédula', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const ocrResult = {
        type: 'cedula',
        extractedValue: '12345678',
        confidence: 0.95,
      };

      const updatedVisits = [mockVisit];

      (OCRService.processImage as jest.Mock).mockResolvedValue(ocrResult);
      (OCRService.isValidCedula as jest.Mock).mockReturnValue(true);
      (OCRService.formatCedula as jest.Mock).mockReturnValue('12345678');
      (StorageService.uploadVisitImage as jest.Mock).mockResolvedValue(updatedVisits);

      await visitController.uploadVisitImageWithOCR(req as any, res as any, next);

      expect(OCRService.processImage).toHaveBeenCalledWith(expect.any(Buffer));
      expect(StorageService.uploadVisitImage).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen de visita actualizada con éxito',
        data: updatedVisits,
        ocr: ocrResult,
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      await visitController.uploadVisitImageWithOCR(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó ninguna imagen' });
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const ocrResult = {
        type: 'cedula',
        extractedValue: '12345678',
        confidence: 0.95,
      };

      (OCRService.processImage as jest.Mock).mockResolvedValue(ocrResult);
      (StorageService.uploadVisitImage as jest.Mock).mockResolvedValue([]);

      await visitController.uploadVisitImageWithOCR(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });
  });

  describe('uploadVehicleImageWithOCR', () => {
    it('debería subir imagen de vehículo y procesar OCR para placa', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const ocrResult = {
        type: 'placa',
        extractedValue: 'ABC123',
        confidence: 0.92,
      };

      const updatedVisits = [mockVisit];

      (OCRService.processImage as jest.Mock).mockResolvedValue(ocrResult);
      (OCRService.isValidPlaca as jest.Mock).mockReturnValue(true);
      (OCRService.formatPlaca as jest.Mock).mockReturnValue('ABC123');
      (StorageService.uploadVehicleImage as jest.Mock).mockResolvedValue(updatedVisits);
      (VisitService.updateVisitsByDocument as jest.Mock).mockResolvedValue(undefined);

      await visitController.uploadVehicleImageWithOCR(req as any, res as any, next);

      expect(OCRService.processImage).toHaveBeenCalledWith(expect.any(Buffer));
      expect(StorageService.uploadVehicleImage).toHaveBeenCalled();
      expect(VisitService.updateVisitsByDocument).toHaveBeenCalledWith(document, {
        'visit.vehiclePlate': 'ABC123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Imagen de vehículo actualizada con éxito',
        data: updatedVisits,
        ocr: ocrResult,
      });
    });

    it('debería rechazar si no se proporciona imagen', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
      });
      const res = mockResponse();
      const next = jest.fn();

      await visitController.uploadVehicleImageWithOCR(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó ninguna imagen' });
    });

    it('debería retornar 404 si la visita no existe', async () => {
      const document = '12345678';
      const req = mockRequest({
        params: { document },
        file: { buffer: Buffer.from('test-image') },
      });
      const res = mockResponse();
      const next = jest.fn();

      const ocrResult = {
        type: 'placa',
        extractedValue: 'ABC123',
        confidence: 0.92,
      };

      (OCRService.processImage as jest.Mock).mockResolvedValue(ocrResult);
      (StorageService.uploadVehicleImage as jest.Mock).mockResolvedValue(null);

      await visitController.uploadVehicleImageWithOCR(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visita no encontrada' });
    });
  });
});
