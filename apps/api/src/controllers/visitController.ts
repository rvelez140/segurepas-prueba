import { Request, Response, NextFunction } from 'express';
import { VisitService } from '../services/VisitService';
import { IVisit, IVisitInput, VisitState } from '../interfaces/IVisit';
import { Types } from 'mongoose';
import { notificationService } from '../services/NotificationService';
import { UserService } from '../services/UserService';
import { IUser } from '../interfaces/IUser';
import { ReportService } from '../services/ReportService';
import { StorageService } from '../services/StorageService';
import { OCRService } from '../services/OCRService';
import { AccessListService } from '../services/AccessListService';

export const visitController = {
  async authorizeVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, email, document, visitImage, vehicleImage, resident, reason } = req.body;
    try {
      // Verificar si el documento está en lista negra
      const isBlacklisted = await AccessListService.isBlacklisted(document);
      if (isBlacklisted) {
        res.status(403).json({
          error: 'El documento está en lista negra. No se puede autorizar la visita.',
          document,
        });
        return;
      }

      const visitData = {
        visit: { name, email, document, visitImage, vehicleImage },
        authorization: { resident, reason },
      } as IVisitInput;

      const newVisit = await VisitService.createVisit(visitData);
      res.status(201).json({ message: 'Visita registrada con éxito', data: newVisit });
    } catch (error) {
      console.error('Error registrando entrada:', error);
      next(error);
    }
  },

  async registerEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qrId, guardId, note } = req.body;
      const { status } = req.query;
      const visit = await VisitService.registerEntry(
        qrId as string,
        guardId as Types.ObjectId,
        status as VisitState,
        note
      );
      if (!visit) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }
      res.status(200).json({ message: 'Entrada registrada con éxito', data: visit });
    } catch (error) {
      console.error('Error registrando entrada:', error);
      next(error);
    }
  },

  async registerExit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qrId, guardId, note } = req.body;
      const visit = await VisitService.registerExit(
        qrId as string,
        guardId as Types.ObjectId,
        note
      );
      if (!visit) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }
      res.status(200).json({ message: 'Salida registrada con éxito', data: visit });
    } catch (error) {
      console.error('Error registrando salida:', error);
      next(error);
    }
  },

  async getAllVisits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const visits = await VisitService.getAllVisits();

      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  async getVisitById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const visit = await VisitService.getVisitById(id);

      if (!visit) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }
      res.status(200).json(visit);
    } catch (error) {
      next(error);
    }
  },

  async getVisitByQR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qrId } = req.params;
      const visit = await VisitService.getVisitByQR(qrId);

      if (!visit) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }
      res.status(200).json(visit);
    } catch (error) {
      next(error);
    }
  },

  async updateVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      const data = req.body;

      const updatedVisit = await VisitService.updateVisitData(document, data);
      if (!updatedVisit) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }

      res.status(200).json({ message: 'Visita actualizada con éxito', data: updatedVisit });
    } catch (error) {
      next(error);
    }
  },

  async updateVisitStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const updatedVisit = await VisitService.updateVisitStatus(id, status as VisitState);

      if (!updatedVisit) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }

      res.status(200).json({ message: 'Estado actualizado', data: updatedVisit });
    } catch (error) {
      next(error);
    }
  },

  async deleteVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await VisitService.deleteVisit(id);
      res.status(200).json({ message: 'Visita eliminada con éxito' });
    } catch (error) {
      next(error);
    }
  },

  async getVisitsByResident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { residentId } = req.params;
      const visits = await VisitService.getVisitsByResident(residentId);
      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  async getVisitsByGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { guardId } = req.params;
      const visits = await VisitService.getVisitsByGuard(guardId);
      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  async getLatestVisitByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      const visit = await VisitService.getLatestVisitByDocument(document);

      if (!visit) {
        res.status(404).json({ message: 'No se encontraron visitas con este documento' });
        return;
      }

      res.status(200).json(visit);
    } catch (error) {
      next(error);
    }
  },

  async getAllLatestVisitsGroupedByDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const visits = await VisitService.getAllLatestVisitsGroupedByDocument();
      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  async getVisitsByResidentGroupedByDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { residentId } = req.params;
      const visits = await VisitService.getVisitsByResidentGroupedByDocument(residentId);
      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  async notifyVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const visit = (await VisitService.getVisitById(id)) as IVisit;
      const resident = (await UserService.findById(visit.authorization.resident)) as IUser;
      const notification = await notificationService.sendVisitNotification(
        resident.auth.email,
        visit.visit.email,
        visit
      );
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  },

  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start, end, resident, guard } = req.query;
      const startDate = new Date(start as string);
      const endDate = end ? new Date(end as string) : undefined;

      const myResident = resident ? await UserService.findById(resident as string) : null;
      const myGuard = guard ? await UserService.findById(guard as string) : null;

      const report = await ReportService.generateReport(startDate, endDate, myResident, myGuard);

      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  },

  async uploadVisitImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      if (!req.file?.buffer) {
        res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        return;
      }

      const updatedVisits = await StorageService.uploadVisitImage(document, req.file.buffer);

      if (!updatedVisits || updatedVisits.length === 0) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Imagen de visita actualizada con éxito',
        data: updatedVisits,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadVehicleImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      if (!req.file?.buffer) {
        res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        return;
      }

      const updatedVisits = await StorageService.uploadVehicleImage(document, req.file.buffer);

      if (!updatedVisits || updatedVisits.length === 0) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Imagen de vehículo actualizada con éxito',
        data: updatedVisits,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteVisitImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      const result = await StorageService.deleteVisitFolder(document);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteAllVisitsImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (process.env.NODE_ENV !== 'development') {
        res.status(403).json({
          success: false,
          message: 'Esta operación no está permitida en producción',
        });
        return;
      }

      const result = await StorageService.deleteAllVisits();

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async processImageOCR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file?.buffer) {
        res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        return;
      }

      const ocrResult = await OCRService.processImage(req.file.buffer);

      res.status(200).json({
        message: 'Imagen procesada con éxito',
        data: ocrResult,
      });
    } catch (error) {
      console.error('Error procesando imagen con OCR:', error);
      next(error);
    }
  },

  async uploadVisitImageWithOCR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      if (!req.file?.buffer) {
        res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        return;
      }

      // Procesar imagen con OCR
      const ocrResult = await OCRService.processImage(req.file.buffer);

      // Si se detecta una cédula y no se proporcionó documento, usar el extraído
      let finalDocument = document;
      if (
        ocrResult.type === 'cedula' &&
        ocrResult.extractedValue &&
        OCRService.isValidCedula(ocrResult.extractedValue)
      ) {
        finalDocument = OCRService.formatCedula(ocrResult.extractedValue);
      }

      // Subir imagen
      const updatedVisits = await StorageService.uploadVisitImage(finalDocument, req.file.buffer);

      if (!updatedVisits || updatedVisits.length === 0) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Imagen de visita actualizada con éxito',
        data: updatedVisits,
        ocr: ocrResult,
      });
    } catch (error) {
      console.error('Error subiendo imagen con OCR:', error);
      next(error);
    }
  },

  async uploadVehicleImageWithOCR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.params;
      if (!req.file?.buffer) {
        res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        return;
      }

      // Procesar imagen con OCR
      const ocrResult = await OCRService.processImage(req.file.buffer);

      // Subir imagen
      const updatedVisits = await StorageService.uploadVehicleImage(document, req.file.buffer);

      if (!updatedVisits || updatedVisits.length === 0) {
        res.status(404).json({ message: 'Visita no encontrada' });
        return;
      }

      // Si se detectó una placa válida, actualizar el campo vehiclePlate
      if (
        ocrResult.type === 'placa' &&
        ocrResult.extractedValue &&
        OCRService.isValidPlaca(ocrResult.extractedValue)
      ) {
        const formattedPlate = OCRService.formatPlaca(ocrResult.extractedValue);
        // Actualizar todas las visitas con este documento para agregar la placa
        await VisitService.updateVisitsByDocument(document, {
          'visit.vehiclePlate': formattedPlate,
        });
      }

      res.status(200).json({
        message: 'Imagen de vehículo actualizada con éxito',
        data: updatedVisits,
        ocr: ocrResult,
      });
    } catch (error) {
      console.error('Error subiendo imagen de vehículo con OCR:', error);
      next(error);
    }
  },
};
